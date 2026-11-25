import React from 'react';
import type { MonthData } from '@/lib/calendarData';

interface CalendarHeaderProps {
  monthData: MonthData;
}

export default function CalendarHeader({ monthData }: CalendarHeaderProps) {
  return (
    <div className="ok-cal-header">
      <div className="ok-header-top">
        <div>
          <div className="ok-ml-month-name">{monthData.malayalamMonth}</div>
          <div className="ok-accent-line" aria-hidden="true" />
        </div>
        <div className="ok-gr-month-year">
          {monthData.gregorianMonth} {monthData.gregorianYear}
          <span>{monthData.panchangamInfo}</span>
        </div>
      </div>
      <div className="ok-header-bottom">
        <span className="ok-kollavarsham">
          കൊല്ലവർഷം {monthData.kollavarsham}
        </span>
        <span className="ok-panchangam-info">Ormakoodu</span>
      </div>
    </div>
  );
}
