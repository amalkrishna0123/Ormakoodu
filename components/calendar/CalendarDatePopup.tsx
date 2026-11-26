'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import type { CalendarDay } from '@/lib/calendarData';
import type { CalendarEventDoc } from '@/lib/types';

interface CalendarDatePopupProps {
  day: CalendarDay | null;
  events: CalendarEventDoc[];
  onClose: () => void;
}

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatFullGregorian(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(y, m - 1, d);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y} · ${WEEKDAY_NAMES[dt.getDay()]}`;
}

export default function CalendarDatePopup({
  day,
  events,
  onClose,
}: CalendarDatePopupProps) {
  useEffect(() => {
    if (!day) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [day, onClose]);

  if (!day) return null;

  const govHolidays = day.occasions.filter((o) => o.isGovernmentHoliday);
  const festivals = day.occasions.filter((o) => o.isTraditionalFestival);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${day.isoDate}`}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3.5">
          <div>
            <p className="text-xs font-medium text-zinc-500">
              {formatFullGregorian(day.isoDate)}
            </p>
            <h3
              className="mt-1 text-xl font-bold text-zinc-950"
              style={{
                fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
              }}
            >
              {day.malayalamMonthMl} {day.malayalamDate}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              {day.malayalamMonthEn} {day.malayalamDay} · Kollavarsham {day.kollavarsham}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close date details"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            ✕
          </button>
        </div>

        {/* Panchangam / Nakshatram */}
        <div className="mt-3.5 rounded-xl border border-zinc-200/70 bg-[#fcfbfa] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Thrissur Panchangam
            </span>
            <span className="text-[11px] text-zinc-400">
              Sunrise {day.sunriseIST} · Sunset {day.sunsetIST}
            </span>
          </div>
          <p
            className="mt-1 text-sm font-semibold text-zinc-900"
            style={{
              fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            നക്ഷത്രം: {day.nakshatram} ({day.nakshatramEn})
          </p>
          {day.nakshatramEndTimeIST && day.nextNakshatramMl && (
            <p
              className="mt-0.5 text-xs text-zinc-600"
              style={{
                fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
              }}
            >
              {day.nakshatramEndTimeIST} വരെ, തുടർന്ന് {day.nextNakshatramMl}
            </p>
          )}
        </div>

        {/* Government Holidays & Weekly Offs */}
        {(govHolidays.length > 0 || day.isSunday || day.isSecondSaturday) && (
          <div className="mt-3.5 space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
              Holidays &amp; Observances
            </h4>
            {day.isSunday && (
              <div className="rounded-xl border border-red-200/70 bg-red-50/70 px-3 py-2 text-xs font-medium text-red-700">
                Sunday (Weekly Holiday)
              </div>
            )}
            {day.isSecondSaturday && (
              <div className="rounded-xl border border-red-200/70 bg-red-50/70 px-3 py-2 text-xs font-medium text-red-700">
                Second Saturday (Public Holiday)
              </div>
            )}
            {govHolidays.map((h) => (
              <div
                key={h.id}
                className="rounded-xl border border-red-200/70 bg-red-50/70 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-red-800">{h.title}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    Govt Holiday
                  </span>
                </div>
                <p
                  className="mt-0.5 text-xs text-red-700/90"
                  style={{
                    fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                  }}
                >
                  {h.malayalamTitle}
                </p>
                {h.description && (
                  <p className="mt-1 text-[11px] text-red-700/80">{h.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Traditional Kerala Festivals */}
        {festivals.length > 0 && (
          <div className="mt-3.5 space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              Traditional Kerala Festivals
            </h4>
            {festivals.map((f) => (
              <div
                key={`fest-${f.id}`}
                className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-amber-950">{f.title}</span>
                  <span
                    className="text-xs font-medium text-amber-800"
                    style={{
                      fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                    }}
                  >
                    {f.malayalamTitle}
                  </span>
                </div>
                {f.description && (
                  <p className="mt-1 text-[11px] text-amber-900/80">{f.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Admin-Created Events (all events on this date) */}
        <div className="mt-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#c0185a]">
              Family Events ({events.length})
            </h4>
          </div>

          {events.length === 0 ? (
            <p className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-3 text-center text-xs text-zinc-500">
              No family events scheduled for this date.
            </p>
          ) : (
            events.map((ev) => (
              <article
                key={ev.id}
                className="overflow-hidden rounded-xl border border-[#e91e8c]/20 bg-[#fff5fa]/50 p-3"
              >
                {ev.imageUrl && (
                  <div className="relative mb-2.5 h-36 w-full overflow-hidden rounded-lg bg-zinc-100">
                    <Image
                      src={ev.imageUrl}
                      alt={ev.title}
                      fill
                      sizes="380px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex rounded-full bg-[#fff0f7] px-2.5 py-0.5 text-[10px] font-semibold text-[#c0185a]">
                    {ev.categoryName}
                  </span>
                  {(ev.startTime || ev.endTime) && (
                    <span className="text-[11px] font-medium text-zinc-600">
                      {ev.startTime}
                      {ev.endTime ? ` – ${ev.endTime}` : ''}
                    </span>
                  )}
                </div>

                <h5 className="mt-1.5 text-sm font-semibold text-zinc-950">{ev.title}</h5>
                {ev.malayalamTitle && (
                  <p
                    className="text-xs font-medium text-[#c0185a]"
                    style={{
                      fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                    }}
                  >
                    {ev.malayalamTitle}
                  </p>
                )}

                {ev.description && (
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">{ev.description}</p>
                )}

                {/* Category-specific metadata */}
                {ev.details && (
                  <div className="mt-2 space-y-0.5 border-t border-[#e91e8c]/10 pt-2 text-[11px] text-zinc-600">
                    {ev.details.personName && (
                      <p>
                        <strong>Person:</strong> {ev.details.personName}
                      </p>
                    )}
                    {ev.details.coupleNames && (
                      <p>
                        <strong>Couple:</strong> {ev.details.coupleNames}
                      </p>
                    )}
                    {ev.details.destination && (
                      <p>
                        <strong>Destination:</strong> {ev.details.destination}
                        {ev.details.departureDate && ev.details.returnDate
                          ? ` (${ev.details.departureDate} to ${ev.details.returnDate})`
                          : ''}
                      </p>
                    )}
                    {ev.details.movieName && (
                      <p>
                        <strong>Movie:</strong> {ev.details.movieName}
                        {ev.details.platformOrTheatre ? ` · ${ev.details.platformOrTheatre}` : ''}
                      </p>
                    )}
                    {ev.details.programmeName && (
                      <p>
                        <strong>Programme:</strong> {ev.details.programmeName}
                        {ev.details.location ? ` · ${ev.details.location}` : ''}
                      </p>
                    )}
                    {ev.details.festivalName && (
                      <p>
                        <strong>Festival:</strong> {ev.details.festivalName}
                      </p>
                    )}
                    {ev.details.venue && (
                      <p>
                        <strong>Venue:</strong> {ev.details.venue}
                        {ev.details.participants ? ` · ${ev.details.participants}` : ''}
                      </p>
                    )}
                    {ev.details.occasionName && (
                      <p>
                        <strong>Occasion:</strong> {ev.details.occasionName}
                      </p>
                    )}
                  </div>
                )}

                {ev.recurrence?.type === 'yearly' && (
                  <span className="mt-2 inline-block text-[10px] font-medium text-zinc-500">
                    Repeats yearly
                  </span>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

