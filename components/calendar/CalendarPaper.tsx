'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import CalendarHeader from './CalendarHeader';
import WeekdayHeader from './WeekdayHeader';
import CalendarGrid from './CalendarGrid';
import { buildMonthData, type MonthData } from '@/lib/calendarData';
import { useSwipeNavigation } from '@/lib/useSwipeNavigation';
import Image from 'next/image';
import logo from '../../src/assets/ormakoodu-logo.png';

// All class names are global CSS classes defined in CalendarStyles.tsx (ok-* prefix).
// No CSS Module imports — avoids a Turbopack + @tailwindcss/turbopack parsing bug.

interface CalendarPaperProps {
  /** Initial month data (server-rendered for the current month). */
  monthData: MonthData;
}

type SlideDirection = 'left' | 'right' | null;

export default function CalendarPaper({ monthData: initialMonthData }: CalendarPaperProps) {
  // ── Paper-unroll animation (fires only once on initial mount) ───────────────
  const [animDone, setAnimDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimDone(true), 2100);
    return () => clearTimeout(timer);
  }, []);

  const paperAnimClass = animDone ? 'ok-settled' : 'ok-animating';
  const contentAnimClass = animDone ? '' : 'ok-content-reveal';
  const rollClass = animDone ? '' : 'ok-roll-anim';
  const shadowClass = animDone ? '' : 'ok-shadow-anim';

  // ── Month navigation state ──────────────────────────────────────────────────
  const [currentData, setCurrentData] = useState<MonthData>(initialMonthData);
  const [slideDir, setSlideDir] = useState<SlideDirection>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionLockRef = useRef(false);

  /**
   * Navigate to a neighbouring month.
   * direction: 'next' (swipe left) | 'prev' (swipe right)
   */
  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (transitionLockRef.current) return;
      transitionLockRef.current = true;

      const year = currentData.gregorianYear;
      const monthName = currentData.gregorianMonth;
      const GREGORIAN_MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      let monthIndex = GREGORIAN_MONTHS.indexOf(monthName);

      if (direction === 'next') {
        monthIndex += 1;
      } else {
        monthIndex -= 1;
      }

      let newYear = year;
      if (monthIndex > 11) {
        monthIndex = 0;
        newYear = year + 1;
      } else if (monthIndex < 0) {
        monthIndex = 11;
        newYear = year - 1;
      }

      const newData = buildMonthData(newYear, monthIndex);

      // 1. Trigger exit animation on current content
      setSlideDir(direction === 'next' ? 'left' : 'right');
      setIsTransitioning(true);

      // 2. After exit finishes, swap data and play enter animation
      setTimeout(() => {
        setCurrentData(newData);
        setSlideDir(null); // reset so the enter animation key fires fresh
        setIsTransitioning(false);
        // Allow next gesture only after full transition
        setTimeout(() => {
          transitionLockRef.current = false;
        }, 320);
      }, 280);
    },
    [currentData],
  );

  const goNext = useCallback(() => navigate('next'), [navigate]);
  const goPrev = useCallback(() => navigate('prev'), [navigate]);

  // ── Swipe / mouse-drag navigation ──────────────────────────────────────────
  const swipeTargetRef = useRef<HTMLDivElement>(null);
  useSwipeNavigation(swipeTargetRef, goNext, goPrev);

  // ── Slide transition class for the inner content wrapper ───────────────────
  //   We only apply the sliding class when transitioning so idle state is clean.
  const slideClass = isTransitioning
    ? slideDir === 'left'
      ? 'ok-slide-exit-left'
      : 'ok-slide-exit-right'
    : 'ok-slide-enter';

  return (
    <div className="ok-paper-container">
      {/* Cylindrical roll at the very top */}
      <div className={`ok-paper-roll${rollClass ? ` ${rollClass}` : ''}`} aria-hidden="true" />

      {/* The paper — 3D animation target (initial unroll only) */}
      <div className={`ok-paper${paperAnimClass ? ` ${paperAnimClass}` : ''}`}>
        {/*
          Swipe target — covers the whole paper surface.
          touch-action: pan-y lets the browser scroll vertically without
          fighting our gesture recogniser.
        */}
        <div
          ref={swipeTargetRef}
          className="ok-swipe-surface"
          aria-label="Swipe left for next month, swipe right for previous month"
        >
          {/* Sliding content — animates out/in on month change */}
          <div className={`ok-slide-content ${slideClass}`}>
            {/* Progressive content reveal (initial load only) */}
            <div className={contentAnimClass}>
              <CalendarHeader monthData={currentData} />
              <WeekdayHeader />
              <CalendarGrid monthData={currentData} />

              {/* Footer branding */}
              <div className="ok-cal-footer">
                <div className="ok-brand-dot" aria-hidden="true" />
                <span className="ok-brand-name">
                  <Image src={logo} alt="" className="w-[200px] h-auto" />
                </span>
                <div className="ok-brand-dot" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Moving shadow near the unrolling edge */}
      <div className={`ok-unroll-shadow${shadowClass ? ` ${shadowClass}` : ''}`} aria-hidden="true" />
    </div>
  );
}
