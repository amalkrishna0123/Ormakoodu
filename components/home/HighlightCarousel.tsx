'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { HiOutlineClock } from 'react-icons/hi2';
import type { HighlightCarouselItem } from '@/lib/homePreviewData';

interface HighlightCarouselProps {
  items: HighlightCarouselItem[];
  autoPlayIntervalMs?: number;
}

const SWIPE_THRESHOLD_PX = 45;

export default function HighlightCarousel({
  items,
  autoPlayIntervalMs = 4000,
}: HighlightCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const count = items.length;

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

  if (count === 0) return null;

  return (
    <section
      aria-label="Family highlight moments"
      aria-roledescription="carousel"
      className="w-full"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] select-none"
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
            transform: `translate3d(calc(-${activeIndex * 100}% + ${dragOffsetPx}px), 0, 0)`,
          }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="relative aspect-[16/10] w-full shrink-0 overflow-hidden"
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${count}: ${item.title}`}
            >
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                priority={idx === 0}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 580px, 440px"
                className="object-cover"
                draggable={false}
              />

              {/* Subtle bottom scrim for readable white overlay text */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/15"
                aria-hidden="true"
              />

              {/* Top-left member avatar badge (inspired by reference card) */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-zinc-900/80 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {item.memberInitials}
                </span>
                <span className="text-xs font-medium text-white drop-shadow-sm">
                  {item.memberName}
                </span>
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
                          dotIdx === activeIndex
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

