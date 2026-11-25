import React from 'react';
import { FAMILY_MEMBERS_SUMMARY } from '@/lib/homePreviewData';

export default function WelcomeSection() {
  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 pt-7 pb-2 sm:px-6 lg:px-8 lg:pt-9 lg:pb-8"
      aria-labelledby="welcome-heading"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-2 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff5fa] px-3 py-1 text-xs font-medium text-[#c0185a]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#e91e8c]"
              aria-hidden="true"
            />
            <span>Family Space</span>
          </div>
          <h1
            id="welcome-heading"
            className="mt-2.5 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-[28px]"
          >
            Welcome home, Family
          </h1>
          <p
            className="mt-1 text-sm text-zinc-500"
            style={{
              fontFamily:
                "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            കുടുംബത്തിന്റെ ഓർമ്മകളും വിശേഷ ദിവസങ്ങളും ഒരിടത്ത്
          </p>
        </div>
      </div>
    </section>
  );
}

