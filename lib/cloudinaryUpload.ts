import { getFirebaseAuth } from './firebase';

// Use Next.js API proxy routes to avoid CORS issues with Cloud Functions.
// In production these proxy routes forward to the Cloud Functions server-to-server.
const PROXY_BASE = '/api/admin';

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return 'Unsupported file format. Allowed formats: JPEG, PNG, WebP, AVIF.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image file size exceeds the 5 MB limit.';
  }
  return null;
}

/**
 * Upload an image to Cloudinary.
 * Prefers signed upload via Firebase Cloud Function (`generateCloudinarySignature`)
 * and falls back to a restricted unsigned upload preset if Cloud Functions are not configured.
 * Never exposes Cloudinary API secrets in client code.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: 'ormakoodu/events' | 'ormakoodu/memories' = 'ormakoodu/events'
): Promise<CloudinaryUploadResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Admin authentication required before uploading media.');
  }

  const idToken = await user.getIdToken();

  // Attempt signed upload via Firebase Cloud Function first
  try {
    const sigRes = await fetch(`${PROXY_BASE}/cloudinary-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ folder }),
    });

    if (sigRes.ok) {
      const sig = (await sigRes.json()) as {
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder: string;
        allowedFormats: string;
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);
      formData.append('allowed_formats', sig.allowedFormats);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!uploadRes.ok) {
        const errBody = await uploadRes.text();
        throw new Error(`Cloudinary signed upload failed: ${errBody}`);
      }
      const data = await uploadRes.json();
      return {
        secureUrl: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
      };
    }
  } catch (signedErr) {
    // If unsigned preset is configured, fall back cleanly; otherwise rethrow
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      throw signedErr instanceof Error
        ? signedErr
        : new Error('Cloudinary upload configuration is missing.');
    }
  }

  // Restricted unsigned upload preset fallback
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Deploy Cloud Functions or set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!uploadRes.ok) {
    const errBody = await uploadRes.text();
    throw new Error(`Cloudinary upload failed: ${errBody}`);
  }
  const data = await uploadRes.json();
  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
  };
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) return;
  const idToken = await user.getIdToken();

  await fetch(`${PROXY_BASE}/delete-media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ publicId }),
  });
}

