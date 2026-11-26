import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyAfnJypTfGQwKq3GZp1O01IN22IYylnztw',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'ormakoodu-82755.firebaseapp.com',
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://ormakoodu-82755-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ormakoodu-82755',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'ormakoodu-82755.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '39396205289',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:39396205289:web:c2d72d127244f3f335c678',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || '';
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';
export const CLOUD_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL ||
  `https://asia-south1-${firebaseConfig.projectId}.cloudfunctions.net`;

