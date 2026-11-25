import React from 'react';
import type { MonthData } from '@/lib/calendarData';
import CalendarDateCell from './CalendarDateCell';

interface CalendarGridProps {
  monthData: MonthData;
}

export default function CalendarGrid({ monthData }: CalendarGridProps) {
  return (
    <div
      className="ok-date-grid"
      role="grid"
      aria-label={`${monthData.gregorianMonth} ${monthData.gregorianYear} calendar`}
    >
      {monthData.days.map((day, index) => (
        <CalendarDateCell key={index} day={day} />
      ))}
    </div>
  );
}
