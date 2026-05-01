import { Box, Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import PageShell from '../../PageShell/PageShell';
import ApplicationsSummary from '../ApplicationsSummary/ApplicationsSummary';
import UnreadInvitationsChip from '../UnreadInvitationsChip/UnreadInvitationsChip';
import AdminDashboard from '../../admin/AdminDashboard';
import { useAuth } from '../../../auth/AuthContext';
import { isManagerRole } from '../../../auth/resolveUserRole';

function SectionCard({ to, title, description, icon: Icon, badge }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        component={RouterLink}
        to={to}
        sx={{ height: '100%', p: 3, borderRadius: 'inherit' }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'secondary.main',
                color: 'text.primary',
                flexShrink: 0,
              }}
            >
              <Icon />
            </Box>
            <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Stack>
            {badge && (
              <Box sx={{ alignSelf: 'flex-start', mt: 0.5, flexShrink: 0 }}>
                {badge}
              </Box>
            )}
            <ArrowBackIosNewOutlinedIcon
              fontSize="small"
              sx={{ color: 'text.secondary', mt: 1 }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function StudentPersonalArea() {
  return (
    <PageShell>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            איזור אישי
          </Typography>
          <Typography variant="body1" color="text.secondary">
            המרכז האישי שלך: כאן תוכלי לגשת לכל מה שקשור אלייך בלבד בתוך המערכת.
          </Typography>
        </Stack>

        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <SectionCard
                to="/my-applications"
                title="המועמדויות שלי"
                description="מעקב אחר סטטוס המועמדויות שהגשת, סינון לפי שלב בתהליך וצפייה בפרטי המשרה."
                icon={AssignmentTurnedInOutlinedIcon}
              />
              <ApplicationsSummary />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <SectionCard
              to="/private-invitations"
              title="משרות שהוצעו לי"
              description="משרות שהמנהלת הזמינה אותך אישית להגיש אליהן מועמדות, כולל התראה על הזמנות חדשות."
              icon={MarkEmailUnreadOutlinedIcon}
              badge={
                <UnreadInvitationsChip
                  sx={{
                    '& .MuiChip-icon': {
                      marginInlineStart: '2px',
                      marginInlineEnd: '-6px',
                    },
                  }}
                />
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SectionCard
              to="/my-interviews"
              title="הריאיונות שלי"
              description="כל הריאיונות המתוכננים שלך במקום אחד — סינון לפי סטטוס ופרטים מלאים על כל מועד."
              icon={EventNoteOutlinedIcon}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SectionCard
              to="/student-availability"
              title="זמינות לריאיונות"
              description="עדכני מתי את זמינה לריאיונות כדי שהמערכת והמנהלות יוכלו לתאם איתך בקלות."
              icon={EventAvailableOutlinedIcon}
            />
          </Grid>
        </Grid>
      </Stack>
    </PageShell>
  );
}

export default function PersonalArea() {
  const { user } = useAuth();

  if (isManagerRole(user)) {
    return <AdminDashboard />;
  }

  return <StudentPersonalArea />;
}
