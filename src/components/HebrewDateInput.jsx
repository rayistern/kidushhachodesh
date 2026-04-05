import React, { useState, useEffect } from 'react';
import './HebrewDateInput.css';
import { CONSTANTS, HEBREW_MONTHS_REGULAR, HEBREW_MONTHS_LEAP } from '../constants';

const HebrewDateInput = ({ date, onDateChange }) => {
  const [hebrewDate, setHebrewDate] = useState({
    day: 1,
    month: 0,
    year: 5783
  });
  
  // Convert Gregorian to Hebrew on mount and date change
  useEffect(() => {
    const converted = gregorianToHebrew(date);
    setHebrewDate(converted);
  }, [date]);
  
  // Hebrew calendar calculations
  const isLeapYear = (year) => {
    const cycle = year % 19;
    return [0, 3, 6, 8, 11, 14, 17].includes(cycle);
  };
  
  const getMonthsInYear = (year) => {
    return isLeapYear(year) ? 13 : 12;
  };
  
  const getMonthLength = (year, month) => {
    // Full proper implementation of month lengths based on the Jewish calendar rules
    // This is a simplified version
    const monthLengths = {
      0: 30, // Tishri
      1: 29, // Cheshvan - can vary
      2: 30, // Kislev - can vary
      3: 29, // Tevet
      4: 30, // Shevat
      5: 30, // Adar (or Adar I in leap years)
      6: 29, // Adar II (leap years) or Nisan (non-leap)
      7: 30, // Nisan or Iyar
      8: 29, // Iyar or Sivan
      9: 30, // Sivan or Tamuz
      10: 29, // Tamuz or Av
      11: 30, // Av or Elul
      12: 29  // Elul (leap years only)
    };
    
    // Adjust for variations in Cheshvan and Kislev based on year type
    // This would need complex year type calculation for perfect accuracy
    
    return monthLengths[month] || 30;
  };
  
  const gregorianToHebrew = (gregorianDate) => {
    // Advanced implementation using proper algorithms
    // For demonstrative purposes, we'll use a simplified calculation:
    
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const daysSince = Math.floor((gregorianDate - CONSTANTS.BASE_DATE) / MS_PER_DAY);
    
    // Start from base Hebrew date
    let currentHebrewYear = CONSTANTS.BASE_YEAR_HEBREW;
    let currentHebrewMonth = 6; // Nisan (7th month in civil calendar)
    let currentHebrewDay = 3;
    
    // Add days
    let remainingDays = daysSince;
    
    while (remainingDays > 0) {
      const monthLength = getMonthLength(currentHebrewYear, currentHebrewMonth);
      const daysLeftInMonth = monthLength - currentHebrewDay + 1;
      
      if (remainingDays < daysLeftInMonth) {
        currentHebrewDay += remainingDays;
        remainingDays = 0;
      } else {
        remainingDays -= daysLeftInMonth;
        currentHebrewDay = 1;
        
        // Move to next month
        currentHebrewMonth++;
        const monthsInYear = getMonthsInYear(currentHebrewYear);
        if (currentHebrewMonth >= monthsInYear) {
          currentHebrewMonth = 0;
          currentHebrewYear++;
        }
      }
    }
    
    return {
      day: currentHebrewDay,
      month: currentHebrewMonth,
      year: currentHebrewYear
    };
  };
  
  const hebrewToGregorian = (hebrewDate) => {
    // Convert Hebrew date to days since CONSTANTS.BASE_DATE
    // Then add to CONSTANTS.BASE_DATE to get Gregorian date
    
    let totalDays = 0;
    
    // Count days for years
    for (let year = CONSTANTS.BASE_YEAR_HEBREW; year < hebrewDate.year; year++) {
      const monthsInYear = getMonthsInYear(year);
      for (let month = 0; month < monthsInYear; month++) {
        totalDays += getMonthLength(year, month);
      }
    }
    
    // Count days for months in the current year
    for (let month = 0; month < hebrewDate.month; month++) {
      totalDays += getMonthLength(hebrewDate.year, month);
    }
    
    // Add days in current month
    totalDays += hebrewDate.day - 1;
    
    // Subtract the days that were already counted in BASE_DATE
    totalDays -= 2; // Assuming BASE_DATE is 3rd of the month
    
    // Create new Gregorian date
    const newDate = new Date(CONSTANTS.BASE_DATE);
    newDate.setDate(newDate.getDate() + totalDays);
    
    return newDate;
  };
  
  const handleHebrewDateChange = (field, value) => {
    const updatedDate = { ...hebrewDate, [field]: parseInt(value) };
    
    // Validate day based on month length
    if (field === 'day' || field === 'month' || field === 'year') {
      const maxDay = getMonthLength(updatedDate.year, updatedDate.month);
      if (updatedDate.day > maxDay) {
        updatedDate.day = maxDay;
      }
    }
    
    setHebrewDate(updatedDate);
    
    // Convert to Gregorian and update parent
    const gregorianDate = hebrewToGregorian(updatedDate);
    onDateChange(gregorianDate);
  };
  
  // Get month names based on year type
  const getMonthOptions = () => {
    const isLeap = isLeapYear(hebrewDate.year);
    const months = isLeap ? HEBREW_MONTHS_LEAP : HEBREW_MONTHS_REGULAR;
    
    return months.map((month, index) => (
      <option key={index} value={index}>{month}</option>
    ));
  };
  
  return (
    <div className="hebrew-date-input">
{/*       <h3>Hebrew Date</h3>
 */}      
{/*       <div className="hebrew-date-form">
        <div className="form-group">
          <label>Day</label>
          <input
            type="number"
            min="1"
            max={getMonthLength(hebrewDate.year, hebrewDate.month)}
            value={hebrewDate.day}
            onChange={(e) => handleHebrewDateChange('day', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Month</label>
          <select
            value={hebrewDate.month}
            onChange={(e) => handleHebrewDateChange('month', e.target.value)}
          >
            {getMonthOptions()}
          </select>
        </div>
        
        <div className="form-group">
          <label>Year</label>
          <input
            type="number"
            min="3760" // Approximately 1 CE
            max="6000"
            value={hebrewDate.year}
            onChange={(e) => handleHebrewDateChange('year', e.target.value)}
          />
        </div>
      </div>
      
      <div className="formatted-date">
        {hebrewDate.day} {isLeapYear(hebrewDate.year) ? 
          HEBREW_MONTHS_LEAP[hebrewDate.month] : 
          HEBREW_MONTHS_REGULAR[hebrewDate.month]} {hebrewDate.year}
      </div> */}
    </div>
  );
};

export default HebrewDateInput; 