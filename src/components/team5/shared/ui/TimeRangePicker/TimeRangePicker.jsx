/**
 * TimeRangePicker Component
 * Component for selecting start and end times with visual duration display
 * 
 * Usage:
 * <TimeRangePicker
 *   startTime={new Date()}
 *   endTime={new Date()}
 *   onChange={(startTime, endTime) => console.log(startTime, endTime)}
 *   step={30}
 * />
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Button,
  Alert
} from '@mui/material';
import {
  formatTime,
  getDurationFormatted,
  parseTime
} from '../../utils/dateTimeFormatting';
import './TimeRangePicker.css';

/**
 * Time range picker component with start/end time selection
 * @component
 * @param {Object} props
 * @param {Date} props.startTime - Initial start time
 * @param {Date} props.endTime - Initial end time
 * @param {Function} props.onChange - Callback (startTime, endTime) => void
 * @param {number} props.step - Time step in minutes (15, 30, 60), default: 30
 * @param {string} props.minTime - Minimum selectable time as "HH:mm", e.g., "08:00"
 * @param {string} props.maxTime - Maximum selectable time as "HH:mm", e.g., "18:00"
 * @param {boolean} props.showDuration - Show duration display, default: true
 * @param {boolean} props.disabled - Disable time inputs, default: false
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
function TimeRangePicker({
  startTime = new Date(),
  endTime = new Date(),
  onChange = null,
  step = 30,
  minTime = null,
  maxTime = null,
  showDuration = true,
  disabled = false,
  className = ''
}) {
  const [internalStart, setInternalStart] = useState(startTime);
  const [internalEnd, setInternalEnd] = useState(endTime);
  const [error, setError] = useState('');

  useEffect(() => {
    setInternalStart(startTime);
    setInternalEnd(endTime);
    setError('');
  }, [startTime, endTime]);

  /**
   * Validate that start time is before end time
   */
  const validateTimes = (start, end) => {
    if (start >= end) {
      setError('שעת התחלה חייבת להיות לפני שעת סיום');
      return false;
    }
    if (minTime) {
      const minDate = parseTime(minTime, start);
      if (start < minDate) {
        setError(`שעת התחלה לא יכולה להיות לפני ${minTime}`);
        return false;
      }
    }
    if (maxTime) {
      const maxDate = parseTime(maxTime, end);
      if (end > maxDate) {
        setError(`שעת סיום לא יכולה להיות אחרי ${maxTime}`);
        return false;
      }
    }
    setError('');
    return true;
  };

  /**
   * Handle start time change
   */
  const handleStartTimeChange = (value) => {
    const newStart = parseTime(value, internalStart);
    if (validateTimes(newStart, internalEnd)) {
      setInternalStart(newStart);
      if (onChange) {
        onChange(newStart, internalEnd);
      }
    }
  };

  /**
   * Handle end time change
   */
  const handleEndTimeChange = (value) => {
    const newEnd = parseTime(value, internalEnd);
    if (validateTimes(internalStart, newEnd)) {
      setInternalEnd(newEnd);
      if (onChange) {
        onChange(internalStart, newEnd);
      }
    }
  };

  const duration = showDuration ? getDurationFormatted(internalStart, internalEnd) : '';

  return (
    <Paper
      className={`time-range-picker ${className}`}
      sx={{
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fafafa'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        בחר טווח שעות
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: '16px' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ marginBottom: '16px' }}>
        {/* Start Time Input */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ marginBottom: '8px', fontWeight: '500' }}>
            שעת התחלה
          </Typography>
          <TextField
            type="time"
            value={formatTime(internalStart)}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            disabled={disabled}
            fullWidth
            inputProps={{
              step: step * 60 // Convert minutes to seconds
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white'
              }
            }}
          />
        </Grid>

        {/* End Time Input */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ marginBottom: '8px', fontWeight: '500' }}>
            שעת סיום
          </Typography>
          <TextField
            type="time"
            value={formatTime(internalEnd)}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            disabled={disabled}
            fullWidth
            inputProps={{
              step: step * 60 // Convert minutes to seconds
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white'
              }
            }}
          />
        </Grid>
      </Grid>

      {/* Duration Display */}
      {showDuration && duration && (
        <Box
          sx={{
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ color: '#666' }}>
            משך הזמן: <strong>{duration}</strong>
          </Typography>
        </Box>
      )}

      {/* Visual Timeline */}
      <Box className="time-range-visual" sx={{ marginTop: '16px' }}>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: '8px', color: '#999' }}>
          ציר הזמן
        </Typography>
        <Box
          sx={{
            height: '40px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            border: '1px solid #90caf9',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {/* Time range bar */}
          <Box
            sx={{
              position: 'absolute',
              height: '30px',
              backgroundColor: '#2196f3',
              borderRadius: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              left: '0',
              right: '0',
              margin: '0 8px'
            }}
          />
          {/* Start label */}
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              left: '8px',
              color: 'white',
              fontWeight: 'bold',
              zIndex: 1
            }}
          >
            {formatTime(internalStart)}
          </Typography>
          {/* End label */}
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              right: '8px',
              color: 'white',
              fontWeight: 'bold',
              zIndex: 1
            }}
          >
            {formatTime(internalEnd)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default TimeRangePicker;
