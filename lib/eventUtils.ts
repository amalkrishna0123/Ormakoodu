import { getMalayalamDateInfo } from './panchangam';
import type { CalendarEventDoc } from './types';

/**
 * Format YYYY-MM-DD for a local Date.
 */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD safely in local time (noon to avoid DST issues).
 */
export function parseISODate(isoDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

/**
 * Check if an event occurs on a specific target ISO date (YYYY-MM-DD),
 * accounting for explicit yearly recurrence rules (`recurrence.type === 'yearly'`).
 */
export function doesEventOccurOnDate(
  event: CalendarEventDoc,
  targetIsoDate: string
): boolean {
  if (event.eventDate === targetIsoDate) return true;

  if (event.recurrence?.type === 'yearly') {
    const targetMonthDay = targetIsoDate.slice(5); // MM-DD
    const eventMonthDay = event.recurrence.monthDay || event.eventDate.slice(5);
    // Only recur on or after the original event year
    if (targetIsoDate >= event.eventDate && targetMonthDay === eventMonthDay) {
      return true;
    }
  }

  return false;
}

/**
 * Expand all events that occur within a given Gregorian month (year, monthIndex 0-11).
 * Returns a map from ISO date -> CalendarEventDoc[] and a Set of ISO dates with events.
 */
export function getEventsForMonthMap(
  events: CalendarEventDoc[],
  year: number,
  monthIndex: number
): {
  eventsByDate: Record<string, CalendarEventDoc[]>;
  eventDates: Set<string>;
} {
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const eventsByDate: Record<string, CalendarEventDoc[]> = {};
  const eventDates = new Set<string>();

  for (let d = 1; d <= lastDate; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const matching = events.filter((ev) => doesEventOccurOnDate(ev, iso));
    if (matching.length > 0) {
      eventsByDate[iso] = matching;
      eventDates.add(iso);
    }
  }

  return { eventsByDate, eventDates };
}

export interface ResolvedUpcomingEvent {
  event: CalendarEventDoc;
  occurrenceDate: string; // YYYY-MM-DD
  gregorianLabel: string;
  malayalamDateLabel: string;
  daysUntil: number;
}

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Compute upcoming events (today or future) sorted chronologically.
 * Past events are excluded from upcoming lists, while remaining in the calendar.
 * Supports yearly recurring events by computing their next occurrence >= today.
 */
export function getUpcomingEvents(
  events: CalendarEventDoc[],
  referenceDate?: Date
): ResolvedUpcomingEvent[] {
  if (events.length === 0) return [];
  // NOTE: Do NOT use `new Date()` as a default parameter — Next.js 16 static
  // analysis flags it as an "unstable value" during prerender. Always resolve
  // it here (inside the function body) instead.
  const _ref = referenceDate ?? new Date();
  const todayMidnight = new Date(
    _ref.getFullYear(),
    _ref.getMonth(),
    _ref.getDate()
  );
  const todayIso = toISODateString(todayMidnight);
  const currentYear = todayMidnight.getFullYear();

  const resolved: ResolvedUpcomingEvent[] = [];

  for (const event of events) {
    let occurrenceIso: string | null = null;

    if (event.recurrence?.type === 'yearly') {
      const monthDay = event.recurrence.monthDay || event.eventDate.slice(5);
      const candidateThisYear = `${currentYear}-${monthDay}`;
      if (candidateThisYear >= todayIso && candidateThisYear >= event.eventDate) {
        occurrenceIso = candidateThisYear;
      } else {
        const candidateNextYear = `${currentYear + 1}-${monthDay}`;
        if (candidateNextYear >= event.eventDate) {
          occurrenceIso = candidateNextYear;
        }
      }
    } else if (event.eventDate >= todayIso) {
      occurrenceIso = event.eventDate;
    }

    if (!occurrenceIso) continue;
    const parsed = parseISODate(occurrenceIso);
    if (!parsed) continue;

    const occDateObj = new Date(parsed.year, parsed.month - 1, parsed.day);
    const daysUntil = Math.round(
      (occDateObj.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24)
    );

    const mlInfo = getMalayalamDateInfo(parsed.year, parsed.month, parsed.day);

    resolved.push({
      event,
      occurrenceDate: occurrenceIso,
      gregorianLabel: `${SHORT_MONTHS[parsed.month - 1]} ${parsed.day}`,
      malayalamDateLabel: `${mlInfo.malayalamMonthMl} ${mlInfo.malayalamDay}`,
      daysUntil,
    });
  }

  resolved.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate));
  return resolved;
}

