import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ALLOWED_FOLDERS = new Set(['ormakoodu/events', 'ormakoodu/memories']);

/**
 * Verifies a Firebase ID token via the Firebase Auth REST API (no firebase-admin needed).
 * Returns the decoded token payload or throws.
 */
async function verifyFirebaseToken(idToken: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    }`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) throw new Error('Token verification failed');
  const data = await res.json();
  const user = data.users?.[0];
  if (!user) throw new Error('No user found');
  return user as { localId: string; email: string };
}

/**
 * Generates a short-lived Cloudinary upload signature entirely server-side.
 * No Cloud Function or CORS issues — secrets never leave the server.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authHeader.slice(7).trim();

  // Verify token and check admin identity
  let user: { localId: string; email: string };
  try {
    user = await verifyFirebaseToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';
  const adminUid   = process.env.NEXT_PUBLIC_ADMIN_UID   || '';
  const isAdmin =
    (adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()) ||
    (adminUid   && user.localId === adminUid);

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured on the server' },
      { status: 500 }
    );
  }

  const body = await req.json();
  const requestedFolder = body?.folder || 'ormakoodu/events';
  const folder = ALLOWED_FOLDERS.has(requestedFolder)
    ? requestedFolder
    : 'ormakoodu/events';

  const resourceType = body?.resourceType === 'video' ? 'video' : 'image';
  const timestamp = Math.round(Date.now() / 1000);
  const allowedFormats =
    resourceType === 'video'
      ? 'mp4,mov,webm,m4v'
      : 'jpg,jpeg,png,webp,avif,heic,gif';
  const paramsToSign = `allowed_formats=${allowedFormats}&folder=${folder}&timestamp=${timestamp}`;

  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    allowedFormats,
    resourceType,
  });
}

