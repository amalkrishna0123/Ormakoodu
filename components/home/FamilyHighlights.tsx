import React from 'react';
import { FAMILY_HIGHLIGHT_PREVIEW } from '@/lib/homePreviewData';

export default function FamilyHighlights() {
  const highlight = FAMILY_HIGHLIGHT_PREVIEW;

  return (
    <section
      className="rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      aria-labelledby="family-highlights-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f7] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[#c0185a] uppercase">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#e91e8c]"
            aria-hidden="true"
          />
          {highlight.badge}
        </span>
        <span className="text-xs font-medium text-zinc-400">Preview</span>
      </div>

      <h2
        id="family-highlights-heading"
        className="mt-3.5 text-lg font-semibold tracking-tight text-zinc-950"
      >
        {highlight.title}
      </h2>
      <p
        className="mt-0.5 text-sm font-medium text-[#c0185a]"
        style={{
          fontFamily:
            "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
        }}
      >
        {highlight.malayalamTitle}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        {highlight.subtitle}
      </p>

      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-700">
        <svg
          className="h-3.5 w-3.5 text-[#e91e8c]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        <span>{highlight.dateText}</span>
      </div>

      {/* Small Reminder Card */}
      <div className="mt-4 rounded-xl border border-zinc-200/70 bg-white p-3.5">
        <div className="flex items-start gap-2.5">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fff0f7] text-[#e91e8c]"
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold text-zinc-900">
              Family Reminder
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
              {highlight.reminderNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

