'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { isAuthorizedAdmin } from '@/lib/firestoreService';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ok = await isAuthorizedAdmin(user.uid, user.email);
        if (ok) {
          router.replace('/admin/dashboard');
          return;
        }
        await signOut(auth);
      }
      setCheckingSession(false);
    });
    return () => unsub();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const ok = await isAuthorizedAdmin(cred.user.uid, cred.user.email);
      if (!ok) {
        await signOut(auth);
        setError('This account is not authorized for Ormakoodu admin access.');
        setSubmitting(false);
        return;
      }
      router.replace('/admin/dashboard');
    } catch {
      setError('Invalid email or password. Please verify your admin credentials.');
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <p className="text-sm text-zinc-500">Verifying admin session…</p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#fcfbfa] px-4 pb-24"
      style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f7] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#c0185a]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e91e8c]" aria-hidden="true" />
          Ormakoodu Admin
        </span>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">
          Admin Sign In
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Authorized administrator access only.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium text-zinc-700"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-950 focus:border-[#e91e8c] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-zinc-700"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-950 focus:border-[#e91e8c] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e91e8c] disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

