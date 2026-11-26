'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CalendarHeader from './CalendarHeader';
import WeekdayHeader from './WeekdayHeader';
import CalendarGrid from './CalendarGrid';
import CalendarDatePopup from './CalendarDatePopup';
import { buildMonthData, type CalendarDay, type MonthData } from '@/lib/calendarData';
import { useSwipeNavigation } from '@/lib/useSwipeNavigation';
import {
  subscribeCalendarSettings,
  subscribeHolidays,
  subscribePublicEvents,
} from '@/lib/firestoreService';
import { getEventsForMonthMap } from '@/lib/eventUtils';
import type { CalendarEventDoc, CalendarSettingsDoc } from '@/lib/types';
import type { KeralaOccasion } from '@/lib/keralaHolidays';
import Image from 'next/image';
import logo from '../../src/assets/ormakoodu-logo.png';

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

  // ── Month navigation & realtime Firestore data ──────────────────────────────
  const [viewYear, setViewYear] = useState(initialMonthData.gregorianYear);
  const [viewMonthIndex, setViewMonthIndex] = useState(initialMonthData.gregorianMonthIndex);
  const [events, setEvents] = useState<CalendarEventDoc[]>([]);
  const [holidays, setHolidays] = useState<KeralaOccasion[]>([]);
  const [settings, setSettings] = useState<CalendarSettingsDoc>({
    showNakshatram: true,
    familyReminders: true,
    malayalamNumerals: true,
  });
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const [slideDir, setSlideDir] = useState<SlideDirection>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionLockRef = useRef(false);

  useEffect(() => {
    const unsubEvents = subscribePublicEvents(setEvents);
    const unsubHolidays = subscribeHolidays(setHolidays);
    const unsubSettings = subscribeCalendarSettings(setSettings);
    return () => {
      unsubEvents();
      unsubHolidays();
      unsubSettings();
    };
  }, []);

  const { eventsByDate, eventDates } = useMemo(
    () => getEventsForMonthMap(events, viewYear, viewMonthIndex),
    [events, viewYear, viewMonthIndex]
  );

  const currentData = useMemo(() => {
    // Use server-seeded data only if nothing loaded yet and still on initial month,
    // or rebuild deterministically with live events, holidays, and settings.
    return buildMonthData(viewYear, viewMonthIndex, {
      eventDates,
      firestoreHolidays: holidays,
      useMalayalamNumerals: settings.malayalamNumerals,
    });
  }, [viewYear, viewMonthIndex, eventDates, holidays, settings.malayalamNumerals]);

  /**
   * Navigate to a neighbouring month.
   * direction: 'next' (swipe left) | 'prev' (swipe right)
   */
  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (transitionLockRef.current) return;
      transitionLockRef.current = true;

      let monthIndex = viewMonthIndex + (direction === 'next' ? 1 : -1);
      let newYear = viewYear;
      if (monthIndex > 11) {
        monthIndex = 0;
        newYear += 1;
      } else if (monthIndex < 0) {
        monthIndex = 11;
        newYear -= 1;
      }

      setSlideDir(direction === 'next' ? 'left' : 'right');
      setIsTransitioning(true);

      setTimeout(() => {
        setViewYear(newYear);
        setViewMonthIndex(monthIndex);
        setSlideDir(null);
        setIsTransitioning(false);
        setTimeout(() => {
          transitionLockRef.current = false;
        }, 320);
      }, 280);
    },
    [viewYear, viewMonthIndex],
  );

  const goNext = useCallback(() => navigate('next'), [navigate]);
  const goPrev = useCallback(() => navigate('prev'), [navigate]);

  // ── Swipe / mouse-drag navigation ──────────────────────────────────────────
  const swipeTargetRef = useRef<HTMLDivElement>(null);
  useSwipeNavigation(swipeTargetRef, goNext, goPrev);

  const slideClass = isTransitioning
    ? slideDir === 'left'
      ? 'ok-slide-exit-left'
      : 'ok-slide-exit-right'
    : 'ok-slide-enter';

  return (
    <>
      <div className="ok-paper-container">
        <div className={`ok-paper-roll${rollClass ? ` ${rollClass}` : ''}`} aria-hidden="true" />

        <div className={`ok-paper${paperAnimClass ? ` ${paperAnimClass}` : ''}`}>
          <div
            ref={swipeTargetRef}
            className="ok-swipe-surface"
            aria-label="Swipe left for next month, swipe right for previous month"
          >
            <div className={`ok-slide-content ${slideClass}`}>
              <div className={contentAnimClass}>
                <CalendarHeader monthData={currentData} />
                <WeekdayHeader />
                <CalendarGrid
                  monthData={currentData}
                  showNakshatram={settings.showNakshatram}
                  onSelectDay={setSelectedDay}
                />

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

        <div className={`ok-unroll-shadow${shadowClass ? ` ${shadowClass}` : ''}`} aria-hidden="true" />
      </div>

      <CalendarDatePopup
        day={selectedDay}
        events={selectedDay ? eventsByDate[selectedDay.isoDate] ?? [] : []}
        onClose={() => setSelectedDay(null)}
      />
    </>
  );
}
