import type { KeralaOccasion } from './keralaHolidays';

export const KERALA_FESTIVALS_JSON_URL =
  'https://raw.githubusercontent.com/MuhammedFayazTS/kerala-festivals/main/festivals.json';

interface ExternalFestivalLocation {
  district?: string;
  place?: string;
}

interface ExternalFestivalItem {
  id: number | string;
  name: string;
  malayalamName?: string;
  startDate: string;
  endDate?: string;
  malayalamDate?: string;
  isMajor?: boolean;
  location?: ExternalFestivalLocation;
  description?: string;
}

interface ExternalFestivalsResponse {
  festivals?: ExternalFestivalItem[];
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 120;

function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
}

function expandDateRange(startIso: string, endIso?: string): string[] {
  if (!ISO_DATE_RE.test(startIso)) return [];
  if (!endIso || !ISO_DATE_RE.test(endIso) || endIso <= startIso) {
    return [startIso];
  }

  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, sd));
  const end = new Date(Date.UTC(ey, em - 1, ed));

  const dates: string[] = [];
  const cursor = new Date(start);
  let steps = 0;

  while (cursor <= end && steps < MAX_RANGE_DAYS) {
    const y = cursor.getUTCFullYear();
    const m = String(cursor.getUTCMonth() + 1).padStart(2, '0');
    const d = String(cursor.getUTCDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    steps++;
  }

  return dates;
}

export function mapExternalFestivalsToOccasions(
  rawFestivals: ExternalFestivalItem[]
): KeralaOccasion[] {
  const occasions: KeralaOccasion[] = [];

  for (const fest of rawFestivals) {
    if (!fest?.name || !fest?.startDate) continue;

    const dates = expandDateRange(fest.startDate.trim(), fest.endDate?.trim());
    if (dates.length === 0) continue;

    const place = fest.location?.place?.trim() || '';
    const isPlaceKerala = place.toLowerCase() === 'kerala';
    const descriptionParts: string[] = [];
    if (place && !isPlaceKerala) {
      descriptionParts.push(place);
    }
    if (fest.description) {
      const cleanDesc = stripMarkdownBold(fest.description);
      const firstSentence = cleanDesc.split(/(?<=[.!?])\s+/)[0] || cleanDesc;
      if (firstSentence) {
        descriptionParts.push(firstSentence);
      }
    }

    const description = descriptionParts.join(' — ') || undefined;

    for (const date of dates) {
      const year = Number(date.slice(0, 4));
      occasions.push({
        id: `ext-festival-${fest.id}-${date}`,
        date,
        year,
        title: fest.name.trim(),
        malayalamTitle: fest.malayalamName?.trim() || fest.name.trim(),
        description,
        isGovernmentHoliday: false,
        isTraditionalFestival: true,
        isKeralaStateFestival: isPlaceKerala,
        source: 'kerala-festivals-json',
      });
    }
  }

  return occasions;
}

let cachedFestivalsPromise: Promise<KeralaOccasion[]> | null = null;

/**
 * Fetch and cache Kerala festivals from the external JSON source.
 * Returns [] gracefully if the network request fails.
 */
export async function fetchKeralaFestivals(): Promise<KeralaOccasion[]> {
  if (cachedFestivalsPromise) {
    return cachedFestivalsPromise;
  }

  cachedFestivalsPromise = (async () => {
    try {
      const res = await fetch(KERALA_FESTIVALS_JSON_URL, {
        cache: 'force-cache',
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch festivals.json: ${res.status}`);
      }
      const data = (await res.json()) as ExternalFestivalsResponse;
      if (!Array.isArray(data?.festivals)) {
        return [];
      }
      return mapExternalFestivalsToOccasions(data.festivals);
    } catch (err) {
      console.error('[keralaFestivals] Failed to load external festivals:', err);
      // Reset cache so a future mount can retry if network recovers
      cachedFestivalsPromise = null;
      return [];
    }
  })();

  return cachedFestivalsPromise;
}

