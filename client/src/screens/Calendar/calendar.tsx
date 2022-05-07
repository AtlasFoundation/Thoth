import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';

export default function Sample() {
  const [value, onChange] = useState(new Date());

  return (
    <div className="Sample">
      <div className="Sample__container">
        <main className="Sample__container__content">
          <Calendar onChange={onChange} showWeekNumbers value={value} className="calendar" />
        </main>
      </div>
    </div>
  );
}