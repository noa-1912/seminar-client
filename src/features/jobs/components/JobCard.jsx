import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import WifiIcon from '@mui/icons-material/Wifi';
import { useNavigate } from 'react-router-dom';

const jobTypeLabels = {
  FullTime: 'משרה מלאה',
  PartTime: 'משרה חלקית',
  Contract: 'חוזה',
  Internship: 'סטאז׳',
  Temporary: 'זמני',
  Freelance: 'פרילנס',
  Hybrid: 'היברידי',
  OnSite: 'באתר החברה',
  Remote: 'מרחוק',
};

const fieldLabels = {
  SoftwareDevelopment: 'פיתוח תוכנה',
  ProductManagement: 'ניהול מוצר',
  DataScience: 'מדעי הנתונים',
  DevOps: 'דבאופס',
  CyberSecurity: 'אבטחת מידע',
  QA: 'בדיקות תוכנה',
  Design: 'עיצוב',
  Marketing: 'שיווק',
  Sales: 'מכירות',
  Finance: 'כספים',
  HumanResources: 'משאבי אנוש',
  Operations: 'תפעול',
  CustomerSuccess: 'הצלחת לקוחות',
};

function toHebrewLabel(value, mapping, fallbackPrefix) {
  if (!value) return '';
  return mapping[value] || `${fallbackPrefix}: ${value}`;
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

export default function JobCard({ job }) {
  const navigate = useNavigate();

  if (!job) return null;
  const jobId = job.jobId;

  const tags = normalizeTags(job.tags);
  const jobTypeLabel = toHebrewLabel(job.jobType, jobTypeLabels, 'סוג משרה');
  const fieldLabel = toHebrewLabel(job.field, fieldLabels, 'תחום');
  const canNavigateToDetails = jobId !== undefined && jobId !== null && jobId !== '';

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <CardActionArea
        onClick={() => {
          if (canNavigateToDetails) {
            navigate(`/jobs/${jobId}`);
          }
        }}
        aria-label={`מעבר לפרטי המשרה ${job.title || ''}`}
        disabled={!canNavigateToDetails}
        sx={{ borderRadius: 3 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
          {job.jobImageUrl && (
            <Box
              component="img"
              src={job.jobImageUrl}
              alt={job.title || 'תמונת משרה'}
              sx={{
                width: { xs: '100%', sm: 180 },
                height: { xs: 160, sm: 120 },
                objectFit: 'cover',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                flexShrink: 0,
              }}
            />
          )}

          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, width: '100%' }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                {job.title || 'משרה ללא כותרת'}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <WorkOutlineOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {job.companyName || 'חברה לא צוינה'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PlaceOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {job.location || 'מיקום לא צוין'}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {jobTypeLabel && (
                  <Chip
                    icon={<HomeWorkOutlinedIcon />}
                    label={jobTypeLabel}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
                {fieldLabel && (
                  <Chip
                    icon={<PublicOutlinedIcon />}
                    label={fieldLabel}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                )}
                {job.isRemote === true && (
                  <Chip
                    icon={<WifiIcon />}
                    label="מתאים לעבודה מרחוק"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Stack>

              {tags.length > 0 && (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {tags.map((tag) => (
                    <Chip key={`${jobId ?? 'job'}-${tag}`} label={tag} size="small" variant="filled" />
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
