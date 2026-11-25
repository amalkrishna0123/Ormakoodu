'use client';

import React, { useEffect, useState } from 'react';
import CalendarHeader from './CalendarHeader';
import WeekdayHeader from './WeekdayHeader';
import CalendarGrid from './CalendarGrid';
import type { MonthData } from '@/lib/calendarData';
import Image from 'next/image';
import logo from "../../src/assets/ormakoodu-logo.png"

// All class names are global CSS classes defined in app/globals.css (ok-* prefix).
// No CSS Module imports — avoids a Turbopack + @tailwindcss/turbopack parsing bug.

interface CalendarPaperProps {
  monthData: MonthData;
}

export default function CalendarPaper({ monthData }: CalendarPaperProps) {
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    // After 2-second animation + 100ms buffer, remove will-change
    const timer = setTimeout(() => setAnimDone(true), 2100);
    return () => clearTimeout(timer);
  }, []);

  const paperAnimClass = animDone ? 'ok-settled' : 'ok-animating';
  const contentAnimClass = animDone ? '' : 'ok-content-reveal';
  const rollClass = animDone ? '' : 'ok-roll-anim';
  const shadowClass = animDone ? '' : 'ok-shadow-anim';

  return (
    <div className="ok-paper-container">
      {/* Cylindrical roll at the very top */}
      <div className={`ok-paper-roll${rollClass ? ` ${rollClass}` : ''}`} aria-hidden="true" />

      {/* The paper — 3D animation target */}
      <div className={`ok-paper${paperAnimClass ? ` ${paperAnimClass}` : ''}`}>
        {/* Progressive content reveal */}
        <div className={contentAnimClass}>
          <CalendarHeader monthData={monthData} />
          <WeekdayHeader />
          <CalendarGrid monthData={monthData} />

          {/* Footer branding */}
          <div className="ok-cal-footer">
            <div className="ok-brand-dot" aria-hidden="true" />
            <span className="ok-brand-name">
              <Image src={logo} alt="" className='w-[200px] h-auto'/>
            </span>
            <div className="ok-brand-dot" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Moving shadow near the unrolling edge */}
      <div className={`ok-unroll-shadow${shadowClass ? ` ${shadowClass}` : ''}`} aria-hidden="true" />
    </div>
  );
}
