import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

async function verifyFirebaseToken(idToken: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
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
 * Deletes an uploaded Cloudinary asset (image or video) directly server-side.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authHeader.slice(7).trim();
  let user: { localId: string; email: string };
  try {
    user = await verifyFirebaseToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';
  const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID || '';
  const isAdmin =
    (adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()) ||
    (adminUid && user.localId === adminUid);

  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
  }

  const body = await req.json();
  const publicId = body?.publicId;
  const resourceType = body?.resourceType === 'video' ? 'video' : 'image';
  if (!publicId || typeof publicId !== 'string' || !publicId.startsWith('ormakoodu/')) {
    return NextResponse.json({ error: 'Invalid publicId' }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  const form = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
    { method: 'POST', body: form }
  );
  const data = await response.json();
  return NextResponse.json(data, { status: response.ok ? 200 : 502 });
}

