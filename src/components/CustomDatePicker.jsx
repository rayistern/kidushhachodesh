import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePicker = ({ selectedDate, onChange }) => {
  return (
    <div className="custom-date-picker">
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="MMMM d, yyyy"
        className="date-picker"
        popperPlacement="top-start"
        popperClassName="date-picker-popper"
        popperModifiers={{
          preventOverflow: {
            enabled: true,
          },
        }}
      />
    </div>
  );
};

export default CustomDatePicker; 