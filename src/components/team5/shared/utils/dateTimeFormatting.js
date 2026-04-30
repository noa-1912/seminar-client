/**
 * Date and Time Formatting Utilities
 * Provides Hebrew-localized formatting for dates, times, and date ranges
 * Used across scheduling components
 */

// Hebrew day names
const HEBREW_DAYS = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת'
];

// Hebrew month names
const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר'
];

/**
 * Get Hebrew day name (e.g., "שני" for Monday)
 * @param {Date} date
 * @returns {string}
 */
export const getHebrewDayName = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return HEBREW_DAYS[d.getDay()];
};

/**
 * Get Hebrew month name (e.g., "אפריל")
 * @param {Date} date
 * @returns {string}
 */
export const getHebrewMonthName = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return HEBREW_MONTHS[d.getMonth()];
};

/**
 * Pad number with leading zero (1 → "01")
 * @private
 * @param {number} num
 * @returns {string}
 */
const padZero = (num) => String(num).padStart(2, '0');

/**
 * Format date to "DD.MM.YYYY" format (e.g., "23.04.2026")
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  
  const day = padZero(d.getDate());
  const month = padZero(d.getMonth() + 1);
  const year = d.getFullYear();
  
  return `${day}.${month}.${year}`;
};

/**
 * Format time to "HH:mm" format (e.g., "14:30")
 * @param {Date|string} date
 * @returns {string}
 */
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  
  const hours = padZero(d.getHours());
  const minutes = padZero(d.getMinutes());
  
  return `${hours}:${minutes}`;
};

/**
 * Format date and time together
 * Returns: "ב' אפריל 14:30" or "23.04.2026 14:30" depending on includeDay parameter
 * @param {Date|string} date
 * @param {boolean} includeDay - if true, shows "בX חודש HH:mm", if false shows "DD.MM.YYYY HH:mm"
 * @returns {string}
 */
export const formatDateTime = (date, includeDay = true) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  
  const time = formatTime(d);
  
  if (includeDay) {
    const day = d.getDate();
    const monthName = getHebrewMonthName(d);
    return `${day} ${monthName} ${time}`;
  } else {
    const fullDate = formatDate(d);
    return `${fullDate} ${time}`;
  }
};

/**
 * Format a time range (e.g., "14:00 - 14:45")
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string}
 */
export const formatTimeRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const start = formatTime(startDate);
  const end = formatTime(endDate);
  return `${start} - ${end}`;
};

/**
 * Format a date range (e.g., "23.04.2026 - 25.04.2026")
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string}
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

/**
 * Format a complete date/time range (e.g., "23.04 14:00 - 14:45")
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string}
 */
export const formatCompleteRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const d = new Date(startDate);
  const dateStr = formatDate(d);
  const timeRange = formatTimeRange(startDate, endDate);
  return `${dateStr} ${timeRange}`;
};

/**
 * Check if a date is today
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is tomorrow
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isTomorrow = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear();
};

/**
 * Check if a date is in the past
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isPast = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d < new Date();
};

/**
 * Check if a date is in the future
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isFuture = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d > new Date();
};

/**
 * Get relative date string in Hebrew
 * Returns: "היום" (today), "מחר" (tomorrow), "עוד X ימים" (in X days), etc.
 * @param {Date|string} date
 * @returns {string}
 */
export const getRelativeDate = (date) => {
  if (!date) return '';
  
  if (isToday(date)) return 'היום';
  if (isTomorrow(date)) return 'מחר';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  const diffTime = d - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    if (diffDays === 2) return 'בעוד יומיים';
    if (diffDays < 7) return `עוד ${diffDays} ימים`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `עוד ${weeks} שבועות`;
    }
    return `עוד ${Math.floor(diffDays / 30)} חודשים`;
  } else if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 1) return 'אתמול';
    if (absDays === 2) return 'לפני יומיים';
    if (absDays < 7) return `לפני ${absDays} ימים`;
    if (absDays < 30) {
      const weeks = Math.floor(absDays / 7);
      return `לפני ${weeks} שבועות`;
    }
    return `לפני ${Math.floor(absDays / 30)} חודשים`;
  }
  
  return 'היום';
};

/**
 * Get duration between two dates in minutes
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number} duration in minutes
 */
export const getDurationInMinutes = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60));
};

/**
 * Get duration between two dates as formatted string
 * Returns: "30 דקות" or "1 שעה ו-30 דקות"
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string}
 */
export const getDurationFormatted = (startDate, endDate) => {
  const minutes = getDurationInMinutes(startDate, endDate);
  
  if (minutes <= 0) return '';
  if (minutes < 60) return `${minutes} דקות`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) {
    return hours === 1 ? 'שעה' : `${hours} שעות`;
  }
  
  const hoursText = hours === 1 ? 'שעה' : `${hours} שעות`;
  return `${hoursText} ו-${remainingMins} דקות`;
};

/**
 * Check if date is within a range
 * @param {Date|string} date
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {boolean}
 */
export const isWithinRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

/**
 * Get dates between start and end (inclusive)
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {Date[]}
 */
export const getDatesBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const dates = [];
  const currentDate = new Date(startDate);
  const finalDate = new Date(endDate);
  
  while (currentDate <= finalDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Format a date for input type="date" HTML element
 * Returns: "2026-04-23"
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  
  const year = d.getFullYear();
  const month = padZero(d.getMonth() + 1);
  const day = padZero(d.getDate());
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a time for input type="time" HTML element
 * Returns: "14:30"
 * @param {Date|string} date
 * @returns {string}
 */
export const formatTimeForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';
  
  const hours = padZero(d.getHours());
  const minutes = padZero(d.getMinutes());
  
  return `${hours}:${minutes}`;
};

/**
 * Parse time string "HH:mm" and return Date with that time
 * @param {string} timeStr - format "HH:mm"
 * @param {Date} baseDate - date to use for the result, defaults to today
 * @returns {Date}
 */
export const parseTime = (timeStr, baseDate = new Date()) => {
  if (!timeStr) return baseDate;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

/**
 * Compare two dates (ignoring time)
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {number}
 */
export const compareDates = (date1, date2) => {
  if (!date1 || !date2) return 0;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

/**
 * Get start of day (00:00:00)
 * @param {Date|string} date
 * @returns {Date}
 */
export const getStartOfDay = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day (23:59:59)
 * @param {Date|string} date
 * @returns {Date}
 */
export const getEndOfDay = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
