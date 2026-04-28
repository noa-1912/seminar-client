import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Grid,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PageShell from '../../components/PageShell/PageShell';

const defaultStatsPayload = {
  totalGraduates: 12,
  totalAccepted: 3,
  placementRate: 78,
  monthlyPlacementTrend: [
    { month: 'ינו', value: 61 },
    { month: 'פבר', value: 66 },
    { month: 'מרץ', value: 70 },
    { month: 'אפר', value: 74 },
    { month: 'מאי', value: 76 },
    { month: 'יונ', value: 78 },
  ],
  monthlyAcceptedTrend: [
    { month: 'ינו', value: 1 },
    { month: 'פבר', value: 1 },
    { month: 'מרץ', value: 2 },
    { month: 'אפר', value: 2 },
    { month: 'מאי', value: 3 },
    { month: 'יונ', value: 3 },
  ],
};

function normalizeStatsPayload(apiPayload) {
  if (!apiPayload || typeof apiPayload !== 'object') {
    return defaultStatsPayload;
  }

  const normalizedMonthlyAcceptedTrend =
    Array.isArray(apiPayload.monthlyAcceptedTrend) && apiPayload.monthlyAcceptedTrend.length > 0
      ? apiPayload.monthlyAcceptedTrend
      : defaultStatsPayload.monthlyAcceptedTrend;

  const acceptedValues = normalizedMonthlyAcceptedTrend
    .map((item) => Number(item?.value ?? 0))
    .filter((value) => Number.isFinite(value));
  const acceptedTotalFallback = acceptedValues.length > 0 ? Math.max(...acceptedValues) : 0;

  return {
    totalGraduates: Number(
      apiPayload.totalGraduates ??
        apiPayload.totalStudentCount ??
        defaultStatsPayload.totalGraduates,
    ),
    totalAccepted: Number(
      apiPayload.totalAccepted ??
        apiPayload.totalHiredCount ??
        acceptedTotalFallback ??
        defaultStatsPayload.totalAccepted,
    ),
    placementRate: Number(apiPayload.placementRate ?? defaultStatsPayload.placementRate),
    monthlyPlacementTrend:
      Array.isArray(apiPayload.monthlyPlacementTrend) && apiPayload.monthlyPlacementTrend.length > 0
        ? apiPayload.monthlyPlacementTrend
        : defaultStatsPayload.monthlyPlacementTrend,
    monthlyAcceptedTrend: normalizedMonthlyAcceptedTrend,
  };
}

async function fetchHomeStats() {
  const response = await fetch('/gateway/home-dashboard/stats');
  if (!response.ok) {
    throw new Error('שירות הנתונים לא זמין כרגע');
  }

  const json = await response.json();
  return normalizeStatsPayload(json);
}

async function fetchHomeStatsDebug() {
  const response = await fetch('/gateway/home-dashboard/stats/debug');
  if (!response.ok) {
    throw new Error('שירות מצב הנתונים לא זמין כרגע');
  }

  return response.json();
}

export default function Home() {
  const theme = useTheme();
  const [stats, setStats] = useState(defaultStatsPayload);

  useEffect(() => {
    Promise.all([fetchHomeStats(), fetchHomeStatsDebug()])
      .then(([payload, debug]) => {
        setStats(payload);
        const hasRealData =
          (debug?.placementLogsCount ?? 0) > 0 || (debug?.graduatesLogsCount ?? 0) > 0;
        const isRabbitConnected = Boolean(debug?.rabbitMq?.isReachable);

        if (!isRabbitConnected || !hasRealData) {
          setStats(defaultStatsPayload);
        }
      })
      .catch(() => {
        setStats(defaultStatsPayload);
      });
  }, []);

  const acceptedMonths = useMemo(
    () => stats.monthlyAcceptedTrend.map((item) => item.month),
    [stats.monthlyAcceptedTrend],
  );
  const acceptedValues = useMemo(
    () => stats.monthlyAcceptedTrend.map((item) => item.value),
    [stats.monthlyAcceptedTrend],
  );
  return (
    <PageShell>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12}>
          <Stack spacing={3}>
            <Typography variant="h1">תכנית השמה לנשים בטכנולוגיה</Typography>

            <Typography variant="body1" color="text.secondary">
              קידום הקריירה שלך עם לימודים ממוקדי תעשייה וליווי להשמה.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <Button variant="contained">להרשמה</Button>
              <Button variant="outlined">לפרטים נוספים</Button>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <WorkspacePremiumOutlinedIcon fontSize="small" />
                <Typography variant="body2">ליווי קריירה</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <SchoolOutlinedIcon fontSize="small" />
                <Typography variant="body2">קורסים מעשיים</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <WorkOutlineOutlinedIcon fontSize="small" />
                <Typography variant="body2">מוכנות לעבודה</Typography>
              </Stack>
            </Stack>

            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
              סטטיסטיקות בזמן אמת
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: 'background.default',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    מספר הבוגרות הקיים
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                    {stats.totalGraduates}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: 'secondary.main',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    כמה התקבלו
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1, fontWeight: 700 }}>
                    {stats.totalAccepted}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'stretch',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            width: '100%',
          }}
        >
          <Card sx={{ p: 3, minHeight: 360, flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 700 }}>
                  אחוזי השמה
                </Typography>

                <Box
                  sx={{
                    position: 'relative',
                    width: 220,
                    height: 220,
                    mx: 'auto',
                    my: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="svg"
                    viewBox="0 0 220 220"
                    sx={{ width: 220, height: 220, transform: 'rotate(-90deg)' }}
                  >
                    <circle
                      cx="110"
                      cy="110"
                      r="82"
                      fill="none"
                      stroke={theme.palette.divider}
                      strokeWidth="18"
                    />
                    <circle
                      cx="110"
                      cy="110"
                      r="82"
                      fill="none"
                      stroke={theme.palette.primary.light}
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeDasharray={`${(2 * Math.PI * 82 * Math.max(0, Math.min(100, stats.placementRate))) / 100} ${
                        2 * Math.PI * 82
                      }`}
                    />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      position: 'absolute',
                      color: 'primary.light',
                      fontWeight: 700,
                    }}
                  >
                    {`${stats.placementRate}%`}
                  </Typography>
                </Box>
          </Card>

          <Card sx={{ p: 2.5, minHeight: 360, flex: 1.15, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              בוגרות שהתקבלו לפי חודשים
            </Typography>
            <BarChart
              height={280}
              xAxis={[{ scaleType: 'band', data: acceptedMonths }]}
              series={[
                {
                  data: acceptedValues,
                  label: 'התקבלו לפי חודש',
                  color: theme.palette.secondary.dark,
                },
              ]}
              margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
            />
          </Card>

          <Card sx={{ p: 3, width: { xs: '100%', md: 340 }, flexShrink: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              לוח מועמדות
            </Typography>

            <List sx={{ mt: 1 }}>
              <ListItem disableGutters>
                <Avatar sx={{ width: 36, height: 36 }}>א</Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>אודליה כהן</Typography>
                  <Typography variant="body2" color="text.secondary">
                    בתהליך ריאיון
                  </Typography>
                </Box>
              </ListItem>
              <ListItem disableGutters>
                <Avatar sx={{ width: 36, height: 36 }}>מ</Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>מיכל לוי</Typography>
                  <Typography variant="body2" color="text.secondary">
                    מוכנה להגשה
                  </Typography>
                </Box>
              </ListItem>
              <ListItem disableGutters>
                <Avatar sx={{ width: 36, height: 36 }}>ר</Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography sx={{ fontWeight: 600 }}>רחל פרידמן</Typography>
                  <Typography variant="body2" color="text.secondary">
                    משוב התקבל
                  </Typography>
                </Box>
              </ListItem>
            </List>
          </Card>
        </Box>
      </Box>

    </PageShell>
  );
}

