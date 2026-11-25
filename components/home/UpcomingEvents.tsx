import React from 'react';
import {
  UPCOMING_EVENTS_PREVIEW,
  type EventCategory,
} from '@/lib/homePreviewData';

const CATEGORY_LABELS: Record<EventCategory, string> = {
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  occasion: 'Occasion',
  celebration: 'Celebration',
};

const CATEGORY_STYLES: Record<EventCategory, string> = {
  birthday: 'bg-[#fff0f7] text-[#c0185a]',
  anniversary: 'bg-zinc-900 text-white',
  occasion: 'bg-zinc-100 text-zinc-700',
  celebration: 'bg-[#fdf2f8] text-[#9d174d]',
};

export default function UpcomingEvents() {
  return (
    <section
      id="events"
      className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      aria-labelledby="upcoming-events-heading"
    >
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3.5">
        <div>
          <h2
            id="upcoming-events-heading"
            className="text-base font-semibold tracking-tight text-zinc-950"
          >
            Upcoming Family Events
          </h2>
          <p
            className="text-xs text-zinc-500"
            style={{
              fontFamily:
                "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            വരാനിരിക്കുന്ന കുടുംബ വിശേഷങ്ങൾ
          </p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
          {UPCOMING_EVENTS_PREVIEW.length}
        </span>
      </div>

      <ul className="mt-3.5 divide-y divide-zinc-100">
        {UPCOMING_EVENTS_PREVIEW.map((event) => (
          <li
            key={event.id}
            className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium text-zinc-950">
                  {event.title}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLES[event.category]}`}
                >
                  {CATEGORY_LABELS[event.category]}
                </span>
              </div>
              <p
                className="mt-0.5 text-xs text-zinc-500"
                style={{
                  fontFamily:
                    "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                }}
              >
                {event.malayalamTitle}
                {event.familyMember ? ` · ${event.familyMember}` : ''}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <span className="block text-xs font-semibold text-zinc-900">
                {event.dateLabel}
              </span>
              <span
                className="block text-[11px] text-zinc-400"
                style={{
                  fontFamily:
                    "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                }}
              >
                {event.malayalamDateLabel}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

