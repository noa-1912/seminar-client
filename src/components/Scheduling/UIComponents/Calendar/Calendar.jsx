/**
 * Calendar Component
 * Interactive calendar for date selection with availability indicators
 * 
 * Usage:
 * <Calendar
 *   selectedDate={new Date()}
 *   onDateSelect={(date) => console.log(date)}
 *   availabilityMap={{ '2026-04-23': 'available', '2026-04-24': 'unavailable' }}
 * />
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  ButtonBase
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getHebrewMonthName, formatDateForInput, compareDates } from '../../utils/dateTimeFormatting';
import './Calendar.css';

/**
 * Interactive calendar component with availability indicators
 * @component
 * @param {Object} props
 * @param {Date} props.selectedDate - Currently selected date
 * @param {Function} props.onDateSelect - Callback when date is selected (date) => void
 * @param {Object} props.availabilityMap - Map of dates to availability status
 *   Format: { 'YYYY-MM-DD': 'available'|'unavailable'|'unknown' }
 * @param {Date} props.minDate - Minimum selectable date
 * @param {Date} props.maxDate - Maximum selectable date
 * @param {boolean} props.showToday - Highlight today, default: true
 * @param {Array<Date>} props.disabledDates - Array of dates that cannot be selected
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
function Calendar({
  selectedDate = new Date(),
  onDateSelect = null,
  availabilityMap = {},
  minDate = null,
  maxDate = null,
  showToday = true,
  disabledDates = [],
  className = ''
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  /**
   * Get availability status for a date
   */
  const getAvailabilityStatus = (date) => {
    const dateStr = formatDateForInput(date);
    return availabilityMap[dateStr] || 'unknown';
  };

  /**
   * Check if date is disabled
   */
  const isDateDisabled = (date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(d => compareDates(d, date) === 0);
  };

  /**
   * Check if date is today
   */
  const isDateToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Check if date is selected
   */
  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  /**
   * Get all days to display in the calendar (including days from prev/next month)
   */
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Starting day index (0-6)
    const startingDayOfWeek = firstDay.getDay();

    // Days from previous month
    const daysFromPrevMonth = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      daysFromPrevMonth.push(new Date(year, month, -i));
    }

    // Days of current month
    const daysOfMonth = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysOfMonth.push(new Date(year, month, i));
    }

    // Days from next month
    const totalCells = daysFromPrevMonth.length + daysOfMonth.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    const daysFromNextMonth = [];
    for (let i = 1; i <= remainingCells; i++) {
      daysFromNextMonth.push(new Date(year, month + 1, i));
    }

    return {
      prev: daysFromPrevMonth,
      current: daysOfMonth,
      next: daysFromNextMonth
    };
  }, [currentMonth]);

  /**
   * Handle month navigation
   */
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  /**
   * Handle date click
   */
  const handleDateClick = (date) => {
    if (!isDateDisabled(date) && onDateSelect) {
      onDateSelect(date);
    }
  };

  /**
   * Render a single day cell
   */
  const renderDayCell = (date, isCurrentMonth) => {
    const isDisabled = isDateDisabled(date);
    const isSelected = isDateSelected(date);
    const isToday = showToday && isDateToday(date);
    const availability = isCurrentMonth ? getAvailabilityStatus(date) : null;

    let backgroundColor = 'transparent';
    let color = isCurrentMonth ? '#333' : '#ccc';
    let borderColor = 'transparent';

    if (isSelected) {
      backgroundColor = '#2196f3';
      color = 'white';
      borderColor = '#1976d2';
    } else if (isToday) {
      backgroundColor = '#e3f2fd';
      borderColor = '#2196f3';
    } else if (isCurrentMonth && availability === 'available') {
      backgroundColor = '#e8f5e9';
    } else if (isCurrentMonth && availability === 'unavailable') {
      backgroundColor = '#ffebee';
    }

    return (
      <ButtonBase
        key={date.toISOString()}
        onClick={() => handleDateClick(date)}
        disabled={isDisabled}
        className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${
          isSelected ? 'selected' : ''
        } ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
        sx={{
          width: '100%',
          aspectRatio: '1',
          position: 'relative',
          padding: '2px',
          borderRadius: '6px',
          border: '1px solid',
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          color: color,
          fontWeight: isSelected || isToday ? 'bold' : '400',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          '&:hover': !isDisabled && !isSelected ? {
            backgroundColor: '#f0f0f0',
            transform: 'scale(1.05)'
          } : {}
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <span>{date.getDate()}</span>
          {isCurrentMonth && availability && availability !== 'unknown' && (
            <Box
              sx={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: availability === 'available' ? '#4caf50' : '#f44336',
                marginTop: '2px'
              }}
            />
          )}
        </Box>
      </ButtonBase>
    );
  };

  const monthName = getHebrewMonthName(currentMonth);
  const year = currentMonth.getFullYear();
  const hebrewDayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <Paper
      className={`calendar ${className}`}
      sx={{
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fafafa'
      }}
    >
      {/* Header with month/year and navigation */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <IconButton
          onClick={handlePreviousMonth}
          size="small"
          sx={{
            '&:hover': {
              backgroundColor: '#e0e0e0'
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '150px', textAlign: 'center' }}>
          {monthName} {year}
        </Typography>

        <IconButton
          onClick={handleNextMonth}
          size="small"
          sx={{
            '&:hover': {
              backgroundColor: '#e0e0e0'
            }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day names header */}
      <Grid container spacing={1} sx={{ marginBottom: '8px' }}>
        {hebrewDayNames.map((dayName) => (
          <Grid item xs={12 / 7} key={dayName}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#666',
                display: 'block'
              }}
            >
              {dayName}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar grid */}
      <Grid container spacing={1} sx={{ marginBottom: '16px' }}>
        {/* Days from previous month */}
        {calendarDays.prev.map((date) => (
          <Grid item xs={12 / 7} key={date.toISOString()}>
            {renderDayCell(date, false)}
          </Grid>
        ))}

        {/* Days of current month */}
        {calendarDays.current.map((date) => (
          <Grid item xs={12 / 7} key={date.toISOString()}>
            {renderDayCell(date, true)}
          </Grid>
        ))}

        {/* Days from next month */}
        {calendarDays.next.map((date) => (
          <Grid item xs={12 / 7} key={date.toISOString()}>
            {renderDayCell(date, false)}
          </Grid>
        ))}
      </Grid>

      {/* Legend */}
      <Box
        sx={{
          padding: '12px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="caption" sx={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          עיר
        </Typography>
        <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box sx={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50' }} />
            <span>זמין</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box sx={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f44336' }} />
            <span>לא זמין</span>
          </Box>
          {showToday && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Box sx={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#e3f2fd', border: '1px solid #2196f3' }} />
              <span>היום</span>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default Calendar;
