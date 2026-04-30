import { Container, Box, Typography } from '@mui/material';
import MyScheduledInterviews from '../../components/Scheduling/MyScheduledInterviews';
import './ScheduledInterviews.css';

function ScheduledInterviews() {
  return (
    <Box className="scheduled-interviews-page">
      {/* Gradient Header */}
      <Box className="page-header">
        <Typography variant="h4" component="h1" gutterBottom>
          הריאיונות שלי
        </Typography>
        <Typography variant="body1">
          צפו בריאיונות המתוכננים שלכם וקבלו מידע מלא על כל ריאיון
        </Typography>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ paddingBottom: '40px' }}>
        <MyScheduledInterviews />
      </Container>
    </Box>
  );
}

export default ScheduledInterviews;
