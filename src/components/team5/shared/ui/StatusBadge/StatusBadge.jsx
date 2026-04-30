/**
 * StatusBadge Component
 * Reusable, generic status display component for various status types
 * 
 * Usage:
 * <StatusBadge status="scheduled" type="interview" />
 * <StatusBadge status="available" type="availability" size="small" />
 * <StatusBadge status="assigned" type="slot" showIcon={false} />
 */

import { Chip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HelpIcon from '@mui/icons-material/Help';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import './StatusBadge.css';

/**
 * Generic status badge component with support for multiple status types
 * @component
 * @param {Object} props
 * @param {string} props.status - The status value to display
 * @param {string} props.type - Type of status: 'interview' | 'availability' | 'slot' | 'custom'
 * @param {string} props.size - 'small' | 'medium' - default: 'medium'
 * @param {boolean} props.showIcon - Whether to show icon, default: true
 * @param {Object} props.customConfig - Custom configuration for 'custom' type
 *   @param {string} props.customConfig.label - Display label
 *   @param {string} props.customConfig.color - Material-UI color
 *   @param {React.Component} props.customConfig.icon - Icon component
 *   @param {string} props.customConfig.variant - 'outlined' | 'filled'
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
function StatusBadge({
  status,
  type = 'interview',
  size = 'medium',
  showIcon = true,
  customConfig = null,
  className = ''
}) {
  /**
   * Get configuration for interview statuses
   * Includes: Scheduled, Completed, Cancelled
   */
  const getInterviewConfig = (status) => {
    const statusLower = status?.toLowerCase();

    switch (statusLower) {
      case 'scheduled':
        return {
          label: 'מתוכנן',
          color: 'primary',
          icon: <ScheduleIcon />,
          variant: 'outlined'
        };
      case 'completed':
        return {
          label: 'הושלם',
          color: 'success',
          icon: <CheckCircleIcon />,
          variant: 'filled'
        };
      case 'cancelled':
        return {
          label: 'בוטל',
          color: 'error',
          icon: <CancelIcon />,
          variant: 'filled'
        };
      default:
        return {
          label: status || 'לא ידוע',
          color: 'default',
          icon: <HelpIcon />,
          variant: 'outlined'
        };
    }
  };

  /**
   * Get configuration for availability statuses
   * Includes: Available, Unavailable
   */
  const getAvailabilityConfig = (status) => {
    const statusLower = status?.toLowerCase();

    switch (statusLower) {
      case 'available':
      case '0': // Enum value for Available
        return {
          label: 'זמין',
          color: 'success',
          icon: <CheckBoxIcon />,
          variant: 'filled'
        };
      case 'unavailable':
      case '1': // Enum value for Unavailable
        return {
          label: 'לא זמין',
          color: 'error',
          icon: <IndeterminateCheckBoxIcon />,
          variant: 'filled'
        };
      default:
        return {
          label: status || 'לא ידוע',
          color: 'default',
          icon: <HelpIcon />,
          variant: 'outlined'
        };
    }
  };

  /**
   * Get configuration for slot statuses
   * Includes: Assigned, Unassigned
   */
  const getSlotConfig = (status) => {
    const statusLower = status?.toLowerCase();

    switch (statusLower) {
      case 'assigned':
      case '1': // Enum value for Assigned
        return {
          label: 'תפוס',
          color: 'warning',
          icon: <CheckBoxIcon />,
          variant: 'filled'
        };
      case 'unassigned':
      case '0': // Enum value for Unassigned
        return {
          label: 'פנוי',
          color: 'info',
          icon: <SignalCellularAltIcon />,
          variant: 'outlined'
        };
      default:
        return {
          label: status || 'לא ידוע',
          color: 'default',
          icon: <HelpIcon />,
          variant: 'outlined'
        };
    }
  };

  /**
   * Get configuration based on status type
   */
  let config;

  switch (type) {
    case 'interview':
      config = getInterviewConfig(status);
      break;
    case 'availability':
      config = getAvailabilityConfig(status);
      break;
    case 'slot':
      config = getSlotConfig(status);
      break;
    case 'custom':
      config = customConfig || {
        label: status || 'לא ידוע',
        color: 'default',
        icon: <HelpIcon />,
        variant: 'outlined'
      };
      break;
    default:
      config = getInterviewConfig(status);
  }

  const sizeMap = {
    small: {
      chipHeight: '32px',
      iconFontSize: '18px',
      fontSize: '0.8rem'
    },
    medium: {
      chipHeight: '40px',
      iconFontSize: '24px',
      fontSize: '0.9rem'
    }
  };

  const sizeConfig = sizeMap[size] || sizeMap.medium;

  return (
    <Box display="flex" alignItems="center" justifyContent="center" className={`status-badge ${className}`}>
      <Chip
        icon={showIcon ? config.icon : undefined}
        label={config.label}
        color={config.color}
        variant={config.variant}
        size={size}
        sx={{
          fontWeight: 'medium',
          height: sizeConfig.chipHeight,
          fontSize: sizeConfig.fontSize,
          '& .MuiChip-icon': {
            fontSize: sizeConfig.iconFontSize,
            margin: '0 !important',
            marginRight: '6px !important',
            display: 'flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important'
          },
          '& .MuiChip-label': {
            padding: '0 !important',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
      />
    </Box>
  );
}

export default StatusBadge;
