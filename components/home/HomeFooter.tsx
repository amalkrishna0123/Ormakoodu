import React from 'react';
import Image from 'next/image';
import logo from '@/src/assets/ormakoodu-logo.png';

export default function HomeFooter() {
  return (
    <footer className="mt-2 w-full border-t border-zinc-100 bg-[#fcfbfa]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 pt-8 pb-28 sm:flex-row sm:px-6 sm:pb-28 lg:px-8">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="Ormakoodu" className="h-5 w-auto opacity-85" />
          <span className="text-zinc-300" aria-hidden="true">
            ·
          </span>
          <span
            className="text-xs text-zinc-500"
            style={{
              fontFamily:
                "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            കുടുംബത്തിന്റെ ഡിജിറ്റൽ കലണ്ടർ
          </span>
        </div>

        <div className="flex items-center gap-5 text-xs text-zinc-500">
          <a href="#calendar" className="transition-colors hover:text-black">
            Calendar
          </a>
          <a href="#family" className="transition-colors hover:text-black">
            Family
          </a>
          <a href="#events" className="transition-colors hover:text-black">
            Events
          </a>
          <a href="#settings" className="transition-colors hover:text-black">
            Settings
          </a>
        </div>
      </div>
    </footer>
  );
}

