import React from 'react';
import type { CalendarDay } from '@/lib/calendarData';

interface CalendarDateCellProps {
  day: CalendarDay;
  showNakshatram?: boolean;
  onSelect?: (day: CalendarDay) => void;
}

export default function CalendarDateCell({
  day,
  showNakshatram = true,
  onSelect,
}: CalendarDateCellProps) {
  if (day.gregorianDate === null) {
    return <div className="ok-date-cell" aria-hidden="true" />;
  }

  const statusClass =
    day.isCurrentMonth && day.dateStatus === 'event'
      ? 'ok-date-event'
      : day.isCurrentMonth && day.dateStatus === 'holiday'
      ? 'ok-date-holiday'
      : day.isSunday
      ? 'ok-date-sunday'
      : '';

  const cellClass = [
    'ok-date-cell',
    !day.isCurrentMonth ? 'ok-date-other-month' : '',
    day.isToday ? 'ok-date-today' : '',
    statusClass,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={() => day.isCurrentMonth && onSelect?.(day)}
      className={`${cellClass} w-full border-0 bg-transparent text-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#e91e8c]`}
      role="gridcell"
      aria-label={`${day.isoDate}${day.nakshatram ? `, ${day.nakshatram}` : ''}`}
      aria-current={day.isToday ? 'date' : undefined}
      style={{ cursor: day.isCurrentMonth ? 'pointer' : 'default' }}
    >
      <span className="ok-gregorian-date">{day.gregorianDate}</span>
      {day.isCurrentMonth && (
        <span className="ok-ml-date-num">
          {day.malayalamMonthMl} {day.malayalamDate}
        </span>
      )}
      {day.isCurrentMonth && showNakshatram && day.nakshatram && (
        <span className="ok-nakshatram-label">{day.nakshatram}</span>
      )}
      {day.isCurrentMonth && day.dateStatus === 'event' && (
        <span className="ok-date-event-dot" aria-hidden="true" />
      )}
    </button>
  );
}
