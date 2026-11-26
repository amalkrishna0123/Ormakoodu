import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb, ADMIN_UID, ADMIN_EMAIL } from './firebase';
import {
  DEFAULT_EVENT_CATEGORIES,
  type CalendarEventDoc,
  type EventCategoryDoc,
  type FamilyMemberDoc,
  type MemoryAlbum,
  type MemoryDoc,
  type CalendarSettingsDoc,
} from './types';
import type { KeralaOccasion } from './keralaHolidays';

const COLLECTIONS = {
  admins: 'admins',
  events: 'events',
  eventCategories: 'eventCategories',
  familyMembers: 'familyMembers',
  memories: 'memories',
  holidays: 'holidays',
  calendarSettings: 'calendarSettings',
  applicationSettings: 'applicationSettings',
} as const;

// ─── Admin Verification ───────────────────────────────────────────────────────

export async function isAuthorizedAdmin(uid: string, email?: string | null): Promise<boolean> {
  if (!uid) return false;

  // If ADMIN_UID is set, only that exact UID is allowed
  if (ADMIN_UID && uid !== ADMIN_UID) {
    return false;
  }

  // Email-based fast path: if the signed-in email matches ADMIN_EMAIL, allow
  if (ADMIN_EMAIL && email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  try {
    const db = getFirebaseDb();
    const snap = await getDoc(doc(db, COLLECTIONS.admins, uid));
    if (snap.exists()) {
      return snap.data()?.role === 'admin' && snap.data()?.active !== false;
    }
    // Fallback: if ADMIN_UID is explicitly configured and matches, allow
    return Boolean(ADMIN_UID && uid === ADMIN_UID);
  } catch {
    return Boolean(ADMIN_UID && uid === ADMIN_UID);
  }
}

// ─── Realtime Subscriptions ───────────────────────────────────────────────────

export function subscribePublicEvents(
  onData: (events: CalendarEventDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  // NOTE: We intentionally omit orderBy here to avoid requiring a composite
  // index on (visibility, eventDate) that may not be deployed yet.
  // Sorting is done client-side after fetching so this works with only the
  // auto-created single-field index on `visibility`.
  const q = query(
    collection(db, COLLECTIONS.events),
    where('visibility', '==', 'public')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CalendarEventDoc[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CalendarEventDoc, 'id'>),
        }))
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
      onData(items);
    },
    (err) => {
      console.error('[subscribePublicEvents] Firestore error:', err);
      onError?.(err);
    }
  );
}

export function subscribeAllEvents(
  onData: (events: CalendarEventDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTIONS.events),
    orderBy('eventDate', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CalendarEventDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CalendarEventDoc, 'id'>),
      }));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export function subscribeEventCategories(
  onData: (categories: EventCategoryDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTIONS.eventCategories),
    orderBy('order', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_EVENT_CATEGORIES);
        return;
      }
      const items: EventCategoryDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<EventCategoryDoc, 'id'>),
      }));
      onData(items.slice(0, 10));
    },
    (err) => {
      onData(DEFAULT_EVENT_CATEGORIES);
      onError?.(err);
    }
  );
}

export function subscribeHolidays(
  onData: (holidays: KeralaOccasion[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(collection(db, COLLECTIONS.holidays), orderBy('date', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: KeralaOccasion[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<KeralaOccasion, 'id'>),
        source: 'firestore',
      }));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export function subscribePublicFamilyMembers(
  onData: (members: FamilyMemberDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  // Avoid composite index (isPublic + name) — sort client-side instead.
  const q = query(
    collection(db, COLLECTIONS.familyMembers),
    where('isPublic', '==', true)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: FamilyMemberDoc[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FamilyMemberDoc, 'id'>),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      onData(items);
    },
    (err) => {
      console.error('[subscribePublicFamilyMembers] Firestore error:', err);
      onError?.(err);
    }
  );
}

export function subscribeAllFamilyMembers(
  onData: (members: FamilyMemberDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTIONS.familyMembers),
    orderBy('name', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: FamilyMemberDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FamilyMemberDoc, 'id'>),
      }));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export function subscribePublicMemories(
  onData: (memories: MemoryDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  // Avoid composite index (visibility + createdAt) — sort client-side instead.
  const q = query(
    collection(db, COLLECTIONS.memories),
    where('visibility', '==', 'public')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: MemoryDoc[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MemoryDoc, 'id'>),
        }))
        .sort((a, b) => {
          // Sort by createdAt descending (Firestore Timestamp or ISO string)
          const tA = (a.createdAt as { seconds?: number })?.seconds ?? 0;
          const tB = (b.createdAt as { seconds?: number })?.seconds ?? 0;
          return tB - tA;
        });
      onData(items);
    },
    (err) => {
      console.error('[subscribePublicMemories] Firestore error:', err);
      onError?.(err);
    }
  );
}

export function subscribeAllMemories(
  onData: (memories: MemoryDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  const q = query(
    collection(db, COLLECTIONS.memories),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: MemoryDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MemoryDoc, 'id'>),
      }));
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export function subscribeCalendarSettings(
  onData: (settings: CalendarSettingsDoc) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    doc(db, COLLECTIONS.calendarSettings, 'default'),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as CalendarSettingsDoc);
      } else {
        onData({
          showNakshatram: true,
          familyReminders: true,
          malayalamNumerals: true,
          locationName: 'Thrissur, Kerala',
        });
      }
    },
    (err) => onError?.(err)
  );
}

// ─── Admin Write Operations ───────────────────────────────────────────────────

export async function createOrUpdateEvent(
  eventData: Omit<CalendarEventDoc, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const db = getFirebaseDb();
  if (existingId) {
    await updateDoc(doc(db, COLLECTIONS.events, existingId), {
      ...eventData,
      updatedAt: serverTimestamp(),
    });
    return existingId;
  }
  const ref = await addDoc(collection(db, COLLECTIONS.events), {
    ...eventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, COLLECTIONS.events, eventId));
}

export async function seedDefaultCategoriesIfEmpty(): Promise<void> {
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, COLLECTIONS.eventCategories));
  if (!snap.empty) return;
  for (const cat of DEFAULT_EVENT_CATEGORIES) {
    await setDoc(doc(db, COLLECTIONS.eventCategories, cat.id), {
      ...cat,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function saveCategory(
  category: Omit<EventCategoryDoc, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const db = getFirebaseDb();
  const existingSnap = await getDocs(collection(db, COLLECTIONS.eventCategories));
  const exists = existingSnap.docs.some((d) => d.id === category.id);
  if (!exists && existingSnap.size >= 10) {
    throw new Error('Maximum limit of 10 event categories reached.');
  }
  await setDoc(
    doc(db, COLLECTIONS.eventCategories, category.id),
    {
      ...category,
      updatedAt: serverTimestamp(),
      ...(exists ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, COLLECTIONS.eventCategories, categoryId));
}

export async function saveFamilyMember(
  member: Omit<FamilyMemberDoc, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const db = getFirebaseDb();
  if (existingId) {
    await updateDoc(doc(db, COLLECTIONS.familyMembers, existingId), {
      ...member,
      updatedAt: serverTimestamp(),
    });
    return existingId;
  }
  const ref = await addDoc(collection(db, COLLECTIONS.familyMembers), {
    ...member,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteFamilyMember(memberId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, COLLECTIONS.familyMembers, memberId));
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean;
}

export async function saveMemory(
  memory: Omit<MemoryDoc, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const db = getFirebaseDb();
  const payload = stripUndefined(memory as Record<string, unknown>);
  if (existingId) {
    await updateDoc(doc(db, COLLECTIONS.memories, existingId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    return existingId;
  }
  const ref = await addDoc(collection(db, COLLECTIONS.memories), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMemoryFields(
  memoryId: string,
  fields: Partial<Omit<MemoryDoc, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getFirebaseDb();
  const payload = stripUndefined(fields as Record<string, unknown>);
  await updateDoc(doc(db, COLLECTIONS.memories, memoryId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMemory(memoryId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, COLLECTIONS.memories, memoryId));
}

export function subscribeMemoryAlbums(
  onData: (albums: MemoryAlbum[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  return onSnapshot(
    doc(db, COLLECTIONS.calendarSettings, 'memoryAlbums'),
    (snap) => {
      if (snap.exists()) {
        const list = snap.data()?.albums;
        onData(Array.isArray(list) ? (list as MemoryAlbum[]) : []);
      } else {
        onData([]);
      }
    },
    (err) => onError?.(err)
  );
}

export async function saveMemoryAlbums(albums: MemoryAlbum[]): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(
    doc(db, COLLECTIONS.calendarSettings, 'memoryAlbums'),
    {
      albums,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveHoliday(
  holiday: Omit<KeralaOccasion, 'source'>
): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(
    doc(db, COLLECTIONS.holidays, holiday.id),
    {
      ...holiday,
      source: 'firestore',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteHoliday(holidayId: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, COLLECTIONS.holidays, holidayId));
}

export async function saveCalendarSettings(
  settings: CalendarSettingsDoc
): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(
    doc(db, COLLECTIONS.calendarSettings, 'default'),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

