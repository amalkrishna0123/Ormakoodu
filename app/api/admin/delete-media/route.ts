import { NextRequest, NextResponse } from 'next/server';

const FUNCTIONS_BASE =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
  'https://asia-south1-ormakoodu-82755.cloudfunctions.net';

/**
 * Server-side proxy for deleteCloudinaryMedia.
 * Browser → this route (same origin, no CORS) → Cloud Function (server-to-server).
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.text();

  try {
    const upstream = await fetch(
      `${FUNCTIONS_BASE}/deleteCloudinaryMedia`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body,
      }
    );

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error('[delete-media proxy]', err);
    return NextResponse.json(
      { error: 'Failed to reach delete service' },
      { status: 502 }
    );
  }
}

