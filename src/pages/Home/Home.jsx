import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  Stack,
  Typography,
} from '@mui/material';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PageShell from '../../components/PageShell/PageShell';

export default function Home() {
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [gatewayError, setGatewayError] = useState(null);

  useEffect(() => {
    fetch('/gateway', { method: 'GET' })
      .then((res) => res.text())
      .then(() => setGatewayStatus('connected'))
      .catch((err) => setGatewayError(err.message));
  }, []);

  return (
    <PageShell>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
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
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: 'secondary.main', borderRadius: '24px', position: 'relative', p: 2 }}>
            <Box
              component="img"
              src="/hero-image.svg"
              alt="תמונה"
              sx={{ width: '100%', borderRadius: '16px', display: 'block' }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                backgroundColor: 'background.paper',
                px: 2,
                py: 1,
                borderRadius: '12px',
                boxShadow: 1,
              }}
            >
              <Typography variant="body2">95% הצלחה בהשמה</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} mt={4}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              סטטיסטיקה ותהליך
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <Chip label="ליווי אישי" />
              <Chip label="תיק עבודות" />
              <Chip label="ראיונות" />
              <Chip label="השמה" />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3 }}>
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
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 4 }}>
        {gatewayStatus && <Chip label="מחובר ל-Gateway" color="success" size="small" />}
        {gatewayError && (
          <Alert severity="warning" sx={{ maxWidth: 520 }}>
            Gateway לא זמין (ודא שהוא רץ על פורט 7000). שגיאה: {gatewayError}
          </Alert>
        )}
      </Box>
    </PageShell>
  );
}

