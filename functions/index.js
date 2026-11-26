const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');

if (!admin.apps.length) {
  admin.initializeApp();
}

const CLOUDINARY_CLOUD_NAME = defineSecret('CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY = defineSecret('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = defineSecret('CLOUDINARY_API_SECRET');

const ALLOWED_FOLDERS = new Set(['ormakoodu/events', 'ormakoodu/memories']);

function setCorsHeaders(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

async function verifyAdminRequest(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization Bearer token');
  }
  const idToken = authHeader.slice(7).trim();
  const decoded = await admin.auth().verifyIdToken(idToken);
  const adminDoc = await admin
    .firestore()
    .collection('admins')
    .doc(decoded.uid)
    .get();

  if (
    !adminDoc.exists ||
    adminDoc.data().role !== 'admin' ||
    adminDoc.data().active === false
  ) {
    throw new Error('Forbidden: caller is not an authorized admin');
  }
  return decoded;
}

/**
 * Generates a short-lived signed upload signature for Cloudinary.
 * Keeps CLOUDINARY_API_SECRET strictly on the server.
 */
exports.generateCloudinarySignature = onRequest(
  {
    region: 'asia-south1',
    secrets: [CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET],
  },
  async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      await verifyAdminRequest(req);
      const requestedFolder = req.body?.folder || 'ormakoodu/events';
      const folder = ALLOWED_FOLDERS.has(requestedFolder)
        ? requestedFolder
        : 'ormakoodu/events';

      const timestamp = Math.round(Date.now() / 1000);
      const allowedFormats = 'jpg,jpeg,png,webp,avif';
      const paramsToSign = `allowed_formats=${allowedFormats}&folder=${folder}&timestamp=${timestamp}`;

      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + CLOUDINARY_API_SECRET.value())
        .digest('hex');

      res.status(200).json({
        signature,
        timestamp,
        apiKey: CLOUDINARY_API_KEY.value(),
        cloudName: CLOUDINARY_CLOUD_NAME.value(),
        folder,
        allowedFormats,
      });
    } catch (err) {
      const status = String(err.message).includes('Forbidden') ? 403 : 401;
      res.status(status).json({ error: err.message || 'Unauthorized' });
    }
  }
);

/**
 * Deletes an uploaded media asset from Cloudinary by publicId.
 * Requires authorized admin Firebase ID token.
 */
exports.deleteCloudinaryMedia = onRequest(
  {
    region: 'asia-south1',
    secrets: [CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET],
  },
  async (req, res) => {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      await verifyAdminRequest(req);
      const publicId = req.body?.publicId;
      if (!publicId || typeof publicId !== 'string' || !publicId.startsWith('ormakoodu/')) {
        res.status(400).json({ error: 'Invalid publicId' });
        return;
      }

      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash('sha1')
        .update(paramsToSign + CLOUDINARY_API_SECRET.value())
        .digest('hex');

      const form = new URLSearchParams({
        public_id: publicId,
        api_key: CLOUDINARY_API_KEY.value(),
        timestamp: String(timestamp),
        signature,
      });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME.value()}/image/destroy`,
        {
          method: 'POST',
          body: form,
        }
      );
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      const status = String(err.message).includes('Forbidden') ? 403 : 401;
      res.status(status).json({ error: err.message || 'Unauthorized' });
    }
  }
);

