'use client';

import React, { useState } from 'react';
import Navbar from '@/components/home/Navbar';
import HomeFooter from '@/components/home/HomeFooter';

export default function SettingsPage() {
  const [showNakshatram, setShowNakshatram] = useState(true);
  const [familyReminders, setFamilyReminders] = useState(true);
  const [malayalamNumerals, setMalayalamNumerals] = useState(true);

  return (
    <div
      className="flex min-h-screen flex-1 flex-col bg-white text-zinc-950"
      style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-zinc-100 pb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff5fa] px-3 py-1 text-xs font-medium text-[#c0185a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e91e8c]" aria-hidden="true" />
            Preferences
          </span>
          <h1 className="mt-2.5 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Calendar Settings
          </h1>
          <p
            className="mt-1 text-sm text-zinc-500"
            style={{
              fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            കലണ്ടറും അറിയിപ്പുകളും ക്രമീകരിക്കുക
          </p>
        </div>

        <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] px-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">
                Nakshatram Labels
              </h2>
              <p className="text-xs text-zinc-500">
                Display daily Malayalam Nakshatram in calendar preferences
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showNakshatram}
              onClick={() => setShowNakshatram((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                showNakshatram ? 'bg-[#e91e8c]' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  showNakshatram ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">
                Family Event Reminders
              </h2>
              <p className="text-xs text-zinc-500">
                Notify family members ahead of birthdays and anniversaries
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={familyReminders}
              onClick={() => setFamilyReminders((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                familyReminders ? 'bg-[#e91e8c]' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  familyReminders ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">
                Malayalam Numerals
              </h2>
              <p className="text-xs text-zinc-500">
                Use traditional Malayalam numerals for Kollavarsham dates
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={malayalamNumerals}
              onClick={() => setMalayalamNumerals((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                malayalamNumerals ? 'bg-[#e91e8c]' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  malayalamNumerals ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}

