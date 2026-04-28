import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import {
  APPLICATION_STATUS_KEYS,
  APPLICATION_STATUS_META,
} from '../ApplicationStatusChip/ApplicationStatusChip';

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

async function fetchStatusCount(status) {
  const res = await fetch(
    `/api/Applications/my?statuses=${status}&pageNumber=1&pageSize=1`,
    { headers: getAuthHeader() },
  );
  if (!res.ok) return { status, count: 0 };
  const data = await res.json().catch(() => null);
  return { status, count: typeof data?.totalCount === 'number' ? data.totalCount : 0 };
}

async function fetchTotal() {
  const res = await fetch('/api/Applications/my?pageNumber=1&pageSize=1', {
    headers: getAuthHeader(),
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error('יש להתחבר כסטודנטית כדי לצפות במועמדויות שלך.');
  }
  if (!res.ok) throw new Error(`אירעה שגיאה בטעינת המועמדויות (${res.status}).`);
  const data = await res.json().catch(() => null);
  return typeof data?.totalCount === 'number' ? data.totalCount : 0;
}

export default function ApplicationsSummary() {
  const [counts, setCounts] = useState({ Pending: 0, Interviewed: 0, Accepted: 0, Rejected: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [total, ...statusResults] = await Promise.all([
          fetchTotal(),
          ...APPLICATION_STATUS_KEYS.map((key) => fetchStatusCount(key)),
        ]);
        if (!active) return;

        setTotalCount(total);
        const nextCounts = { Pending: 0, Interviewed: 0, Accepted: 0, Rejected: 0 };
        statusResults.forEach(({ status, count }) => {
          nextCounts[status] = count;
        });
        setCounts(nextCounts);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'אירעה שגיאה לא ידועה.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            סקירת המועמדויות שלי
          </Typography>
          {loading ? (
            <CircularProgress size={14} />
          ) : error ? (
            <Tooltip title={error} arrow>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ color: 'warning.main', cursor: 'help' }}
              >
                <ErrorOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  לא ניתן לטעון
                </Typography>
              </Stack>
            </Tooltip>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {totalCount === 0 ? 'עדיין לא הגשת' : `סה"כ ${totalCount}`}
            </Typography>
          )}
        </Stack>

        <Grid container spacing={1}>
          {APPLICATION_STATUS_KEYS.map((key) => {
            const meta = APPLICATION_STATUS_META[key];
            const Icon = meta.icon;
            const count = counts[key] ?? 0;
            return (
              <Grid item xs={6} key={key}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    px: 1,
                    py: 0.75,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: `${meta.color}.main`,
                    bgcolor: (theme) => alpha(theme.palette[meta.color].main, 0.08),
                  }}
                >
                  <Icon fontSize="small" sx={{ color: `${meta.color}.main` }} />
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ lineHeight: 1.1 }}
                      noWrap
                    >
                      {meta.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: `${meta.color}.main`,
                        fontSize: '1rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {count}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            );
          })}
        </Grid>

        <Button
          component={RouterLink}
          to="/jobs"
          variant="text"
          size="small"
          startIcon={<WorkOutlineOutlinedIcon fontSize="small" />}
          sx={{ alignSelf: 'flex-start' }}
        >
          מעבר ללוח המשרות
        </Button>
      </Stack>
    </Card>
  );
}
