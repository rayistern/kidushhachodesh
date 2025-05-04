import React, { useState } from 'react';
import './DateControl.css';

const DateControl = ({ date, onDateChange }) => {
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth() + 1);
  const [day, setDay] = useState(date.getDate());
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newDate = new Date(year, month - 1, day);
    onDateChange(newDate);
  };
  
  // Quick date adjustments
  const adjustDate = (days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
    
    // Update local state
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth() + 1);
    setDay(newDate.getDate());
  };
  
  return (
    <div className="date-control">
      <h3>Adjust Date</h3>
      
      <div className="quick-controls">
        <button onClick={() => adjustDate(-30)}>-30 Days</button>
        <button onClick={() => adjustDate(-1)}>-1 Day</button>
        <button onClick={() => adjustDate(1)}>+1 Day</button>
        <button onClick={() => adjustDate(30)}>+30 Days</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="date-inputs">
          <div className="form-group">
            <label htmlFor="year">Year:</label>
            <input 
              type="number" 
              id="year" 
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              min={-3000}
              max={3000}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="month">Month:</label>
            <input 
              type="number" 
              id="month" 
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              min={1}
              max={12}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="day">Day:</label>
            <input 
              type="number" 
              id="day" 
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value))}
              min={1}
              max={31}
            />
          </div>
        </div>
        
        <button type="submit" className="submit-btn">Update Date</button>
      </form>
      
      <div className="current-date">
        <p>Current Date: {date.toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default DateControl; 