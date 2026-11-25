/**
 * Calendar data types and utilities for the Ormakoodu Malayalam calendar.
 *
 * NOTE: Nakshatram and Panchangam data here are PLACEHOLDER values used for
 * UI layout purposes only. Replace with actual astronomical data from a
 * validated source (e.g. Astro-Hindu API or offline panchangam library)
 * before production use.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CalendarDay {
  /** Gregorian date (1-31). null for padding cells. */
  gregorianDate: number | null;
  /** Malayalam date string (e.g. "൧൫") */
  malayalamDate: string;
  /** Nakshatram name in Malayalam (placeholder) */
  nakshatram: string;
  /** Whether this day belongs to the current month */
  isCurrentMonth: boolean;
  /** Whether this is today */
  isToday: boolean;
  /** Whether this is a Sunday */
  isSunday: boolean;
  /** Whether this is a special/festival day */
  isSpecial: boolean;
  /** Special day label (e.g. "ഓണം") */
  specialLabel?: string;
}

export interface MonthData {
  /** Gregorian month name */
  gregorianMonth: string;
  /** Gregorian year */
  gregorianYear: number;
  /** Malayalam month name */
  malayalamMonth: string;
  /** Kollavarsham year */
  kollavarsham: number;
  /** Additional panchangam info */
  panchangamInfo: string;
  /** All calendar cells (including padding from prev/next month) */
  days: CalendarDay[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Malayalam numerals 0-9 */
const ML_DIGITS = ['൦', '൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯'];

/** Convert integer to Malayalam numeral string */
function toMalayalamNumeral(n: number): string {
  return String(n)
    .split('')
    .map((d) => ML_DIGITS[parseInt(d, 10)])
    .join('');
}

/** Malayalam month names (Medam = April–May start) */
export const MALAYALAM_MONTHS = [
  'ചിങ്ങം',   // Aug–Sep (month 1 in Kollavarsham)
  'കന്നി',    // Sep–Oct
  'തുലാം',   // Oct–Nov
  'വൃശ്ചികം', // Nov–Dec
  'ധനു',      // Dec–Jan
  'മകരം',    // Jan–Feb
  'കുംഭം',   // Feb–Mar
  'മീനം',    // Mar–Apr
  'മേടം',    // Apr–May
  'ഇടവം',   // May–Jun
  'മിഥുനം', // Jun–Jul
  'കർക്കടകം', // Jul–Aug
];

/** Gregorian month names */
const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Placeholder nakshatram list (27 nakshatrams).
 * These cycle approximately one per day — real data needs an ephemeris.
 */
const NAKSHATRAMS = [
  'അശ്വതി', 'ഭരണി', 'കാർത്തിക', 'രോഹിണി', 'മകയിരം',
  'തിരുവാതിര', 'പുണർതം', 'പൂയം', 'ആയില്യം', 'മകം',
  'പൂരം', 'ഉത്രം', 'അത്തം', 'ചിത്തിര', 'ചോതി',
  'വിശാഖം', 'അനിഴം', 'തൃക്കേട്ട', 'മൂലം', 'പൂരാടം',
  'ഉത്രാടം', 'തിരുവോണം', 'അവിട്ടം', 'ചതയം', 'പൂരോരുട്ടാതി',
  'ഉത്തൃട്ടാതി', 'രേവതി',
];

/** Map Gregorian month index → Malayalam month index (approximate) */
function getMalayalamMonthIndex(gregorianMonthIndex: number): number {
  // Malayalam months start roughly mid-Gregorian month.
  // Rough mapping: Chingam (Aug), Kanni (Sep), Thulam (Oct), …
  // Kollavarsham month 1 = Chingam ~ August
  const mapping = [4, 5, 6, 7, 8, 9, 10, 0, 1, 2, 3, 11];
  return mapping[gregorianMonthIndex];
}

/** Approximate Kollavarsham year from Gregorian year (Gregorian - 824 for Aug-Dec, -825 for Jan-Jul) */
function getKollavarsham(gregorianYear: number, monthIndex: number): number {
  return monthIndex >= 7 ? gregorianYear - 824 : gregorianYear - 825;
}

// ─── Main data builder ────────────────────────────────────────────────────────

/**
 * Build calendar data for the given Gregorian month/year.
 * Uses today's date by default.
 */
export function buildMonthData(year?: number, monthIndex?: number): MonthData {
  const today = new Date();
  const y = year ?? today.getFullYear();
  const m = monthIndex ?? today.getMonth(); // 0-based

  const firstDay = new Date(y, m, 1);
  const lastDate = new Date(y, m + 1, 0).getDate();
  const startDow = firstDay.getDay(); // 0 = Sunday

  const prevMonthLastDate = new Date(y, m, 0).getDate();

  const days: CalendarDay[] = [];

  // Leading padding cells (previous month)
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    days.push({
      gregorianDate: d,
      malayalamDate: toMalayalamNumeral(d),
      nakshatram: '',
      isCurrentMonth: false,
      isToday: false,
      isSunday: false,
      isSpecial: false,
    });
  }

  // Current month cells
  for (let d = 1; d <= lastDate; d++) {
    const dow = new Date(y, m, d).getDay();
    const nakshatramIndex = (d + 12) % 27; // placeholder cycling
    const isToday =
      d === today.getDate() &&
      m === today.getMonth() &&
      y === today.getFullYear();

    days.push({
      gregorianDate: d,
      malayalamDate: toMalayalamNumeral(d),
      nakshatram: NAKSHATRAMS[nakshatramIndex],
      isCurrentMonth: true,
      isToday,
      isSunday: dow === 0,
      isSpecial: false,
      specialLabel: undefined,
    });
  }

  // Trailing padding cells (next month)
  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextD = 1;
  while (days.length < totalCells) {
    days.push({
      gregorianDate: nextD,
      malayalamDate: toMalayalamNumeral(nextD),
      nakshatram: '',
      isCurrentMonth: false,
      isToday: false,
      isSunday: false,
      isSpecial: false,
    });
    nextD++;
  }

  const mlMonthIdx = getMalayalamMonthIndex(m);
  const kollavarsham = getKollavarsham(y, m);

  return {
    gregorianMonth: GREGORIAN_MONTHS[m],
    gregorianYear: y,
    malayalamMonth: MALAYALAM_MONTHS[mlMonthIdx],
    kollavarsham,
    panchangamInfo: `${toMalayalamNumeral(kollavarsham)} കൊല്ലവർഷം`,
    days,
  };
}

