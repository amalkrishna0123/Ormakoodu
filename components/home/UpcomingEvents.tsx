'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { subscribePublicEvents } from '@/lib/firestoreService';
import { getUpcomingEvents } from '@/lib/eventUtils';
import type { CalendarEventDoc } from '@/lib/types';

function getCategoryBadgeStyle(slug: string): string {
  switch (slug) {
    case 'birthday':
      return 'bg-[#fff0f7] text-[#c0185a]';
    case 'anniversary':
      return 'bg-zinc-900 text-white';
    case 'festival':
    case 'family_gathering':
      return 'bg-[#fdf2f8] text-[#9d174d]';
    default:
      return 'bg-zinc-100 text-zinc-700';
  }
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<CalendarEventDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribePublicEvents(
      (evs) => {
        setEvents(evs);
        setLoaded(true);
      },
      () => setLoaded(true)
    );
    return () => unsub();
  }, []);

  const upcomingList = useMemo(() => getUpcomingEvents(events), [events]);

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
          {upcomingList.length}
        </span>
      </div>

      {upcomingList.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm font-medium text-zinc-700">
            {loaded ? 'No upcoming events' : 'Loading upcoming events…'}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {loaded
              ? 'Events scheduled for today and future dates will appear here.'
              : 'Connecting to Ormakoodu database…'}
          </p>
        </div>
      ) : (
        <ul className="mt-3.5 divide-y divide-zinc-100">
          {upcomingList.map(({ event, gregorianLabel, malayalamDateLabel }) => {
            const subDetail =
              event.details?.personName ||
              event.details?.coupleNames ||
              event.details?.destination ||
              event.details?.venue ||
              '';

            return (
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
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCategoryBadgeStyle(
                        event.categorySlug
                      )}`}
                    >
                      {event.categoryName}
                    </span>
                  </div>
                  {(event.malayalamTitle || subDetail) && (
                    <p
                      className="mt-0.5 text-xs text-zinc-500"
                      style={{
                        fontFamily:
                          "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                      }}
                    >
                      {event.malayalamTitle || ''}
                      {event.malayalamTitle && subDetail ? ' · ' : ''}
                      {subDetail}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <span className="block text-xs font-semibold text-zinc-900">
                    {gregorianLabel}
                  </span>
                  <span
                    className="block text-[11px] text-zinc-400"
                    style={{
                      fontFamily:
                        "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                    }}
                  >
                    {malayalamDateLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
