import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import PageShell from '../../components/PageShell/PageShell';
import { getJobById } from '../../features/jobs/api/jobs.api';
import ApplyToJobModal from '../../features/jobs/components/ApplyToJobModal';

const AUTH_TOKEN_KEY = 'authToken';
const COUNTDOWN_UPDATE_INTERVAL_MS = 60 * 1000;

function getField(job, camel, pascal) {
  return job?.[camel] ?? job?.[pascal];
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getDeadlineMessage(deadline) {
  if (!deadline) {
    return '';
  }

  const deadlineDate = new Date(deadline);
  const now = Date.now();
  const diffMs = deadlineDate.getTime() - now;

  if (Number.isNaN(deadlineDate.getTime())) {
    return '';
  }

  if (diffMs <= 0) {
    return 'ההגשה למשרה זו נסגרה';
  }

  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `נותרו ${hours} שעות`;
  }

  const days = Math.ceil(hours / 24);
  return `נותרו ${days} ימים`;
}

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  const isAuthenticated = useMemo(() => {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadJob() {
      if (!jobId) {
        setErrorMessage('לא זוהה מזהה משרה תקין.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');
      setIsNotFound(false);
      setJob(null);

      try {
        const data = await getJobById(jobId);
        if (!isMounted) return;
        setJob(data);
      } catch (error) {
        if (!isMounted) return;
        if (error?.status === 404) {
          setIsNotFound(true);
          return;
        }
        setErrorMessage(error?.message || 'אירעה שגיאה בטעינת פרטי המשרה.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  useEffect(() => {
    if (!job) return undefined;

    const deadline = getField(job, 'deadline', 'Deadline');
    const refreshCountdown = () => {
      setCountdownText(getDeadlineMessage(deadline));
    };

    refreshCountdown();
    const intervalId = window.setInterval(refreshCountdown, COUNTDOWN_UPDATE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [job]);

  const title = getField(job, 'title', 'Title');
  const companyName = getField(job, 'companyName', 'CompanyName');
  const location = getField(job, 'location', 'Location');
  const description = getField(job, 'description', 'Description');
  const requirements = normalizeArray(getField(job, 'requirements', 'Requirements'));
  const tags = normalizeArray(getField(job, 'tags', 'Tags'));
  const salaryMin = getField(job, 'salaryMin', 'SalaryMin');
  const salaryMax = getField(job, 'salaryMax', 'SalaryMax');
  const jobWebsiteUrl = getField(job, 'jobWebsiteUrl', 'JobWebsiteUrl');
  const jobImageUrl = getField(job, 'jobImageUrl', 'JobImageUrl');

  function renderLoadingState() {
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={22} />
          <Typography variant="body2" color="text.secondary">
            טוען פרטי משרה...
          </Typography>
        </Stack>
        <Skeleton variant="text" width="40%" height={48} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  return (
    <PageShell>
      <Stack spacing={3} dir="rtl">
        {isLoading && renderLoadingState()}

        {!isLoading && isNotFound && <Alert severity="warning">המשרה לא נמצאה.</Alert>}

        {!isLoading && !isNotFound && errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {!isLoading && !isNotFound && !errorMessage && job && (
          <>
            <Stack spacing={1}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                {title || 'פרטי משרה'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {companyName || 'חברה לא צוינה'} | {location || 'מיקום לא צוין'}
              </Typography>
            </Stack>

            {jobImageUrl && (
              <Box
                component="img"
                src={jobImageUrl}
                alt="תמונת משרה"
                sx={{
                  width: '100%',
                  maxHeight: 320,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                }}
              />
            )}

            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                תיאור המשרה
              </Typography>
              <Typography variant="body1" color="text.primary">
                {description || 'לא הוזן תיאור למשרה זו.'}
              </Typography>
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                דרישות
              </Typography>
              {requirements.length > 0 ? (
                <Stack component="ul" spacing={0.5} sx={{ m: 0, ps: 3 }}>
                  {requirements.map((item) => (
                    <Typography component="li" key={item} variant="body2" color="text.secondary">
                      {item}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  לא צוינו דרישות למשרה זו.
                </Typography>
              )}
            </Stack>

            {(salaryMin != null || salaryMax != null) && (
              <Alert severity="info">
                טווח שכר: {salaryMin != null ? salaryMin : '—'} עד {salaryMax != null ? salaryMax : '—'}
              </Alert>
            )}

            {jobWebsiteUrl && (
              <Typography variant="body2">
                אתר המשרה:{' '}
                <Link href={jobWebsiteUrl} target="_blank" rel="noopener noreferrer">
                  מעבר לאתר
                </Link>
              </Typography>
            )}

            {tags.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} color="secondary" variant="outlined" />
                ))}
              </Stack>
            )}

            {countdownText && (
              <Alert severity={countdownText.includes('נסגרה') ? 'warning' : 'success'}>
                {countdownText}
              </Alert>
            )}

            {!isAuthenticated && (
              <Alert severity="info">
                כדי להגיש מועמדות יש להתחבר למערכת.{' '}
                <Link component={RouterLink} to="/login">
                  מעבר להתחברות
                </Link>
              </Alert>
            )}

            <Box>
              <Button
                variant="contained"
                onClick={() => setIsApplyModalOpen(true)}
                disabled={!isAuthenticated}
                aria-label="הגש מועמדות למשרה"
              >
                הגש מועמדות
              </Button>
            </Box>

            <ApplyToJobModal
              open={isApplyModalOpen}
              onClose={() => setIsApplyModalOpen(false)}
              jobId={jobId}
              onSubmitted={() => setIsApplyModalOpen(false)}
            />
          </>
        )}

        {!isLoading && !isNotFound && !errorMessage && !job && (
          <Alert severity="warning">לא נמצאו פרטי משרה להצגה.</Alert>
        )}
      </Stack>
    </PageShell>
  );
}
