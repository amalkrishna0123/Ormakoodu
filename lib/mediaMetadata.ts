export interface ExtractedMediaMetadata {
  fileName: string;
  fileSize: number;
  fileFormat: string;
  mediaType: 'image' | 'video';
  width?: number;
  height?: number;
  durationSeconds?: number;
  /** ISO-like timestamp string from EXIF DateTimeOriginal/CreateDate only. Undefined if not present in file. */
  capturedAt?: string;
  /** Human-readable or coordinate location from EXIF GPS only. Undefined if not present in file. */
  location?: string;
  latitude?: number;
  longitude?: number;
}

const MIME_TO_FORMAT: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'image/avif': 'AVIF',
  'image/heic': 'HEIC',
  'image/heif': 'HEIF',
  'image/gif': 'GIF',
  'video/mp4': 'MP4',
  'video/quicktime': 'MOV',
  'video/webm': 'WEBM',
  'video/x-m4v': 'M4V',
};

export function detectFileFormat(file: File): string {
  if (file.type && MIME_TO_FORMAT[file.type.toLowerCase()]) {
    return MIME_TO_FORMAT[file.type.toLowerCase()];
  }
  const ext = file.name.split('.').pop()?.trim().toUpperCase();
  return ext || 'FILE';
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val >= 10 || idx === 0 ? val.toFixed(0) : val.toFixed(1)} ${units[idx]}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// ─── Lightweight JPEG EXIF Parser (DateTimeOriginal + GPS) ────────────────────

function readAscii(view: DataView, offset: number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    if (offset + i >= view.byteLength) break;
    const code = view.getUint8(offset + i);
    if (code === 0) break;
    out += String.fromCharCode(code);
  }
  return out.trim();
}

function readRational(view: DataView, offset: number, littleEndian: boolean): number {
  if (offset + 8 > view.byteLength) return 0;
  const num = view.getUint32(offset, littleEndian);
  const den = view.getUint32(offset + 4, littleEndian);
  return den === 0 ? 0 : num / den;
}

function parseExifDateString(raw: string): string | undefined {
  // EXIF format: "YYYY:MM:DD HH:MM:SS"
  const m = /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/.exec(raw.trim());
  if (!m) return undefined;
  const [, y, mo, d, h, mi, s] = m;
  if (y === '0000') return undefined;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function parseJpegExif(buffer: ArrayBuffer): {
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
} {
  try {
    const view = new DataView(buffer);
    if (view.byteLength < 12 || view.getUint16(0, false) !== 0xffd8) {
      return {};
    }

    let offset = 2;
    while (offset + 4 < view.byteLength) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        // APP1
        const length = view.getUint16(offset, false);
        const exifHeader = readAscii(view, offset + 2, 6);
        if (exifHeader === 'Exif') {
          const tiffStart = offset + 8;
          return parseTiffIfd(view, tiffStart);
        }
        offset += length;
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        if (offset + 2 > view.byteLength) break;
        const len = view.getUint16(offset, false);
        offset += len;
      }
    }
  } catch {
    // Ignore malformed EXIF
  }
  return {};
}

function parseTiffIfd(view: DataView, tiffStart: number): {
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
} {
  if (tiffStart + 8 > view.byteLength) return {};
  const byteOrder = view.getUint16(tiffStart, false);
  const littleEndian = byteOrder === 0x4949;
  if (!littleEndian && byteOrder !== 0x4d4d) return {};

  const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
  const ifd0Start = tiffStart + firstIfdOffset;
  if (ifd0Start + 2 > view.byteLength) return {};

  let exifIfdOffset: number | undefined;
  let gpsIfdOffset: number | undefined;
  let dateTimeFallback: string | undefined;

  const entries = view.getUint16(ifd0Start, littleEndian);
  for (let i = 0; i < entries; i++) {
    const entryOffset = ifd0Start + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);
    const valueOffset = entryOffset + 8;

    if (tag === 0x8769) {
      exifIfdOffset = tiffStart + view.getUint32(valueOffset, littleEndian);
    } else if (tag === 0x8825) {
      gpsIfdOffset = tiffStart + view.getUint32(valueOffset, littleEndian);
    } else if (tag === 0x0132 && count > 4) {
      const strOffset = tiffStart + view.getUint32(valueOffset, littleEndian);
      dateTimeFallback = parseExifDateString(readAscii(view, strOffset, count));
    }
  }

  let capturedAt: string | undefined;
  if (exifIfdOffset && exifIfdOffset + 2 <= view.byteLength) {
    const exifEntries = view.getUint16(exifIfdOffset, littleEndian);
    for (let i = 0; i < exifEntries; i++) {
      const entryOffset = exifIfdOffset + 2 + i * 12;
      if (entryOffset + 12 > view.byteLength) break;
      const tag = view.getUint16(entryOffset, littleEndian);
      const count = view.getUint32(entryOffset + 4, littleEndian);
      const valueOffset = entryOffset + 8;
      if ((tag === 0x9003 || tag === 0x9004) && count > 4) {
        const strOffset = tiffStart + view.getUint32(valueOffset, littleEndian);
        const parsed = parseExifDateString(readAscii(view, strOffset, count));
        if (parsed) {
          capturedAt = parsed;
          if (tag === 0x9003) break;
        }
      }
    }
  }

  let latitude: number | undefined;
  let longitude: number | undefined;
  if (gpsIfdOffset && gpsIfdOffset + 2 <= view.byteLength) {
    let latRef = 'N';
    let lonRef = 'E';
    let latVals: number[] | undefined;
    let lonVals: number[] | undefined;

    const gpsEntries = view.getUint16(gpsIfdOffset, littleEndian);
    for (let i = 0; i < gpsEntries; i++) {
      const entryOffset = gpsIfdOffset + 2 + i * 12;
      if (entryOffset + 12 > view.byteLength) break;
      const tag = view.getUint16(entryOffset, littleEndian);
      const count = view.getUint32(entryOffset + 4, littleEndian);
      const valueOffset = entryOffset + 8;

      if (tag === 0x0001) {
        latRef = readAscii(view, valueOffset, Math.min(count, 4)) || 'N';
      } else if (tag === 0x0003) {
        lonRef = readAscii(view, valueOffset, Math.min(count, 4)) || 'E';
      } else if (tag === 0x0002 && count === 3) {
        const arrOffset = tiffStart + view.getUint32(valueOffset, littleEndian);
        latVals = [
          readRational(view, arrOffset, littleEndian),
          readRational(view, arrOffset + 8, littleEndian),
          readRational(view, arrOffset + 16, littleEndian),
        ];
      } else if (tag === 0x0004 && count === 3) {
        const arrOffset = tiffStart + view.getUint32(valueOffset, littleEndian);
        lonVals = [
          readRational(view, arrOffset, littleEndian),
          readRational(view, arrOffset + 8, littleEndian),
          readRational(view, arrOffset + 16, littleEndian),
        ];
      }
    }

    if (latVals && latVals.every((n) => Number.isFinite(n))) {
      const dec = latVals[0] + latVals[1] / 60 + latVals[2] / 3600;
      if (dec !== 0) latitude = latRef === 'S' ? -dec : dec;
    }
    if (lonVals && lonVals.every((n) => Number.isFinite(n))) {
      const dec = lonVals[0] + lonVals[1] / 60 + lonVals[2] / 3600;
      if (dec !== 0) longitude = lonRef === 'W' ? -dec : dec;
    }
  }

  return {
    capturedAt: capturedAt || dateTimeFallback,
    latitude,
    longitude,
  };
}

function getImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || undefined, height: img.naturalHeight || undefined });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function getVideoDimensionsAndDuration(
  file: File
): Promise<{ width?: number; height?: number; durationSeconds?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
        durationSeconds: Number.isFinite(video.duration) ? video.duration : undefined,
      });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    video.src = url;
  });
}

/**
 * Extract genuine metadata from a photo or video file.
 * Never guesses capture dates or locations if they are not present in the file.
 */
export async function extractMediaMetadata(file: File): Promise<ExtractedMediaMetadata> {
  const isVideo = file.type.startsWith('video/');
  const base: ExtractedMediaMetadata = {
    fileName: file.name,
    fileSize: file.size,
    fileFormat: detectFileFormat(file),
    mediaType: isVideo ? 'video' : 'image',
  };

  if (isVideo) {
    const dims = await getVideoDimensionsAndDuration(file);
    return { ...base, ...dims };
  }

  const [dims, exif] = await Promise.all([
    getImageDimensions(file),
    file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)
      ? file.slice(0, 256 * 1024).arrayBuffer().then(parseJpegExif).catch(() => ({}))
      : Promise.resolve({}),
  ]);

  let location: string | undefined;
  const lat = (exif as { latitude?: number }).latitude;
  const lon = (exif as { longitude?: number }).longitude;
  if (typeof lat === 'number' && typeof lon === 'number') {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    location = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  }

  return {
    ...base,
    ...dims,
    capturedAt: (exif as { capturedAt?: string }).capturedAt,
    location,
    latitude: lat,
    longitude: lon,
  };
}

