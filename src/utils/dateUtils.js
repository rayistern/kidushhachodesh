import { HebrewCalendar, HDate, gematriya } from 'hebcal';

/**
 * Converts a Gregorian date to a Hebrew date for display
 * @param {Date} gregorianDate - JavaScript Date object
 * @returns {Object} Hebrew date information for display
 */
export function getHebrewDateDisplay(gregorianDate) {
  try {
    // Make sure we're working with a proper Date object
    const date = new Date(gregorianDate);
    
    // Create Hebrew date - ensure we're passing year, month, day correctly
    const hdate = new HDate(date);
    
    // Get the Hebrew date components
    const day = hdate.getDate();
    const month = hdate.getMonthName();
    const year = hdate.getFullYear();
    
    return {
      formatted: `${day} ${month} ${year}`,
      hebrewFormatted: `${gematriya(day)} ${month} ${gematriya(year)}`,
      isRoshChodesh: day === 1 || day === 30,
      day,
      month,
      year
    };
  } catch (error) {
    console.error("Error converting to Hebrew date:", error);
    return {
      formatted: "Error converting date",
      hebrewFormatted: "שגיאה בהמרת התאריך"
    };
  }
}

/**
 * Converts a Hebrew date to a Gregorian date for INTERNAL USE
 * @param {number} year - Hebrew year
 * @param {number} month - Hebrew month (1-13)
 * @param {number} day - Hebrew day
 * @returns {Date} JavaScript Date object
 */
export function hebrewToGregorian(year, month, day) {
  try {
    const hdate = new HDate(day, month, year);
    return hdate.greg();
  } catch (error) {
    console.error("Error converting from Hebrew date:", error);
    return new Date(); // Return current date as fallback
  }
}

/**
 * Gets molad information for display
 * @param {Date} gregorianDate - JavaScript Date object
 * @returns {Object} Molad information for display
 */
export function getMoladDisplay(gregorianDate) {
  try {
    // Create a new date to avoid reference issues
    const date = new Date(gregorianDate);
    
    // Get Hebrew date
    const hdate = new HDate(date);
    
    // Get current Hebrew month name for display
    const monthName = hdate.getMonthName();
    const year = hdate.getFullYear();
    const month = hdate.getMonth();
    
    // Custom function to determine if a Hebrew year is a leap year
    const isHebrewLeapYear = (year) => {
      return (((7 * year) + 1) % 19) < 7;
    };
    
    // Base molad for Tishrei 5700 (Oct 1939)
    const baseMolad = {
      year: 5700,
      month: 7, // Tishrei
      day: 2, // Monday
      hour: 17,
      minutes: 21,
      parts: 0
    };
    
    // Calculate months since base molad
    const yearDiff = year - baseMolad.year;
    const monthsInYear = isHebrewLeapYear(year) ? 13 : 12;
    
    // Calculate total months in previous years
    let prevYearsMonths = 0;
    for (let i = 0; i < yearDiff; i++) {
      prevYearsMonths += isHebrewLeapYear(baseMolad.year + i) ? 13 : 12;
    }
    
    const monthsSinceBase = prevYearsMonths + ((month + monthsInYear - baseMolad.month) % monthsInYear);
    
    // Average molad interval: 29 days, 12 hours, 793 parts
    const moladInterval = 29 + (12/24) + (793/1080/24);
    
    // Calculate days since base molad
    const daysSinceBase = monthsSinceBase * moladInterval;
    
    // Calculate new molad
    const totalDays = Math.floor(daysSinceBase);
    const remainingHours = (daysSinceBase - totalDays) * 24;
    const hours = Math.floor(remainingHours);
    const remainingMinutes = (remainingHours - hours) * 60;
    const minutes = Math.floor(remainingMinutes);
    const parts = Math.floor((remainingMinutes - minutes) * 1080);
    
    // Calculate day of week (1=Sunday, 7=Saturday)
    const dow = ((baseMolad.day + totalDays - 1) % 7) + 1;
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      formatted: `${dayNames[dow-1]}, ${hours} hours, ${minutes} minutes, and ${parts} parts`,
      month: monthName,
      year: year,
      dow: dow,
      hour: hours,
      minute: minutes,
      parts: parts,
      calculated: true
    };
  } catch (error) {
    console.error("Error calculating molad:", error);
    return {
      formatted: `Error calculating molad: ${error.message}`,
      error: true
    };
  }
}

/**
 * Displays the current Hebrew date and time in the UI
 * @param {Object} hebrewDate - Hebrew date object from getHebrewDate
 * @param {Object} moladInfo - Molad information from getMoladInfo
 * @returns {JSX.Element} - UI element to display
 */
export function displayHebrewDateTime(hebrewDate, moladInfo) {
  return (
    <div className="hebrew-date-display">
      <div className="hebrew-date">
        <h3>Hebrew Date</h3>
        <p className="hebrew-text">{hebrewDate.hebrewFormatted}</p>
        <p>{hebrewDate.formatted}</p>
        {hebrewDate.isRoshChodesh && <p className="special-day">Rosh Chodesh</p>}
      </div>
      
      <div className="molad-info">
        <h3>Molad</h3>
        <p>Month: {hebrewDate.month}</p>
        <p>Time: {moladInfo.formatted}</p>
        <p>Hebrew Date: {hebrewDate.hebrewFormatted}</p>
      </div>
    </div>
  );
} 