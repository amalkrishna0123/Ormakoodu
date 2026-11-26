/**
 * Calendar data types and builder for the Ormakoodu Malayalam calendar.
 * Powered by the Thrissur astronomical Panchangam engine (`lib/panchangam.ts`)
 * and Kerala Government Holiday / Festival data (`lib/keralaHolidays.ts`).
 */

import {
  getMalayalamDateInfo,
  MALAYALAM_MONTHS_ML,
  toMalayalamNumeral,
} from './panchangam';
import {
  getOccasionsMapForMonth,
  type KeralaOccasion,
} from './keralaHolidays';

export { MALAYALAM_MONTHS_ML as MALAYALAM_MONTHS };

// ─── Types ───────────────────────────────────────────────────────────────────

export type DateHighlightStatus = 'event' | 'holiday' | 'normal';

export interface CalendarDay {
  /** ISO date string YYYY-MM-DD */
  isoDate: string;
  /** Gregorian date (1-31). null for padding cells. */
  gregorianDate: number | null;
  /** Malayalam date string (e.g. "൧൫") */
  malayalamDate: string;
  /** Malayalam day number (1-32) */
  malayalamDay: number;
  /** Malayalam month name for this specific day */
  malayalamMonthMl: string;
  /** Malayalam month English name */
  malayalamMonthEn: string;
  /** Kollavarsham year for this day */
  kollavarsham: number;
  /** Nakshatram name in Malayalam at Thrissur sunrise */
  nakshatram: string;
  /** Nakshatram name in English */
  nakshatramEn: string;
  /** Exact Nakshatram transition time in IST (if transitioning during civil day) */
  nakshatramEndTimeIST: string | null;
  /** Next Nakshatram in Malayalam */
  nextNakshatramMl: string | null;
  /** Thrissur sunrise time (IST) */
  sunriseIST: string;
  /** Thrissur sunset time (IST) */
  sunsetIST: string;
  /** Whether this day belongs to the current month */
  isCurrentMonth: boolean;
  /** Whether this is today */
  isToday: boolean;
  /** Whether this is a Sunday */
  isSunday: boolean;
  /** Whether this is the second Saturday of the month */
  isSecondSaturday: boolean;
  /** Whether this is an official Kerala government holiday */
  isGovernmentHoliday: boolean;
  /** Occasions (government holidays + traditional festivals) on this date */
  occasions: KeralaOccasion[];
  /** Whether this is a special/festival day */
  isSpecial: boolean;
  /** Special day label */
  specialLabel?: string;
  /** Deterministic highlight status: 'event' (pink) > 'holiday' (red) > 'normal' */
  dateStatus: DateHighlightStatus;
}

export interface MonthData {
  /** Gregorian month name */
  gregorianMonth: string;
  /** Gregorian year */
  gregorianYear: number;
  /** 0-based Gregorian month index */
  gregorianMonthIndex: number;
  /** Malayalam month name(s) covered in this Gregorian month */
  malayalamMonth: string;
  /** Kollavarsham year */
  kollavarsham: number;
  /** Additional panchangam info */
  panchangamInfo: string;
  /** All calendar cells (including padding from prev/next month) */
  days: CalendarDay[];
}

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatISODate(year: number, month1Based: number, day: number): string {
  return `${year}-${String(month1Based).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Deterministic date-status priority system:
 * 1. Admin-created event on date -> 'event' (pink) — overrides red holidays
 * 2. Sunday, 2nd Saturday, or Official Government Holiday -> 'holiday' (red)
 * 3. Otherwise -> 'normal'
 */
export function resolveDateStatus(options: {
  hasAdminEvent: boolean;
  isSunday: boolean;
  isSecondSaturday: boolean;
  isGovernmentHoliday: boolean;
}): DateHighlightStatus {
  if (options.hasAdminEvent) return 'event';
  if (options.isSunday || options.isSecondSaturday || options.isGovernmentHoliday) {
    return 'holiday';
  }
  return 'normal';
}

// ─── Main data builder ────────────────────────────────────────────────────────

export interface BuildMonthOptions {
  eventDates?: Set<string>;
  firestoreHolidays?: KeralaOccasion[];
  useMalayalamNumerals?: boolean;
}

/**
 * Build accurate calendar data for the given Gregorian month/year.
 * Uses today's date by default.
 */
export function buildMonthData(
  year?: number,
  monthIndex?: number,
  options: BuildMonthOptions = {}
): MonthData {
  const today = new Date();
  const y = year ?? today.getFullYear();
  const m = monthIndex ?? today.getMonth(); // 0-based
  const m1 = m + 1;

  const firstDay = new Date(y, m, 1);
  const lastDate = new Date(y, m + 1, 0).getDate();
  const startDow = firstDay.getDay(); // 0 = Sunday

  const prevMonthDate = new Date(y, m, 0);
  const prevMonthYear = prevMonthDate.getFullYear();
  const prevMonth1 = prevMonthDate.getMonth() + 1;
  const prevMonthLastDate = prevMonthDate.getDate();

  const nextMonthDate = new Date(y, m + 1, 1);
  const nextMonthYear = nextMonthDate.getFullYear();
  const nextMonth1 = nextMonthDate.getMonth() + 1;

  const occasionsMap = getOccasionsMapForMonth(y, m1, options.firestoreHolidays ?? []);
  const eventDates = options.eventDates ?? new Set<string>();
  const useMlNumerals = options.useMalayalamNumerals ?? true;

  const days: CalendarDay[] = [];

  // Leading padding cells (previous month)
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const isoDate = formatISODate(prevMonthYear, prevMonth1, d);
    const info = getMalayalamDateInfo(prevMonthYear, prevMonth1, d);
    days.push({
      isoDate,
      gregorianDate: d,
      malayalamDate: useMlNumerals ? info.malayalamDayMl : String(info.malayalamDay),
      malayalamDay: info.malayalamDay,
      malayalamMonthMl: info.malayalamMonthMl,
      malayalamMonthEn: info.malayalamMonthEn,
      kollavarsham: info.kollavarsham,
      nakshatram: '',
      nakshatramEn: info.nakshatramEn,
      nakshatramEndTimeIST: info.nakshatramEndTimeIST,
      nextNakshatramMl: info.nextNakshatramMl,
      sunriseIST: info.sunriseIST,
      sunsetIST: info.sunsetIST,
      isCurrentMonth: false,
      isToday: false,
      isSunday: false,
      isSecondSaturday: false,
      isGovernmentHoliday: false,
      occasions: [],
      isSpecial: false,
      dateStatus: 'normal',
    });
  }

  let firstMlMonth = '';
  let lastMlMonth = '';
  let mainKollavarsham = 0;

  // Current month cells
  for (let d = 1; d <= lastDate; d++) {
    const dow = new Date(y, m, d).getDay();
    const isSunday = dow === 0;
    const isSecondSaturday = dow === 6 && Math.ceil(d / 7) === 2;
    const isoDate = formatISODate(y, m1, d);
    const info = getMalayalamDateInfo(y, m1, d);

    if (d === 1) {
      firstMlMonth = info.malayalamMonthMl;
      mainKollavarsham = info.kollavarsham;
    }
    lastMlMonth = info.malayalamMonthMl;
    if (d === 15) {
      mainKollavarsham = info.kollavarsham;
    }

    const occasions = occasionsMap[isoDate] ?? [];
    const isGovernmentHoliday = occasions.some((o) => o.isGovernmentHoliday);
    const hasTraditionalFestival = occasions.some((o) => o.isTraditionalFestival);
    const hasAdminEvent = eventDates.has(isoDate);

    const isToday =
      d === today.getDate() &&
      m === today.getMonth() &&
      y === today.getFullYear();

    const dateStatus = resolveDateStatus({
      hasAdminEvent,
      isSunday,
      isSecondSaturday,
      isGovernmentHoliday,
    });

    days.push({
      isoDate,
      gregorianDate: d,
      malayalamDate: useMlNumerals ? info.malayalamDayMl : String(info.malayalamDay),
      malayalamDay: info.malayalamDay,
      malayalamMonthMl: info.malayalamMonthMl,
      malayalamMonthEn: info.malayalamMonthEn,
      kollavarsham: info.kollavarsham,
      nakshatram: info.nakshatramMl,
      nakshatramEn: info.nakshatramEn,
      nakshatramEndTimeIST: info.nakshatramEndTimeIST,
      nextNakshatramMl: info.nextNakshatramMl,
      sunriseIST: info.sunriseIST,
      sunsetIST: info.sunsetIST,
      isCurrentMonth: true,
      isToday,
      isSunday,
      isSecondSaturday,
      isGovernmentHoliday,
      occasions,
      isSpecial: isGovernmentHoliday || hasTraditionalFestival,
      specialLabel: occasions[0]?.malayalamTitle,
      dateStatus,
    });
  }

  // Trailing padding cells (next month)
  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextD = 1;
  while (days.length < totalCells) {
    const isoDate = formatISODate(nextMonthYear, nextMonth1, nextD);
    const info = getMalayalamDateInfo(nextMonthYear, nextMonth1, nextD);
    days.push({
      isoDate,
      gregorianDate: nextD,
      malayalamDate: useMlNumerals ? info.malayalamDayMl : String(info.malayalamDay),
      malayalamDay: info.malayalamDay,
      malayalamMonthMl: info.malayalamMonthMl,
      malayalamMonthEn: info.malayalamMonthEn,
      kollavarsham: info.kollavarsham,
      nakshatram: '',
      nakshatramEn: info.nakshatramEn,
      nakshatramEndTimeIST: info.nakshatramEndTimeIST,
      nextNakshatramMl: info.nextNakshatramMl,
      sunriseIST: info.sunriseIST,
      sunsetIST: info.sunsetIST,
      isCurrentMonth: false,
      isToday: false,
      isSunday: false,
      isSecondSaturday: false,
      isGovernmentHoliday: false,
      occasions: [],
      isSpecial: false,
      dateStatus: 'normal',
    });
    nextD++;
  }

  const malayalamMonthHeader =
    firstMlMonth === lastMlMonth
      ? firstMlMonth
      : `${firstMlMonth} - ${lastMlMonth}`;

  return {
    gregorianMonth: GREGORIAN_MONTHS[m],
    gregorianYear: y,
    gregorianMonthIndex: m,
    malayalamMonth: malayalamMonthHeader,
    kollavarsham: mainKollavarsham,
    panchangamInfo: `${toMalayalamNumeral(mainKollavarsham)} കൊല്ലവർഷം`,
    days,
  };
}
