/**
 * Astronomical Malayalam Calendar (Kollavarsham) & Kerala Panchangam Engine
 * Location: Thrissur, Kerala, India (10.5276° N, 76.2144° E, IST UTC+05:30)
 *
 * Implements:
 * - Julian Day (JD) & Dynamical Time (T)
 * - Solar Ecliptic Longitude (Meeus high-precision)
 * - Lunar Ecliptic Longitude (Meeus Ch. 47 periodic series)
 * - Lahiri (Chitrapaksha) Ayanamsha for Nirayana (sidereal) longitudes
 * - Thrissur Sunrise & Sunset calculation (NOAA / Meeus solar zenith 90.833°)
 * - Kerala Sankranti (Sankramam) rule for exact Malayalam month & date transitions
 * - Kollavarsham year calculation (new year begins on Chingam 1)
 * - Daily Nakshatram at Thrissur sunrise + exact Nakshatram transition time in IST
 */

export const THRISSUR_COORDS = {
  latitude: 10.5276,
  longitude: 76.2144,
  timezoneOffsetHours: 5.5, // IST (UTC+05:30)
  locationName: 'Thrissur, Kerala',
} as const;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Correct Malayalam month sequence starting from Medam (0° sidereal Sun)
 * 1. Medam (0°–30°)
 * 2. Edavam (30°–60°)
 * 3. Mithunam (60°–90°)
 * 4. Karkidakam (90°–120°)
 * 5. Chingam (120°–150°)  <-- Kollavarsham New Year
 * 6. Kanni (150°–180°)
 * 7. Thulam (180°–210°)
 * 8. Vrischikam (210°–240°)
 * 9. Dhanu (240°–270°)
 * 10. Makaram (270°–300°)
 * 11. Kumbham (300°–330°)
 * 12. Meenam (330°–360°)
 */
export const MALAYALAM_MONTHS_ML = [
  'മേടം',       // 0: Medam
  'ഇടവം',      // 1: Edavam
  'മിഥുനം',    // 2: Mithunam
  'കർക്കടകം',  // 3: Karkidakam
  'ചിങ്ങം',     // 4: Chingam
  'കന്നി',      // 5: Kanni
  'തുലാം',     // 6: Thulam
  'വൃശ്ചികം',  // 7: Vrischikam
  'ധനു',       // 8: Dhanu
  'മകരം',      // 9: Makaram
  'കുംഭം',     // 10: Kumbham
  'മീനം',      // 11: Meenam
] as const;

export const MALAYALAM_MONTHS_EN = [
  'Medam',
  'Edavam',
  'Mithunam',
  'Karkidakam',
  'Chingam',
  'Kanni',
  'Thulam',
  'Vrischikam',
  'Dhanu',
  'Makaram',
  'Kumbham',
  'Meenam',
] as const;

export const NAKSHATRAMS_ML = [
  'അശ്വതി',
  'ഭരണി',
  'കാർത്തിക',
  'രോഹിണി',
  'മകയിരം',
  'തിരുവാതിര',
  'പുണർതം',
  'പൂയം',
  'ആയില്യം',
  'മകം',
  'പൂരം',
  'ഉത്രം',
  'അത്തം',
  'ചിത്തിര',
  'ചോതി',
  'വിശാഖം',
  'അനിഴം',
  'തൃക്കേട്ട',
  'മൂലം',
  'പൂരാടം',
  'ഉത്രാടം',
  'തിരുവോണം',
  'അവിട്ടം',
  'ചതയം',
  'പൂരോരുട്ടാതി',
  'ഉത്തൃട്ടാതി',
  'രേവതി',
] as const;

export const NAKSHATRAMS_EN = [
  'Ashwati',
  'Bharani',
  'Karthika',
  'Rohini',
  'Makayiram',
  'Thiruvathira',
  'Punartham',
  'Pooyam',
  'Ayilyam',
  'Makam',
  'Pooram',
  'Uthram',
  'Atham',
  'Chithira',
  'Chothi',
  'Vishakham',
  'Anizham',
  'Thrikketta',
  'Moolam',
  'Pooradam',
  'Uthradam',
  'Thiruvonam',
  'Avittam',
  'Chathayam',
  'Poororuttathi',
  'Uthrattathi',
  'Revathi',
] as const;

const ML_DIGITS = ['൦', '൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯'];

export function toMalayalamNumeral(n: number): string {
  return String(Math.max(0, Math.floor(n)))
    .split('')
    .map((d) => ML_DIGITS[parseInt(d, 10)] ?? d)
    .join('');
}

function norm360(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/**
 * Convert UTC date/time to Julian Day (JD).
 */
export function toJulianDayUTC(
  year: number,
  month: number, // 1..12
  day: number,
  hourUTC = 0
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    hourUTC / 24 +
    B -
    1524.5
  );
}

/**
 * Convert civil IST date + fractional IST hour to Julian Day (UT).
 */
export function istToJD(year: number, month: number, day: number, hourIST: number): number {
  return toJulianDayUTC(year, month, day, hourIST - THRISSUR_COORDS.timezoneOffsetHours);
}

/**
 * Lahiri (Chitrapaksha) Ayanamsha in degrees at Julian Day jd.
 * Reference at J2000.0 (JD 2451545.0): 23°51'25.5324" = 23.85709233°
 */
export function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.85709233 + 1.39697128 * T + 0.0003086 * T * T;
}

/**
 * Tropical geometric/apparent longitude of the Sun (degrees) at Julian Day jd.
 * Meeus, Astronomical Algorithms, Ch. 25 (accurate to ~0.01°).
 */
export function getSunTropicalLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * DEG2RAD;

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  const trueLong = L0 + C;
  const omega = (125.04 - 1934.136 * T) * DEG2RAD;
  const apparentLong = trueLong - 0.00569 - 0.00478 * Math.sin(omega);
  return norm360(apparentLong);
}

/**
 * Sidereal (Nirayana) solar longitude in degrees [0, 360) at Julian Day jd.
 */
export function getSunSiderealLongitude(jd: number): number {
  return norm360(getSunTropicalLongitude(jd) - getLahiriAyanamsha(jd));
}

/**
 * Tropical longitude of the Moon (degrees) at Julian Day jd.
 * Meeus, Astronomical Algorithms, Ch. 47 (main periodic terms).
 */
export function getMoonTropicalLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  const Lp = norm360(
    218.3164477 +
      481267.88123421 * T -
      0.0015786 * T2 +
      T3 / 538841 -
      T4 / 65194000
  );
  const D = norm360(
    297.8501921 +
      445267.1114034 * T -
      0.0018819 * T2 +
      T3 / 545868 -
      T4 / 113065000
  );
  const M = norm360(
    357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000
  );
  const Mp = norm360(
    134.9633964 +
      477198.8675055 * T +
      0.0087414 * T2 +
      T3 / 69699 -
      T4 / 14712000
  );
  const F = norm360(
    93.272095 +
      483202.0175233 * T -
      0.0036539 * T2 -
      T3 / 3526000 +
      T4 / 863310000
  );

  const A1 = norm360(119.75 + 131.849 * T) * DEG2RAD;
  const A2 = norm360(53.09 + 479264.29 * T) * DEG2RAD;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;

  const Dr = D * DEG2RAD;
  const Mr = M * DEG2RAD;
  const Mpr = Mp * DEG2RAD;
  const Fr = F * DEG2RAD;

  // Periodic terms (coeff in 0.000001 deg)
  const terms: Array<[number, number, number, number, number]> = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
  ];

  let sumL = 0;
  for (const [d, m, mp, f, coeff] of terms) {
    let mult = 1;
    if (Math.abs(m) === 1) mult = E;
    else if (Math.abs(m) === 2) mult = E2;
    sumL += coeff * mult * Math.sin(d * Dr + m * Mr + mp * Mpr + f * Fr);
  }

  sumL += 3958 * Math.sin(A1) + 1962 * Math.sin((Lp - F) * DEG2RAD) + 318 * Math.sin(A2);

  // Nutation in longitude (approx)
  const omega = (125.04452 - 1934.136261 * T) * DEG2RAD;
  const deltaPsi = (-17.2 / 3600) * Math.sin(omega);

  return norm360(Lp + sumL / 1_000_000 + deltaPsi);
}

/**
 * Sidereal (Nirayana) Moon longitude in degrees [0, 360) at Julian Day jd.
 */
export function getMoonSiderealLongitude(jd: number): number {
  return norm360(getMoonTropicalLongitude(jd) - getLahiriAyanamsha(jd));
}

/**
 * Compute Sunrise and Sunset in fractional IST hours for Thrissur, Kerala
 * using NOAA / Meeus solar position equations.
 */
export function getThrissurSunTimes(
  year: number,
  month: number,
  day: number
): { sunriseIST: number; sunsetIST: number; sunriseStr: string; sunsetStr: string } {
  const jdNoon = istToJD(year, month, day, 12);
  const T = (jdNoon - 2451545.0) / 36525.0;

  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  const Mrad = M * DEG2RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  const sunTrueLong = L0 + C;
  const omega = (125.04 - 1934.136 * T) * DEG2RAD;
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(omega);

  const meanObliq =
    23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const obliqCorr = meanObliq + 0.00256 * Math.cos(omega);

  const sinDecl = Math.sin(obliqCorr * DEG2RAD) * Math.sin(sunAppLong * DEG2RAD);
  const decl = Math.asin(sinDecl);

  const y = Math.tan((obliqCorr / 2) * DEG2RAD) ** 2;
  const L0rad = L0 * DEG2RAD;
  const eqTimeMinutes =
    4 *
    RAD2DEG *
    (y * Math.sin(2 * L0rad) -
      2 * e * Math.sin(Mrad) +
      4 * e * y * Math.sin(Mrad) * Math.cos(2 * L0rad) -
      0.5 * y * y * Math.sin(4 * L0rad) -
      1.25 * e * e * Math.sin(2 * Mrad));

  const latRad = THRISSUR_COORDS.latitude * DEG2RAD;
  const zenithRad = 90.833 * DEG2RAD;
  const cosHA =
    Math.cos(zenithRad) / (Math.cos(latRad) * Math.cos(decl)) -
    Math.tan(latRad) * Math.tan(decl);

  const haDeg = Math.acos(Math.max(-1, Math.min(1, cosHA))) * RAD2DEG;

  // Solar noon in IST minutes
  const solarNoonMin =
    720 - 4 * THRISSUR_COORDS.longitude - eqTimeMinutes + THRISSUR_COORDS.timezoneOffsetHours * 60;

  const sunriseMin = solarNoonMin - 4 * haDeg;
  const sunsetMin = solarNoonMin + 4 * haDeg;

  return {
    sunriseIST: sunriseMin / 60,
    sunsetIST: sunsetMin / 60,
    sunriseStr: formatMinutesTo12h(sunriseMin),
    sunsetStr: formatMinutesTo12h(sunsetMin),
  };
}

export function formatHoursTo12h(hourFloat: number): string {
  return formatMinutesTo12h(hourFloat * 60);
}

function formatMinutesTo12h(totalMin: number): string {
  const mNorm = ((Math.round(totalMin) % 1440) + 1440) % 1440;
  const h24 = Math.floor(mNorm / 60);
  const mins = mNorm % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
}

/**
 * Determine which Malayalam solar month a civil date belongs to using the
 * Kerala Sankranti rule:
 * A Sankramam (Sun entering a new 30° Rasi) occurring BEFORE sunset on a civil
 * day starts the new month on THAT day; if after sunset, the new month starts
 * the NEXT day.
 */
function getMalayalamMonthIndexAtCivilDay(year: number, month: number, day: number): number {
  const { sunsetIST } = getThrissurSunTimes(year, month, day);
  const jdSunset = istToJD(year, month, day, sunsetIST);
  const sunLon = getSunSiderealLongitude(jdSunset);
  return Math.floor(sunLon / 30) % 12;
}

export interface MalayalamDateInfo {
  malayalamMonthIndex: number; // 0 = Medam .. 11 = Meenam
  malayalamMonthMl: string;
  malayalamMonthEn: string;
  malayalamDay: number;
  malayalamDayMl: string;
  kollavarsham: number;
  nakshatramIndex: number;
  nakshatramMl: string;
  nakshatramEn: string;
  nakshatramEndTimeIST: string | null; // When current sunrise nakshatram ends (if within civil day)
  nextNakshatramMl: string | null;
  sunriseIST: string;
  sunsetIST: string;
}

/**
 * Compute exact Malayalam date, month, Kollavarsham year, and Nakshatram
 * for a given Gregorian date in Thrissur, Kerala.
 */
export function getMalayalamDateInfo(
  year: number,
  month: number, // 1..12
  day: number
): MalayalamDateInfo {
  const currentMonthIdx = getMalayalamMonthIndexAtCivilDay(year, month, day);

  // Walk backwards up to 33 days to find day 1 of this Malayalam month
  let mlDay = 1;
  const cursor = new Date(Date.UTC(year, month - 1, day));
  for (let i = 1; i <= 33; i++) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const py = cursor.getUTCFullYear();
    const pm = cursor.getUTCMonth() + 1;
    const pd = cursor.getUTCDate();
    if (getMalayalamMonthIndexAtCivilDay(py, pm, pd) === currentMonthIdx) {
      mlDay++;
    } else {
      break;
    }
  }

  // Kollavarsham year: new year begins on Chingam 1 (index 4).
  // Chingam (4), Kanni (5), Thulam (6), Vrischikam (7), and Dhanu (8) in Dec => year - 824.
  // Makaram (9), Kumbham (10), Meenam (11), Medam (0), Edavam (1), Mithunam (2), Karkidakam (3) => year - 825.
  // Edge case: Dhanu in January (Jan 1..14) is still the Kollavarsham that started in previous Aug!
  let kollavarsham: number;
  if (currentMonthIdx >= 4 && currentMonthIdx <= 8) {
    // If month is Dhanu (8) and Gregorian month is January, it started in previous year's Aug
    kollavarsham = month === 1 ? year - 825 : year - 824;
  } else {
    kollavarsham = year - 825;
  }

  // Sunrise & Sunset at Thrissur
  const sunTimes = getThrissurSunTimes(year, month, day);

  // Nakshatram at sunrise
  const jdSunrise = istToJD(year, month, day, sunTimes.sunriseIST);
  const moonAtSunrise = getMoonSiderealLongitude(jdSunrise);
  const nakWidth = 360 / 27; // 13.333333...°
  const nakIndex = Math.floor(moonAtSunrise / nakWidth) % 27;

  // Check if Nakshatram transitions between sunrise and 23:59:59 IST (or next sunrise)
  // Using 24-hour civil window from sunrise to next day's sunrise (or 24:00 IST)
  const nextBoundaryLon = ((nakIndex + 1) * nakWidth) % 360;
  let nakshatramEndTimeIST: string | null = null;
  let nextNakshatramMl: string | null = null;

  const jdEndOfDay = istToJD(year, month, day, 24);
  const moonAtEndOfDay = getMoonSiderealLongitude(jdEndOfDay);

  // Check if Moon crossed nextBoundaryLon between sunrise and midnight IST
  const deltaFromStart = norm360(moonAtEndOfDay - moonAtSunrise);
  const distToBoundary = norm360(nextBoundaryLon - moonAtSunrise);

  if (distToBoundary > 0 && distToBoundary <= deltaFromStart) {
    // Bisection search between sunriseIST and 24.0 IST
    let lo = sunTimes.sunriseIST;
    let hi = 24.0;
    for (let iter = 0; iter < 18; iter++) {
      const mid = (lo + hi) / 2;
      const jdMid = istToJD(year, month, day, mid);
      const mMid = getMoonSiderealLongitude(jdMid);
      const prog = norm360(mMid - moonAtSunrise);
      if (prog < distToBoundary) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    nakshatramEndTimeIST = formatHoursTo12h((lo + hi) / 2);
    nextNakshatramMl = NAKSHATRAMS_ML[(nakIndex + 1) % 27];
  }

  return {
    malayalamMonthIndex: currentMonthIdx,
    malayalamMonthMl: MALAYALAM_MONTHS_ML[currentMonthIdx],
    malayalamMonthEn: MALAYALAM_MONTHS_EN[currentMonthIdx],
    malayalamDay: mlDay,
    malayalamDayMl: toMalayalamNumeral(mlDay),
    kollavarsham,
    nakshatramIndex: nakIndex,
    nakshatramMl: NAKSHATRAMS_ML[nakIndex],
    nakshatramEn: NAKSHATRAMS_EN[nakIndex],
    nakshatramEndTimeIST,
    nextNakshatramMl,
    sunriseIST: sunTimes.sunriseStr,
    sunsetIST: sunTimes.sunsetStr,
  };
}

