/**
 * AvailabilityIndicator Component
 * Lightweight component for displaying availability status
 * 
 * Usage:
 * <AvailabilityIndicator status="available" />
 * <AvailabilityIndicator status="unavailable" showLabel={true} size="large" />
 * <AvailabilityIndicator status={availabilityStatus} variant="minimal" />
 */

import { Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CircleIcon from '@mui/icons-material/Circle';
import './AvailabilityIndicator.css';

/**
 * Availability status indicator component
 * @component
 * @param {Object} props
 * @param {string|number} props.status - Status value: 'available'|'unavailable'|0|1
 * @param {boolean} props.showLabel - Whether to show text label (זמין/לא זמין), default: false
 * @param {string} props.size - 'small' | 'medium' | 'large' - default: 'medium'
 * @param {string} props.variant - 'default' | 'minimal' | 'badge' - default: 'default'
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
function AvailabilityIndicator({
  status,
  showLabel = false,
  size = 'medium',
  variant = 'default',
  className = ''
}) {
  const statusLower = String(status).toLowerCase();
  const isAvailable = statusLower === 'available' || status === 0 || statusLower === '0';

  const sizeMap = {
    small: {
      iconSize: '16px',
      fontSize: '0.75rem'
    },
    medium: {
      iconSize: '20px',
      fontSize: '0.875rem'
    },
    large: {
      iconSize: '28px',
      fontSize: '1rem'
    }
  };

  const sizeConfig = sizeMap[size] || sizeMap.medium;
  const label = isAvailable ? 'זמין' : 'לא זמין';
  const color = isAvailable ? '#4caf50' : '#f44336';
  const backgroundColor = isAvailable ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';

  let icon;
  switch (variant) {
    case 'minimal':
      icon = (
        <CircleIcon
          sx={{
            fontSize: sizeConfig.iconSize,
            color: color
          }}
        />
      );
      break;

    case 'badge':
      icon = isAvailable ? (
        <CheckCircleIcon
          sx={{
            fontSize: sizeConfig.iconSize,
            color: color
          }}
        />
      ) : (
        <HighlightOffIcon
          sx={{
            fontSize: sizeConfig.iconSize,
            color: color
          }}
        />
      );
      break;

    case 'default':
    default:
      icon = isAvailable ? (
        <CheckCircleIcon
          sx={{
            fontSize: sizeConfig.iconSize,
            color: color
          }}
        />
      ) : (
        <HighlightOffIcon
          sx={{
            fontSize: sizeConfig.iconSize,
            color: color
          }}
        />
      );
  }

  if (!showLabel) {
    return (
      <Box
        className={`availability-indicator ${variant} ${className}`}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
    );
  }

  return (
    <Box
      className={`availability-indicator ${variant} ${className}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: variant === 'badge' ? '4px 8px' : '0',
        borderRadius: variant === 'badge' ? '12px' : '0',
        backgroundColor: variant === 'badge' ? backgroundColor : 'transparent',
        fontSize: sizeConfig.fontSize,
        color: color,
        fontWeight: variant === 'badge' ? '500' : '400'
      }}
    >
      {icon}
      <span>{label}</span>
    </Box>
  );
}

export default AvailabilityIndicator;
