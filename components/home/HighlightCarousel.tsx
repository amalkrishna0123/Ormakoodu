'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { HiOutlineClock } from 'react-icons/hi2';
import { subscribePublicEvents } from '@/lib/firestoreService';
import { getUpcomingEvents } from '@/lib/eventUtils';
import type { CalendarEventDoc } from '@/lib/types';

export interface HighlightCarouselItem {
  id: string;
  title: string;
  malayalamTitle: string;
  dateTime: string;
  malayalamDateLabel?: string;
  categoryName?: string;
  memberName: string;
  memberInitials: string;
  imageSrc?: string;
  imageAlt: string;
}

interface HighlightCarouselProps {
  items?: HighlightCarouselItem[];
  autoPlayIntervalMs?: number;
}

const SWIPE_THRESHOLD_PX = 45;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'OK';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function HighlightCarousel({
  items: propItems,
  autoPlayIntervalMs = 4000,
}: HighlightCarouselProps) {
  const [liveEvents, setLiveEvents] = useState<CalendarEventDoc[]>([]);
  const [loaded, setLoaded] = useState(Boolean(propItems));

  useEffect(() => {
    if (propItems) return;
    const unsub = subscribePublicEvents(
      (evs) => {
        setLiveEvents(evs);
        setLoaded(true);
      },
      (err) => {
        console.error('[HighlightCarousel] Failed to load events:', err);
        setLoaded(true);
      }
    );
    return () => unsub();
  }, [propItems]);

  const items: HighlightCarouselItem[] = useMemo(() => {
    if (propItems) return propItems;
    const upcoming = getUpcomingEvents(liveEvents);
    return upcoming.slice(0, 6).map(({ event, gregorianLabel, malayalamDateLabel }) => {
      const member =
        event.details?.personName ||
        event.details?.coupleNames ||
        event.details?.participants ||
        event.categoryName ||
        'Ormakoodu';
      return {
        id: event.id,
        title: event.title,
        malayalamTitle: event.malayalamTitle || malayalamDateLabel,
        dateTime: `${gregorianLabel}${event.startTime ? ` at ${event.startTime}` : ''} · ${malayalamDateLabel}`,
        malayalamDateLabel,
        categoryName: event.categoryName,
        memberName: member,
        memberInitials: getInitials(member),
        imageSrc: event.imageUrl || undefined,
        imageAlt: event.title,
      };
    });
  }, [propItems, liveEvents]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const count = items.length;
  const safeIndex = count > 0 ? activeIndex % count : 0;

  const goToNext = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  const goToPrev = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Autoplay every 4 seconds; pauses on hover or active touch, cleans up on unmount
  useEffect(() => {
    if (count <= 1 || isHovered || isTouching) {
      return;
    }

    const intervalId = window.setInterval(goToNext, autoPlayIntervalMs);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [count, isHovered, isTouching, autoPlayIntervalMs, goToNext]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsTouching(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontalSwipe.current) {
      setDragOffsetPx(dx);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current && Math.abs(dragOffsetPx) >= SWIPE_THRESHOLD_PX) {
      if (dragOffsetPx < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
    setDragOffsetPx(0);
    setIsTouching(false);
  };

  if (count === 0) {
    return (
      <section aria-label="Family highlight moments" className="w-full">
        <div className="relative flex aspect-[16/10] max-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-[#fcfbfa] px-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff0f7] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#c0185a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e91e8c]" aria-hidden="true" />
            Ormakoodu Highlights
          </span>
          <p className="mt-2.5 text-sm font-medium text-zinc-800">
            {loaded ? 'No upcoming family events scheduled yet' : 'Loading upcoming highlights…'}
          </p>
          <p
            className="mt-1 text-xs text-zinc-500"
            style={{
              fontFamily: "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
            }}
          >
            വരാനിരിക്കുന്ന കുടുംബ വിശേഷങ്ങൾ ഇവിടെ കാണാം
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Family highlight moments"
      aria-roledescription="carousel"
      className="w-full"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.06)] select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Horizontal Slide Track */}
        <div
          className={`flex ${
            isTouching && dragOffsetPx !== 0
              ? 'transition-none'
              : 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
          }`}
          style={{
            transform: `translate3d(calc(-${safeIndex * 100}% + ${dragOffsetPx}px), 0, 0)`,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-[#4a0d29]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${count}: ${item.title}`}
            >
              {item.imageSrc && (
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 580px, 440px"
                  className="object-cover"
                  draggable={false}
                />
              )}

              {/* Subtle bottom scrim for readable white overlay text */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/15"
                aria-hidden="true"
              />

              {/* Top-left member avatar & category badge */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-zinc-900/80 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {item.memberInitials}
                </span>
                <span className="text-xs font-medium text-white drop-shadow-sm">
                  {item.memberName}
                </span>
                {item.categoryName && (
                  <span className="rounded-full bg-[#e91e8c]/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {item.categoryName}
                  </span>
                )}
              </div>

              {/* Bottom-left event title, Malayalam subtitle, date & time */}
              <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold tracking-tight text-white drop-shadow-sm sm:text-xl">
                    {item.title}
                  </h3>
                  <p
                    className="mt-0.5 truncate text-xs text-white/85"
                    style={{
                      fontFamily:
                        "var(--font-noto-malayalam), 'Noto Sans Malayalam', sans-serif",
                    }}
                  >
                    {item.malayalamTitle}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-white/90">
                    <HiOutlineClock className="h-3.5 w-3.5 shrink-0" aria-hidden={true} />
                    <span>{item.dateTime}</span>
                  </div>
                </div>

                {/* Minimal slide indicators (no prev/next arrows) */}
                {count > 1 && (
                  <div
                    className="mb-0.5 flex shrink-0 items-center gap-1.5"
                    aria-hidden="true"
                  >
                    {items.map((dotItem, dotIdx) => (
                      <span
                        key={dotItem.id}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          dotIdx === safeIndex
                            ? 'w-4 bg-[#e91e8c]'
                            : 'w-1.5 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
