import React from 'react';
import type { CalendarDay } from '@/lib/calendarData';

interface CalendarDateCellProps {
  day: CalendarDay;
}

export default function CalendarDateCell({ day }: CalendarDateCellProps) {
  if (day.gregorianDate === null) {
    return <div className="ok-date-cell" aria-hidden="true" />;
  }

  const cellClass = [
    'ok-date-cell',
    !day.isCurrentMonth ? 'ok-date-other-month' : '',
    day.isToday ? 'ok-date-today' : '',
    day.isSunday ? 'ok-date-sunday' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cellClass}
      role="gridcell"
      aria-label={`${day.gregorianDate}${day.nakshatram ? `, ${day.nakshatram}` : ''}`}
      aria-current={day.isToday ? 'date' : undefined}
    >
      <span className="ok-gregorian-date">{day.gregorianDate}</span>
      {day.isCurrentMonth && (
        <span className="ok-ml-date-num">{day.malayalamDate}</span>
      )}
      {day.isCurrentMonth && day.nakshatram && (
        <span className="ok-nakshatram-label">{day.nakshatram}</span>
      )}
    </div>
  );
}
