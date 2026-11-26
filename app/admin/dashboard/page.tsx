'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import {
  deleteCategory,
  deleteEvent,
  deleteFamilyMember,
  deleteHoliday,
  deleteMemory,
  isAuthorizedAdmin,
  saveCalendarSettings,
  saveCategory,
  saveFamilyMember,
  saveHoliday,
  saveMemory,
  seedDefaultCategoriesIfEmpty,
  subscribeAllEvents,
  subscribeAllFamilyMembers,
  subscribeAllMemories,
  subscribeCalendarSettings,
  subscribeEventCategories,
  subscribeHolidays,
} from '@/lib/firestoreService';
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from '@/lib/cloudinaryUpload';
import AdminEventForm from '@/components/admin/AdminEventForm';
import MemoriesGallery from '@/components/memories/MemoriesGallery';
import type {
  CalendarEventDoc,
  CalendarSettingsDoc,
  EventCategoryDoc,
  FamilyMemberDoc,
  MemoryDoc,
} from '@/lib/types';
import type { KeralaOccasion } from '@/lib/keralaHolidays';

type AdminTab = 'events' | 'categories' | 'family' | 'memories' | 'holidays' | 'settings';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('events');

  const [events, setEvents] = useState<CalendarEventDoc[]>([]);
  const [categories, setCategories] = useState<EventCategoryDoc[]>([]);
  const [members, setMembers] = useState<FamilyMemberDoc[]>([]);
  const [memories, setMemories] = useState<MemoryDoc[]>([]);
  const [holidays, setHolidays] = useState<KeralaOccasion[]>([]);
  const [settings, setSettings] = useState<CalendarSettingsDoc>({
    showNakshatram: true,
    familyReminders: true,
    malayalamNumerals: true,
  });

  const [editingEvent, setEditingEvent] = useState<CalendarEventDoc | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Category quick form
  const [newCatName, setNewCatName] = useState('');
  // Family quick form
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberStar, setMemberStar] = useState('');
  // Memory quick form
  const [memTitle, setMemTitle] = useState('');
  const [memMlTitle, setMemMlTitle] = useState('');
  const [memDateLabel, setMemDateLabel] = useState('');
  const [memNote, setMemNote] = useState('');
  const [memFile, setMemFile] = useState<File | null>(null);
  // Holiday quick form
  const [holDate, setHolDate] = useState('');
  const [holTitle, setHolTitle] = useState('');
  const [holMlTitle, setHolMlTitle] = useState('');
  const [holIsGov, setHolIsGov] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/admin');
        return;
      }
      const ok = await isAuthorizedAdmin(user.uid);
      if (!ok) {
        await signOut(auth);
        router.replace('/admin');
        return;
      }
      setAuthorized(true);
      setChecking(false);
      await seedDefaultCategoriesIfEmpty().catch(() => {});
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    const u1 = subscribeAllEvents(setEvents);
    const u2 = subscribeEventCategories(setCategories);
    const u3 = subscribeAllFamilyMembers(setMembers);
    const u4 = subscribeAllMemories(setMemories);
    const u5 = subscribeHolidays(setHolidays);
    const u6 = subscribeCalendarSettings(setSettings);
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
    };
  }, [authorized]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.replace('/');
  };

  const handleDeleteEvent = async (ev: CalendarEventDoc) => {
    await deleteEvent(ev.id);
    if (ev.imagePublicId) {
      await deleteImageFromCloudinary(ev.imagePublicId).catch(() => {});
    }
    setStatusMsg(`Deleted event "${ev.title}".`);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const slug = newCatName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');
      await saveCategory({
        id: slug,
        name: newCatName.trim(),
        slug,
        order: categories.length + 1,
        isDefault: false,
      });
      setNewCatName('');
      setStatusMsg('Category saved.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Failed to save category.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) return;
    const parts = memberName.trim().split(/\s+/);
    const initials =
      parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    await saveFamilyMember({
      name: memberName.trim(),
      role: memberRole.trim(),
      initials,
      birthStar: memberStar.trim() || undefined,
      isPublic: true,
    });
    setMemberName('');
    setMemberRole('');
    setMemberStar('');
    setStatusMsg('Family member added.');
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle.trim() || !memDateLabel.trim() || !memNote.trim()) return;
    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;
    if (memFile) {
      const uploaded = await uploadImageToCloudinary(memFile, 'ormakoodu/memories');
      imageUrl = uploaded.secureUrl;
      imagePublicId = uploaded.publicId;
    }
    await saveMemory({
      title: memTitle.trim(),
      malayalamTitle: memMlTitle.trim() || undefined,
      dateLabel: memDateLabel.trim(),
      note: memNote.trim(),
      imageUrl,
      imagePublicId,
      visibility: 'public',
    });
    setMemTitle('');
    setMemMlTitle('');
    setMemDateLabel('');
    setMemNote('');
    setMemFile(null);
    setStatusMsg('Memory added.');
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holDate || !holTitle.trim()) return;
    const year = parseInt(holDate.slice(0, 4), 10);
    const slug = holTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    await saveHoliday({
      id: `${holDate}-${slug}`,
      date: holDate,
      year,
      title: holTitle.trim(),
      malayalamTitle: holMlTitle.trim() || holTitle.trim(),
      isGovernmentHoliday: holIsGov,
      isTraditionalFestival: !holIsGov,
    });
    setHolDate('');
    setHolTitle('');
    setHolMlTitle('');
    setStatusMsg('Holiday saved.');
  };

  if (checking || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <p className="text-sm text-zinc-500">Checking admin authorization…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white px-4 pt-6 pb-28 sm:px-6 lg:px-8"
      style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f7] px-2.5 py-0.5 text-[11px] font-semibold uppercase text-[#c0185a]">
              Ormakoodu Admin
            </span>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              Family Calendar Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Log Out
          </button>
        </div>

        {statusMsg && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
            <span>{statusMsg}</span>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ['events', `Events (${events.length})`],
              ['categories', `Categories (${categories.length}/10)`],
              ['family', `Family (${members.length})`],
              ['memories', `Memories (${memories.length})`],
              ['holidays', `Holidays (${holidays.length})`],
              ['settings', 'Settings'],
            ] as [AdminTab, string][]
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AdminEventForm
              categories={categories}
              editingEvent={editingEvent}
              onSaved={() => {
                setEditingEvent(null);
                setStatusMsg('Event saved successfully.');
              }}
              onCancelEdit={() => setEditingEvent(null)}
            />

            <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-semibold text-zinc-950">
                Scheduled Events
              </h2>
              {events.length === 0 ? (
                <p className="text-xs text-zinc-500">No events created yet.</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {events.map((ev) => (
                    <li key={ev.id} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-950">{ev.title}</p>
                        <p className="text-xs text-zinc-500">
                          {ev.eventDate} · {ev.categoryName} · {ev.visibility}
                          {ev.recurrence?.type === 'yearly' ? ' · Yearly' : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingEvent(ev)}
                          className="text-xs font-medium text-[#c0185a] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="mt-6 max-w-xl space-y-4 rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-semibold text-zinc-950">
              Event Categories (Max 10)
            </h2>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name"
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={categories.length >= 10}
                className="rounded-xl bg-[#e91e8c] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Add
              </button>
            </form>
            <ul className="divide-y divide-zinc-100">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    {cat.name}{' '}
                    <span className="text-xs text-zinc-400">({cat.slug})</span>
                  </span>
                  {!cat.isDefault && (
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Family Tab */}
        {activeTab === 'family' && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <form
              onSubmit={handleAddMember}
              className="space-y-3 rounded-2xl border border-zinc-200 bg-[#fcfbfa] p-5"
            >
              <h2 className="text-base font-semibold text-zinc-950">Add Family Member</h2>
              <input
                type="text"
                required
                placeholder="Name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                required
                placeholder="Role (e.g., Grandfather, Mother)"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Birth Star / Nakshatram (Optional)"
                value={memberStar}
                onChange={(e) => setMemberStar(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#e91e8c] px-4 py-2 text-sm font-semibold text-white"
              >
                Save Member
              </button>
            </form>
            <div className="rounded-2xl border border-zinc-200 p-5">
              <h2 className="text-base font-semibold text-zinc-950">Members</h2>
              <ul className="mt-3 divide-y divide-zinc-100">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>
                      {m.name} <span className="text-xs text-zinc-500">({m.role})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteFamilyMember(m.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Memories Tab */}
        {activeTab === 'memories' && (
          <div className="mt-6">
            <MemoriesGallery />
          </div>
        )}

        {/* Holidays Tab */}
        {activeTab === 'holidays' && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <form
              onSubmit={handleAddHoliday}
              className="space-y-3 rounded-2xl border border-zinc-200 bg-[#fcfbfa] p-5"
            >
              <h2 className="text-base font-semibold text-zinc-950">
                Add / Override Holiday by Year
              </h2>
              <input
                type="date"
                required
                value={holDate}
                onChange={(e) => setHolDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                required
                placeholder="Holiday / Festival title"
                value={holTitle}
                onChange={(e) => setHolTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Malayalam title"
                value={holMlTitle}
                onChange={(e) => setHolMlTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={holIsGov}
                  onChange={(e) => setHolIsGov(e.target.checked)}
                  className="h-4 w-4 accent-[#e91e8c]"
                />
                Official Kerala Government Holiday (Red date)
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#e91e8c] px-4 py-2 text-sm font-semibold text-white"
              >
                Save Holiday
              </button>
            </form>
            <div className="rounded-2xl border border-zinc-200 p-5">
              <h2 className="text-base font-semibold text-zinc-950">
                Custom Firestore Holidays
              </h2>
              <ul className="mt-3 divide-y divide-zinc-100">
                {holidays.map((h) => (
                  <li key={h.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>
                      {h.date} · {h.title}{' '}
                      <span className="text-xs text-zinc-400">
                        ({h.isGovernmentHoliday ? 'Govt Holiday' : 'Festival'})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteHoliday(h.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="mt-6 max-w-lg space-y-4 rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-semibold text-zinc-950">
              Global Calendar Settings
            </h2>
            <label className="flex items-center justify-between text-sm">
              <span>Show Nakshatram Labels</span>
              <input
                type="checkbox"
                checked={settings.showNakshatram}
                onChange={(e) =>
                  saveCalendarSettings({ ...settings, showNakshatram: e.target.checked })
                }
                className="h-4 w-4 accent-[#e91e8c]"
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span>Family Event Reminders</span>
              <input
                type="checkbox"
                checked={settings.familyReminders}
                onChange={(e) =>
                  saveCalendarSettings({ ...settings, familyReminders: e.target.checked })
                }
                className="h-4 w-4 accent-[#e91e8c]"
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span>Malayalam Numerals</span>
              <input
                type="checkbox"
                checked={settings.malayalamNumerals}
                onChange={(e) =>
                  saveCalendarSettings({ ...settings, malayalamNumerals: e.target.checked })
                }
                className="h-4 w-4 accent-[#e91e8c]"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

