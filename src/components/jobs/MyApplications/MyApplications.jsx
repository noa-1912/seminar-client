import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Link as MuiLink,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Pagination,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import PageShell from '../../PageShell/PageShell';
import ApplicationStatusChip, {
  APPLICATION_STATUS_KEYS,
  APPLICATION_STATUS_META,
} from '../ApplicationStatusChip/ApplicationStatusChip';

const PAGE_SIZE = 10;

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildQuery({ statuses, newestFirst, pageNumber, pageSize }) {
  const params = new URLSearchParams();
  statuses.forEach((status) => params.append('statuses', status));
  params.set('newestFirst', String(newestFirst));
  params.set('pageNumber', String(pageNumber));
  params.set('pageSize', String(pageSize));
  return params.toString();
}

export default function MyApplications() {
  const [statuses, setStatuses] = useState([]);
  const [newestFirst, setNewestFirst] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery({ statuses, newestFirst, pageNumber, pageSize: PAGE_SIZE });
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const res = await fetch(`/api/Applications/my?${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('יש להתחבר כסטודנט כדי לצפות במועמדויות שלך.');
      }
      if (!res.ok) {
        throw new Error(`אירעה שגיאה בטעינת המועמדויות (${res.status}).`);
      }

      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 0);
      setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : 0);
    } catch (err) {
      setError(err.message || 'אירעה שגיאה לא ידועה.');
      setItems([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [statuses, newestFirst, pageNumber]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setPageNumber(1);
    setStatuses(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSortChange = (_event, value) => {
    if (value === null) return;
    setPageNumber(1);
    setNewestFirst(value === 'newest');
  };

  const handlePageChange = (_event, value) => {
    setPageNumber(value);
  };

  const handleClearFilters = () => {
    setStatuses([]);
    setNewestFirst(true);
    setPageNumber(1);
  };

  const hasFilters = statuses.length > 0 || !newestFirst;

  const headerSummary = useMemo(() => {
    if (loading) return 'טוען מועמדויות...';
    if (totalCount === 0) return 'לא נמצאו מועמדויות';
    return `נמצאו ${totalCount} מועמדויות`;
  }, [loading, totalCount]);

  return (
    <PageShell>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            המועמדויות שלי
          </Typography>
          <Typography variant="body1" color="text.secondary">
            כאן תוכלי לעקוב אחר סטטוס המועמדויות שהגשת, לסנן לפי שלב בתהליך ולצפות בפרטי המשרה.
          </Typography>
        </Stack>

        <Card sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterAltOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {headerSummary}
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="status-filter-label">סינון לפי סטטוס</InputLabel>
                <Select
                  labelId="status-filter-label"
                  multiple
                  value={statuses}
                  onChange={handleStatusChange}
                  input={<OutlinedInput label="סינון לפי סטטוס" />}
                  renderValue={(selected) =>
                    selected.length === 0
                      ? 'הכל'
                      : selected.map((key) => APPLICATION_STATUS_META[key]?.label ?? key).join(', ')
                  }
                >
                  {APPLICATION_STATUS_KEYS.map((key) => (
                    <MenuItem key={key} value={key}>
                      <ListItemText primary={APPLICATION_STATUS_META[key].label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <ToggleButtonGroup
                value={newestFirst ? 'newest' : 'oldest'}
                exclusive
                onChange={handleSortChange}
                size="small"
                aria-label="מיון לפי תאריך"
              >
                <ToggleButton value="newest">החדש ביותר</ToggleButton>
                <ToggleButton value="oldest">הישן ביותר</ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                disabled={!hasFilters}
              >
                ניקוי סינון
              </Button>
            </Stack>
          </Stack>
        </Card>

        {error && (
          <Alert severity="warning" variant="outlined">
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 && !error ? (
          <Card sx={{ p: 6 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.main', color: 'text.primary' }}>
                <InboxOutlinedIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                עדיין לא הגשת מועמדות
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                ברגע שתגישי מועמדות למשרה, היא תופיע כאן עם עדכוני הסטטוס בזמן אמת.
              </Typography>
              <Button variant="contained" href="/jobs">
                מעבר ללוח המשרות
              </Button>
            </Stack>
          </Card>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => {
              const companyInitial = (item.companyName || '?').trim().charAt(0).toUpperCase();

              return (
                <Card key={item.applicationId} sx={{ p: { xs: 2, md: 3 } }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                          src={item.jobImageUrl || undefined}
                          alt={item.companyName || 'חברה'}
                          sx={{ width: 56, height: 56, bgcolor: 'secondary.main', color: 'text.primary' }}
                        >
                          {companyInitial}
                        </Avatar>
                        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                            {item.jobTitle || 'משרה'}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <BusinessOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {item.companyName || 'חברה'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>

                      <ApplicationStatusChip
                        status={item.status}
                        sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                      />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 1.5, sm: 4 }}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EventOutlinedIcon fontSize="small" />
                        <Typography variant="body2">הוגשה: {formatDate(item.appliedAt)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UpdateOutlinedIcon fontSize="small" />
                        <Typography variant="body2">עודכנה: {formatDate(item.updatedAt)}</Typography>
                      </Stack>
                    </Stack>

                    {item.coverLetter && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          מכתב מקדים
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: 'pre-line' }}
                        >
                          {item.coverLetter}
                        </Typography>
                      </Box>
                    )}

                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}
                    >
                      {item.resumeUrl && (
                        <Button
                          component={MuiLink}
                          href={item.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          size="small"
                          startIcon={<DescriptionOutlinedIcon />}
                        >
                          קורות חיים
                        </Button>
                      )}
                      {item.jobWebsiteUrl && (
                        <Button
                          component={MuiLink}
                          href={item.jobWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="text"
                          size="small"
                          startIcon={<OpenInNewOutlinedIcon />}
                        >
                          לאתר המשרה
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
            <Pagination
              count={totalPages}
              page={pageNumber}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Stack>
    </PageShell>
  );
}
