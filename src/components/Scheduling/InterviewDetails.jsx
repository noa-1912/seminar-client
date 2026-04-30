import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Grid,
  IconButton,
  Chip,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InterviewStatusDisplay from './InterviewStatusDisplay.jsx';
import './InterviewDetails.css';

function InterviewDetails({ interview, open, onClose }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  if (!interview) return null;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const startDateTime = formatDateTime(interview.slotStart);
  const endDateTime = formatDateTime(interview.slotEnd);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="interview-details-dialog"
    >
      <DialogTitle className="interview-details-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            פרטי הריאיון
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className="interview-details-content">
        {/* Header Section - Only Type Tag */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Chip
                label={interview.interviewType || 'לא צוין'}
                variant="outlined"
                size="small"
                sx={{ 
                  height: '28px', 
                  fontSize: '0.8rem', 
                  padding: '0 12px',
                  borderColor: isDarkMode ? theme.palette.divider : '#a89f9a',
                  color: isDarkMode ? theme.palette.text.secondary : '#6b6660'
                }}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <InterviewStatusDisplay
                status={interview.interviewStatus}
                size="medium"
              />
            </Box>
          </Box>
          <Divider sx={{ opacity: 0.4 }} />
        </Box>

        {/* Main Details Grid */}
        <Grid container spacing={3}>
          {/* Date and Time Section */}
          <Grid item xs={12} md={6}>
            <Box className="detail-section">
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: '600', color: isDarkMode ? theme.palette.text.primary : '#4a4540', marginBottom: '16px' }}
              >
                זמן ותאריך
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <EventIcon sx={{ fontSize: '18px', color: isDarkMode ? theme.palette.text.secondary : '#4a4540' }} />
                  <Typography variant="body1">
                    <strong>תאריך:</strong> {startDateTime.date}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon sx={{ fontSize: '18px', color: isDarkMode ? theme.palette.text.secondary : '#4a4540' }} />
                  <Typography variant="body1">
                    <strong>שעה:</strong> {startDateTime.time} - {endDateTime.time}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Location Section */}
          {interview.place && (
            <Grid item xs={12} md={6}>
              <Box className="detail-section">
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: '600', color: isDarkMode ? theme.palette.text.primary : '#4a4540', marginBottom: '16px' }}
                >
                  מיקום
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>
                  {interview.place}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Interviewer and Subject Section */}
          <Grid item xs={12} md={6}>
            <Box className="detail-section">
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: '600', color: isDarkMode ? theme.palette.text.primary : '#6b6660', marginBottom: '16px' }}
              >
                פרטים אישיים
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Typography variant="body1">
                  <strong>המראיין:</strong> {interview.interviewerName || 'לא צוין'}
                </Typography>
                <Typography variant="body1">
                  <strong>נושא:</strong> {interview.subject || 'לא צוין'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Additional Details Section */}
          <Grid item xs={12} md={6}>
            <Box className="detail-section">
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: '600', color: isDarkMode ? theme.palette.text.primary : '#6b6660', marginBottom: '16px' }}
              >
                פרטים נוספים
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Typography variant="body1">
                  <strong>סוג ריאיון:</strong> {interview.interviewType || 'לא צוין'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Comments Section */}
          {interview.comments && (
            <Grid item xs={12}>
              <Box className="detail-section">
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: '600', color: isDarkMode ? theme.palette.text.primary : '#6b6660', marginBottom: '16px' }}
                >
                  הערות
                </Typography>
                <Box className="comments-box">
                  <Typography variant="body1" sx={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {interview.comments}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions className="interview-details-actions">
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #5b534c, #4a4540)'
              : 'linear-gradient(135deg, #4a4540, #3d3935)',
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: '600',
            minWidth: '150px'
          }}
        >
          חזרה לרשימה
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InterviewDetails;