export type EventCategorySlug =
  | 'birthday'
  | 'anniversary'
  | 'trip'
  | 'movie'
  | 'entertainment'
  | 'festival'
  | 'family_gathering'
  | 'religious_cultural'
  | 'personal_reminder'
  | 'other';

export interface EventCategoryDoc {
  id: string;
  name: string;
  slug: EventCategorySlug | string;
  order: number;
  isDefault: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const DEFAULT_EVENT_CATEGORIES: Omit<EventCategoryDoc, 'createdAt' | 'updatedAt'>[] = [
  { id: 'birthday', name: 'Birthday', slug: 'birthday', order: 1, isDefault: true },
  { id: 'anniversary', name: 'Anniversary', slug: 'anniversary', order: 2, isDefault: true },
  { id: 'trip', name: 'Trip', slug: 'trip', order: 3, isDefault: true },
  { id: 'movie', name: 'Movie', slug: 'movie', order: 4, isDefault: true },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', order: 5, isDefault: true },
  { id: 'festival', name: 'Festival', slug: 'festival', order: 6, isDefault: true },
  { id: 'family_gathering', name: 'Family Gathering', slug: 'family_gathering', order: 7, isDefault: true },
  { id: 'religious_cultural', name: 'Religious / Cultural', slug: 'religious_cultural', order: 8, isDefault: true },
  { id: 'personal_reminder', name: 'Personal Reminder', slug: 'personal_reminder', order: 9, isDefault: true },
  { id: 'other', name: 'Other', slug: 'other', order: 10, isDefault: true },
];

export type EventVisibility = 'public' | 'private';

export interface EventRecurrence {
  type: 'none' | 'yearly';
  /** MM-DD for yearly recurrence matching */
  monthDay?: string;
}

export interface EventCategoryDetails {
  // Birthday
  personName?: string;
  dateOfBirth?: string;
  // Anniversary
  coupleNames?: string;
  anniversaryDate?: string;
  // Trip
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  notes?: string;
  // Movie
  movieName?: string;
  platformOrTheatre?: string;
  // Entertainment
  programmeName?: string;
  location?: string;
  // Festival
  festivalName?: string;
  celebrationDetails?: string;
  // Family Gathering
  venue?: string;
  participants?: string;
  // Religious / Cultural
  occasionName?: string;
  details?: string;
  // Personal Reminder
  reminderTitle?: string;
  reminderDescription?: string;
  // Other
  customTitle?: string;
  customDescription?: string;
}

export interface CalendarEventDoc {
  id: string;
  categoryId: string;
  categorySlug: EventCategorySlug | string;
  categoryName: string;
  /** YYYY-MM-DD */
  eventDate: string;
  title: string;
  malayalamTitle?: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  visibility: EventVisibility;
  startTime?: string;
  endTime?: string;
  recurrence: EventRecurrence;
  details: EventCategoryDetails;
  createdBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FamilyMemberDoc {
  id: string;
  name: string;
  malayalamName?: string;
  role: string;
  initials: string;
  birthDate?: string;
  birthStar?: string;
  notes?: string;
  isPublic: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MemoryDoc {
  id: string;
  title: string;
  malayalamTitle?: string;
  dateLabel: string;
  eventDate?: string;
  note: string;
  imageUrl?: string;
  imagePublicId?: string;
  visibility: EventVisibility;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CalendarSettingsDoc {
  showNakshatram: boolean;
  familyReminders: boolean;
  malayalamNumerals: boolean;
  locationName?: string;
  updatedAt?: unknown;
}

export interface ApplicationSettingsDoc {
  appName: string;
  maxCategories: number;
  updatedAt?: unknown;
}

