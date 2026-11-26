/**
 * Kerala Government Holidays & Traditional Kerala Festivals / Observances.
 *
 * Clearly distinguishes:
 * - Official Kerala Government Holidays (`isGovernmentHoliday: true`) -> Red date
 * - Traditional Kerala Festivals & Observances (`isTraditionalFestival: true`) -> Shown in date popup
 *
 * Firestore `holidays` collection records can extend or override these by year.
 */

export interface KeralaOccasion {
  id: string;
  date: string; // YYYY-MM-DD
  year: number;
  title: string;
  malayalamTitle: string;
  description?: string;
  isGovernmentHoliday: boolean;
  isTraditionalFestival: boolean;
  /** True when external festival has location.place === 'Kerala' (highlighted in red unless overridden by an admin event) */
  isKeralaStateFestival?: boolean;
  source: 'official-kerala-gad' | 'traditional-panchangam' | 'firestore' | 'kerala-festivals-json';
}

/**
 * Baseline Kerala Government Holidays (Official Public Holidays in Kerala)
 * and major Traditional Kerala Festivals for 2025, 2026, and 2027.
 * Admin can manage/add/update holidays per year in Firestore `holidays` collection.
 */
export const BASELINE_KERALA_OCCASIONS: KeralaOccasion[] = [
  // ─── 2025 ───────────────────────────────────────────────────────────────────
  {
    id: '2025-01-02-mannam',
    date: '2025-01-02',
    year: 2025,
    title: 'Mannam Jayanthi',
    malayalamTitle: 'മന്നം ജയന്തി',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-01-14-makaravilakku',
    date: '2025-01-14',
    year: 2025,
    title: 'Makara Vilakku',
    malayalamTitle: 'മകരവിളക്ക്',
    description: 'Sabarimala Makaravilakku & Makara Sankramam',
    isGovernmentHoliday: false,
    isTraditionalFestival: true,
    source: 'traditional-panchangam',
  },
  {
    id: '2025-01-26-republic',
    date: '2025-01-26',
    year: 2025,
    title: 'Republic Day',
    malayalamTitle: 'റിപ്പബ്ലിക് ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-02-26-shivaratri',
    date: '2025-02-26',
    year: 2025,
    title: 'Maha Shivaratri',
    malayalamTitle: 'മഹാശിവരാത്രി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-03-31-eid',
    date: '2025-03-31',
    year: 2025,
    title: 'Id-ul-Fitr (Ramzan)',
    malayalamTitle: 'ചെറിയ പെരുന്നാൾ',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-04-14-vishu',
    date: '2025-04-14',
    year: 2025,
    title: 'Vishu / Dr. B.R. Ambedkar Jayanthi',
    malayalamTitle: 'വിഷു',
    description: 'Medam 1 — Malayalam New Year & Vishukkani',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-04-18-goodfriday',
    date: '2025-04-18',
    year: 2025,
    title: 'Good Friday',
    malayalamTitle: 'ദുഃഖവെള്ളി',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-05-01-mayday',
    date: '2025-05-01',
    year: 2025,
    title: 'May Day',
    malayalamTitle: 'തൊഴിലാളി ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-05-06-pooram',
    date: '2025-05-06',
    year: 2025,
    title: 'Thrissur Pooram',
    malayalamTitle: 'തൃശ്ശൂർ പൂരം',
    description: 'Medam Pooram at Vadakkunnathan Temple, Thrissur',
    isGovernmentHoliday: false,
    isTraditionalFestival: true,
    source: 'traditional-panchangam',
  },
  {
    id: '2025-08-15-independence',
    date: '2025-08-15',
    year: 2025,
    title: 'Independence Day',
    malayalamTitle: 'സ്വാതന്ത്ര്യ ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-09-04-uthradam',
    date: '2025-09-04',
    year: 2025,
    title: 'First Onam (Uthradam)',
    malayalamTitle: 'ഒന്നാം ഓണം (ഉത്രാടം)',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-09-05-thiruvonam',
    date: '2025-09-05',
    year: 2025,
    title: 'Thiruvonam',
    malayalamTitle: 'തിരുവോണം',
    description: 'Main Onam celebration across Kerala',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-09-06-thirdonam',
    date: '2025-09-06',
    year: 2025,
    title: 'Third Onam (Avittam)',
    malayalamTitle: 'മൂന്നാം ഓണം (അവിട്ടം)',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-09-07-fourthonam',
    date: '2025-09-07',
    year: 2025,
    title: 'Fourth Onam / Sree Narayana Guru Jayanthi',
    malayalamTitle: 'നാലാം ഓണം / ശ്രീനാരായണ ഗുരു ജയന്തി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-10-02-gandhi',
    date: '2025-10-02',
    year: 2025,
    title: 'Gandhi Jayanthi / Vijayadashami',
    malayalamTitle: 'ഗാന്ധി ജയന്തി / വിജയദശമി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-10-20-deepavali',
    date: '2025-10-20',
    year: 2025,
    title: 'Deepavali',
    malayalamTitle: 'ദീപാവലി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2025-11-01-piravi',
    date: '2025-11-01',
    year: 2025,
    title: 'Kerala Piravi',
    malayalamTitle: 'കേരളപ്പിറവി',
    isGovernmentHoliday: false,
    isTraditionalFestival: true,
    source: 'traditional-panchangam',
  },
  {
    id: '2025-12-25-christmas',
    date: '2025-12-25',
    year: 2025,
    title: 'Christmas',
    malayalamTitle: 'ക്രിസ്തുമസ്',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },

  // ─── 2026 ───────────────────────────────────────────────────────────────────
  {
    id: '2026-01-02-mannam',
    date: '2026-01-02',
    year: 2026,
    title: 'Mannam Jayanthi',
    malayalamTitle: 'മന്നം ജയന്തി',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-01-14-makaravilakku',
    date: '2026-01-14',
    year: 2026,
    title: 'Makara Vilakku',
    malayalamTitle: 'മകരവിളക്ക്',
    description: 'Sabarimala Makaravilakku & Makara Sankramam',
    isGovernmentHoliday: false,
    isTraditionalFestival: true,
    source: 'traditional-panchangam',
  },
  {
    id: '2026-01-26-republic',
    date: '2026-01-26',
    year: 2026,
    title: 'Republic Day',
    malayalamTitle: 'റിപ്പബ്ലിക് ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-02-15-shivaratri',
    date: '2026-02-15',
    year: 2026,
    title: 'Maha Shivaratri',
    malayalamTitle: 'മഹാശിവരാത്രി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-03-20-eid',
    date: '2026-03-20',
    year: 2026,
    title: 'Id-ul-Fitr (Ramzan)',
    malayalamTitle: 'ചെറിയ പെരുന്നാൾ',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-04-02-maundy',
    date: '2026-04-02',
    year: 2026,
    title: 'Maundy Thursday',
    malayalamTitle: 'പെസഹ വ്യാഴം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-04-03-goodfriday',
    date: '2026-04-03',
    year: 2026,
    title: 'Good Friday',
    malayalamTitle: 'ദുഃഖവെള്ളി',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-04-14-vishu',
    date: '2026-04-14',
    year: 2026,
    title: 'Vishu / Dr. B.R. Ambedkar Jayanthi',
    malayalamTitle: 'വിഷു',
    description: 'Medam 1 — Malayalam New Year & Vishukkani',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-04-26-pooram',
    date: '2026-04-26',
    year: 2026,
    title: 'Thrissur Pooram',
    malayalamTitle: 'തൃശ്ശൂർ പൂരം',
    description: 'Medam Pooram at Vadakkunnathan Temple, Thrissur',
    isGovernmentHoliday: false,
    isTraditionalFestival: true,
    source: 'traditional-panchangam',
  },
  {
    id: '2026-05-01-mayday',
    date: '2026-05-01',
    year: 2026,
    title: 'May Day',
    malayalamTitle: 'തൊഴിലാളി ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-05-27-bakrid',
    date: '2026-05-27',
    year: 2026,
    title: 'Id-ul-Adha (Bakrid)',
    malayalamTitle: 'ബലിപെരുന്നാൾ',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-08-15-independence',
    date: '2026-08-15',
    year: 2026,
    title: 'Independence Day',
    malayalamTitle: 'സ്വാതന്ത്ര്യ ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-08-25-uthradam',
    date: '2026-08-25',
    year: 2026,
    title: 'First Onam (Uthradam)',
    malayalamTitle: 'ഒന്നാം ഓണം (ഉത്രാടം)',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-08-26-thiruvonam',
    date: '2026-08-26',
    year: 2026,
    title: 'Thiruvonam',
    malayalamTitle: 'തിരുവോണം',
    description: 'Main Onam celebration across Kerala',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-08-27-thirdonam',
    date: '2026-08-27',
    year: 2026,
    title: 'Third Onam (Avittam)',
    malayalamTitle: 'മൂന്നാം ഓണം (അവിട്ടം)',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-08-28-fourthonam',
    date: '2026-08-28',
    year: 2026,
    title: 'Fourth Onam / Sree Narayana Guru Jayanthi',
    malayalamTitle: 'നാലാം ഓണം / ശ്രീനാരായണ ഗുരു ജയന്തി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-09-04-ashtamirohini',
    date: '2026-09-04',
    year: 2026,
    title: 'Sree Krishna Jayanthi (Ashtami Rohini)',
    malayalamTitle: 'അഷ്ടമി രോഹിണി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-10-02-gandhi',
    date: '2026-10-02',
    year: 2026,
    title: 'Gandhi Jayanthi',
    malayalamTitle: 'ഗാന്ധി ജയന്തി',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-10-20-vijayadashami',
    date: '2026-10-20',
    year: 2026,
    title: 'Vijayadashami',
    malayalamTitle: 'വിജയദശമി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-11-01-piravi',
    date: '2026-11-01',
    year: 2026,
    title: 'Kerala Piravi',
    malayalamTitle: 'കേരളപ്പിറവി',
    isGovernmentHoliday: false,
    isTraditionalFestival: true,
    source: 'traditional-panchangam',
  },
  {
    id: '2026-11-08-deepavali',
    date: '2026-11-08',
    year: 2026,
    title: 'Deepavali',
    malayalamTitle: 'ദീപാവലി',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2026-12-25-christmas',
    date: '2026-12-25',
    year: 2026,
    title: 'Christmas',
    malayalamTitle: 'ക്രിസ്തുമസ്',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },

  // ─── 2027 ───────────────────────────────────────────────────────────────────
  {
    id: '2027-01-02-mannam',
    date: '2027-01-02',
    year: 2027,
    title: 'Mannam Jayanthi',
    malayalamTitle: 'മന്നം ജയന്തി',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2027-01-14-makaravilakku',
    date: '2027-01-14',
    year: 2027,
    title: 'Makara Vilakku',
    malayalamTitle: 'മകരവിളക്ക്',
    isGovernmentHoliday: false,
    isTraditionalFestival: true,
    source: 'traditional-panchangam',
  },
  {
    id: '2027-01-26-republic',
    date: '2027-01-26',
    year: 2027,
    title: 'Republic Day',
    malayalamTitle: 'റിപ്പബ്ലിക് ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2027-04-14-vishu',
    date: '2027-04-14',
    year: 2027,
    title: 'Vishu',
    malayalamTitle: 'വിഷു',
    isGovernmentHoliday: true,
    isTraditionalFestival: true,
    source: 'official-kerala-gad',
  },
  {
    id: '2027-05-01-mayday',
    date: '2027-05-01',
    year: 2027,
    title: 'May Day',
    malayalamTitle: 'തൊഴിലാളി ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2027-08-15-independence',
    date: '2027-08-15',
    year: 2027,
    title: 'Independence Day',
    malayalamTitle: 'സ്വാതന്ത്ര്യ ദിനം',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2027-10-02-gandhi',
    date: '2027-10-02',
    year: 2027,
    title: 'Gandhi Jayanthi',
    malayalamTitle: 'ഗാന്ധി ജയന്തി',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
  {
    id: '2027-12-25-christmas',
    date: '2027-12-25',
    year: 2027,
    title: 'Christmas',
    malayalamTitle: 'ക്രിസ്തുമസ്',
    isGovernmentHoliday: true,
    isTraditionalFestival: false,
    source: 'official-kerala-gad',
  },
];

function isDuplicateOccasionTitle(existing: Iterable<KeralaOccasion>, candidateTitle: string): boolean {
  const norm = candidateTitle.trim().toLowerCase();
  if (!norm) return false;
  for (const occ of existing) {
    const existingNorm = occ.title.trim().toLowerCase();
    if (
      existingNorm === norm ||
      existingNorm.includes(norm) ||
      norm.includes(existingNorm)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Merge baseline Kerala occasions, external festival JSON entries, and Firestore holiday documents.
 * Deduplicates by `id` and normalized title per date so the calendar never shows duplicates.
 */
export function getOccasionsForDate(
  isoDate: string,
  firestoreHolidays: KeralaOccasion[] = [],
  externalFestivals: KeralaOccasion[] = []
): KeralaOccasion[] {
  const byId = new Map<string, KeralaOccasion>();
  for (const occ of BASELINE_KERALA_OCCASIONS) {
    if (occ.date === isoDate) {
      byId.set(occ.id, occ);
    }
  }
  for (const occ of externalFestivals) {
    if (occ.date !== isoDate) continue;
    if (!byId.has(occ.id) && isDuplicateOccasionTitle(byId.values(), occ.title)) {
      continue;
    }
    byId.set(occ.id, occ);
  }
  for (const occ of firestoreHolidays) {
    if (occ.date === isoDate) {
      byId.set(occ.id, occ);
    }
  }
  return Array.from(byId.values());
}

export function getOccasionsMapForMonth(
  year: number,
  month1Based: number,
  firestoreHolidays: KeralaOccasion[] = [],
  externalFestivals: KeralaOccasion[] = []
): Record<string, KeralaOccasion[]> {
  const prefix = `${year}-${String(month1Based).padStart(2, '0')}-`;
  const byDate: Record<string, Map<string, KeralaOccasion>> = {};

  for (const occ of BASELINE_KERALA_OCCASIONS) {
    if (!occ.date.startsWith(prefix)) continue;
    if (!byDate[occ.date]) {
      byDate[occ.date] = new Map<string, KeralaOccasion>();
    }
    byDate[occ.date].set(occ.id, occ);
  }

  for (const occ of externalFestivals) {
    if (!occ.date.startsWith(prefix)) continue;
    if (!byDate[occ.date]) {
      byDate[occ.date] = new Map<string, KeralaOccasion>();
    }
    const map = byDate[occ.date];
    if (!map.has(occ.id) && isDuplicateOccasionTitle(map.values(), occ.title)) {
      continue;
    }
    map.set(occ.id, occ);
  }

  for (const occ of firestoreHolidays) {
    if (!occ.date.startsWith(prefix)) continue;
    if (!byDate[occ.date]) {
      byDate[occ.date] = new Map<string, KeralaOccasion>();
    }
    byDate[occ.date].set(occ.id, occ);
  }

  const result: Record<string, KeralaOccasion[]> = {};
  for (const [d, map] of Object.entries(byDate)) {
    result[d] = Array.from(map.values());
  }
  return result;
}

