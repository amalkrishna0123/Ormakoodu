/**
 * UI Preview Placeholder Data for the Ormakoodu Home Page.
 *
 * NOTE: All items in this file are static placeholder previews for layout
 * and UI demonstration only. They are intentionally kept separate from
 * `lib/calendarData.ts` and any future database / Firebase data sources.
 */

export type EventCategory = 'birthday' | 'anniversary' | 'occasion' | 'celebration';

export interface FamilyEventPreview {
  id: string;
  title: string;
  malayalamTitle: string;
  dateLabel: string;
  malayalamDateLabel: string;
  category: EventCategory;
  familyMember?: string;
  daysUntil: number;
}

export interface FamilyHighlightPreview {
  id: string;
  badge: string;
  title: string;
  malayalamTitle: string;
  subtitle: string;
  dateText: string;
  reminderNote: string;
}

export interface HighlightCarouselItem {
  id: string;
  title: string;
  malayalamTitle: string;
  dateTime: string;
  memberName: string;
  memberInitials: string;
  imageSrc: string;
  imageAlt: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  malayalamLabel: string;
  description: string;
  iconName: 'plus' | 'calendar-days' | 'users' | 'sliders';
  accent?: boolean;
}

export const FAMILY_HIGHLIGHT_PREVIEW: FamilyHighlightPreview = {
  id: 'highlight-next',
  badge: 'Next Family Occasion',
  title: "Amma's 60th Birthday",
  malayalamTitle: 'അമ്മയുടെ ഷഷ്ടിപൂർത്തി',
  subtitle: 'Family lunch & evening prayer at Tharavadu',
  dateText: 'December 6 • 12:30 PM',
  reminderNote: 'Remember to confirm the catering order and share photos in the family album.',
};

export const UPCOMING_EVENTS_PREVIEW: FamilyEventPreview[] = [
  {
    id: 'evt-1',
    title: "Amma's Birthday",
    malayalamTitle: 'അമ്മയുടെ പിറന്നാൾ',
    dateLabel: 'Dec 6',
    malayalamDateLabel: 'വൃശ്ചികം ൨൦',
    category: 'birthday',
    familyMember: 'Lakshmi Amma',
    daysUntil: 11,
  },
  {
    id: 'evt-2',
    title: 'Achan & Amma Anniversary',
    malayalamTitle: 'വിവാഹ വാർഷികം',
    dateLabel: 'Dec 14',
    malayalamDateLabel: 'വൃശ്ചികം ൨൮',
    category: 'anniversary',
    familyMember: 'Raghavan & Lakshmi',
    daysUntil: 19,
  },
  {
    id: 'evt-3',
    title: 'Kuttan’s Choroonu',
    malayalamTitle: 'കുട്ടന്റെ ചോറൂണ്',
    dateLabel: 'Dec 21',
    malayalamDateLabel: 'ധനു ൬',
    category: 'occasion',
    familyMember: 'Baby Aarav',
    daysUntil: 26,
  },
  {
    id: 'evt-4',
    title: 'Year-End Family Get-Together',
    malayalamTitle: 'കുടുംബ സംഗമം',
    dateLabel: 'Dec 28',
    malayalamDateLabel: 'ധനു ൧൩',
    category: 'celebration',
    familyMember: 'All Members',
    daysUntil: 33,
  },
];

export const QUICK_ACTIONS_PREVIEW: QuickActionItem[] = [
  {
    id: 'add-event',
    label: 'Add Family Event',
    malayalamLabel: 'പുതിയ ചടങ്ങ്',
    description: 'Save a birthday, anniversary, or family date',
    iconName: 'plus',
    accent: true,
  },
  {
    id: 'view-events',
    label: 'View All Events',
    malayalamLabel: 'എല്ലാ ചടങ്ങുകളും',
    description: 'Browse upcoming & past family occasions',
    iconName: 'calendar-days',
  },
  {
    id: 'family-members',
    label: 'Family Members',
    malayalamLabel: 'കുടുംബാംഗങ്ങൾ',
    description: 'Manage profiles, birth stars & reminders',
    iconName: 'users',
  },
  {
    id: 'manage-calendar',
    label: 'Manage Calendar',
    malayalamLabel: 'കലണ്ടർ ക്രമീകരണം',
    description: 'Customize Panchangam & alert preferences',
    iconName: 'sliders',
  },
];

export const FAMILY_MEMBERS_SUMMARY = [
  { name: 'Raghavan', role: 'Grandfather', initials: 'RG' },
  { name: 'Lakshmi', role: 'Grandmother', initials: 'LK' },
  { name: 'Arun', role: 'Father', initials: 'AR' },
  { name: 'Meera', role: 'Mother', initials: 'MR' },
  { name: 'Aarav', role: 'Little One', initials: 'AA' },
];

export const HIGHLIGHT_CAROUSEL_ITEMS: HighlightCarouselItem[] = [
  {
    id: 'carousel-birthday',
    title: "Amma's 60th Birthday",
    malayalamTitle: 'അമ്മയുടെ ഷഷ്ടിപൂർത്തി',
    dateTime: 'Dec 6 at 12:30 PM',
    memberName: 'Lakshmi Amma',
    memberInitials: 'LK',
    imageSrc: '/images/highlights/birthday-celebration.jpg',
    imageAlt: "Family birthday celebration around a traditional brass lamp for Amma's 60th Birthday",
  },
  {
    id: 'carousel-anniversary',
    title: 'Achan & Amma Anniversary',
    malayalamTitle: 'വിവാഹ വാർഷികം',
    dateTime: 'Dec 14 at 6:00 PM',
    memberName: 'Raghavan & Lakshmi',
    memberInitials: 'RL',
    imageSrc: '/images/highlights/anniversary-evening.jpg',
    imageAlt: 'Warm evening family anniversary gathering on a veranda with jasmine flowers',
  },
  {
    id: 'carousel-gathering',
    title: 'Year-End Family Get-Together',
    malayalamTitle: 'കുടുംബ സംഗമം',
    dateTime: 'Dec 28 at 5:00 PM',
    memberName: 'All Members',
    memberInitials: 'AM',
    imageSrc: '/images/highlights/family-gathering.jpg',
    imageAlt: 'Multi-generational Kerala family smiling together in a sunlit courtyard',
  },
];

