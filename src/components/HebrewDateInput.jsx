import React, { useState, useEffect } from 'react';
import hebcal from 'hebcal';
import './HebrewDateInput.css';
import { HEBREW_MONTHS_REGULAR, HEBREW_MONTHS_LEAP } from '../constants';

const { HDate } = hebcal;

// Map Rambam/civil Hebrew month names (Tishrei-first) to 0-based index used by the UI.
const MONTH_INDEX = {
  REGULAR: HEBREW_MONTHS_REGULAR,
  LEAP: HEBREW_MONTHS_LEAP,
};

const HebrewDateInput = ({ date, onDateChange }) => {
  const [hebrewDate, setHebrewDate] = useState({ day: 1, month: 0, year: 5783 });

  useEffect(() => {
    const hd = new HDate(date);
    const isLeap = hd.isLeapYear();
    const monthNames = isLeap ? MONTH_INDEX.LEAP : MONTH_INDEX.REGULAR;
    const idx = monthNames.indexOf(hd.getMonthName());
    setHebrewDate({
      day: hd.getDate(),
      month: idx >= 0 ? idx : 0,
      year: hd.getFullYear(),
    });
  }, [date]);

  const handleHebrewDateChange = (field, value) => {
    const updated = { ...hebrewDate, [field]: parseInt(value, 10) };
    const monthNames = new HDate(1, 'Tishrei', updated.year).isLeapYear()
      ? MONTH_INDEX.LEAP : MONTH_INDEX.REGULAR;
    const monthName = monthNames[updated.month] || 'Tishrei';
    const hd = new HDate(updated.day, monthName, updated.year);
    setHebrewDate(updated);
    onDateChange(hd.greg());
  };

  const getMonthOptions = () => {
    const isLeap = new HDate(1, 'Tishrei', hebrewDate.year).isLeapYear();
    const months = isLeap ? HEBREW_MONTHS_LEAP : HEBREW_MONTHS_REGULAR;
    return months.map((month, index) => (
      <option key={index} value={index}>{month}</option>
    ));
  };

  // UI is intentionally inactive for now — kept as a hook point; no visible
  // DOM. If/when we re-enable the Hebrew picker, uncomment the form below.
  void handleHebrewDateChange; void getMonthOptions;

  return (
    <div className="hebrew-date-input"></div>
  );
};

export default HebrewDateInput;
