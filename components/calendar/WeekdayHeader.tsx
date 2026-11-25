import React from 'react';

const WEEKDAYS = [
  { short: 'Sun', malayalam: 'ഞായർ', isSunday: true },
  { short: 'Mon', malayalam: 'തിങ്കൾ', isSunday: false },
  { short: 'Tue', malayalam: 'ചൊവ്വ', isSunday: false },
  { short: 'Wed', malayalam: 'ബുധൻ', isSunday: false },
  { short: 'Thu', malayalam: 'വ്യാഴം', isSunday: false },
  { short: 'Fri', malayalam: 'വെള്ളി', isSunday: false },
  { short: 'Sat', malayalam: 'ശനി', isSunday: false },
];

export default function WeekdayHeader() {
  return (
    <div className="ok-weekday-header" role="row" aria-label="Weekday headers">
      {WEEKDAYS.map((day) => (
        <div
          key={day.short}
          role="columnheader"
          className={`ok-weekday-cell${day.isSunday ? ' ok-weekday-cell-sunday' : ''}`}
        >
          <span className="ok-weekday-name">{day.short}</span>
          <span className="ok-weekday-ml">{day.malayalam}</span>
        </div>
      ))}
    </div>
  );
}
