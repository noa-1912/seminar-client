import { Chip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HelpIcon from '@mui/icons-material/Help';

function InterviewStatusDisplay({ status, size = 'medium', showIcon = true }) {
  const getStatusConfig = (status) => {
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

  const config = getStatusConfig(status);

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Chip
        icon={showIcon ? config.icon : undefined}
        label={config.label}
        color={config.color}
        variant={config.variant}
        size={size}
        sx={{
          fontWeight: 'medium',
          height: size === 'small' ? '32px' : '40px',
          fontSize: size === 'small' ? '0.8rem' : '0.9rem',
          '& .MuiChip-icon': {
            fontSize: size === 'small' ? '18px' : '24px',
            margin: '0 !important',
            marginRight: '6px !important',
            display: 'flex !important',
            alignItems: 'center !important',
            justifyContent: 'center !important',
            color: 'inherit'
          },
          '& .MuiChip-label': {
            padding: '0 8px !important',
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

export default InterviewStatusDisplay;