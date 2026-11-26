import React from 'react';
import type { CalendarDay, MonthData } from '@/lib/calendarData';
import CalendarDateCell from './CalendarDateCell';

interface CalendarGridProps {
  monthData: MonthData;
  showNakshatram?: boolean;
  onSelectDay?: (day: CalendarDay) => void;
}

export default function CalendarGrid({
  monthData,
  showNakshatram = true,
  onSelectDay,
}: CalendarGridProps) {
  return (
    <div
      className="ok-date-grid"
      role="grid"
      aria-label={`${monthData.gregorianMonth} ${monthData.gregorianYear} calendar`}
    >
      {monthData.days.map((day, index) => (
        <CalendarDateCell
          key={day.isoDate || index}
          day={day}
          showNakshatram={showNakshatram}
          onSelect={onSelectDay}
        />
      ))}
    </div>
  );
}
