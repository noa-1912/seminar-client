import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import PageShell from '../../PageShell/PageShell';
import ApplicationStatusChip, {
  APPLICATION_STATUS_KEYS,
  APPLICATION_STATUS_META,
  applicationStatusToIndex,
  normalizeApplicationStatus,
} from '../../components/ApplicationStatusChip/ApplicationStatusChip';

const PAGE_SIZE = 10;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

// Per-application local draft state keyed by applicationId.
// Tracks pending edits so the manager can review before persisting.
function useApplicationDrafts() {
  const [drafts, setDrafts] = useState({});

  const initDraft = useCallback((applicationId, status, notes) => {
    setDrafts((prev) => {
      if (prev[applicationId]) return prev;
      return {
        ...prev,
        [applicationId]: {
          status: normalizeApplicationStatus(status),
          notes: notes ?? '',
          savedStatus: normalizeApplicationStatus(status),
          savedNotes: notes ?? '',
          saving: false,
          error: null,
          savedAt: null,
        },
      };
    });
  }, []);

  const updateDraft = useCallback((applicationId, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [applicationId]: { ...prev[applicationId], ...patch },
    }));
  }, []);

  const markSaved = useCallback((applicationId) => {
    setDrafts((prev) => {
      const current = prev[applicationId];
      if (!current) return prev;
      return {
        ...prev,
        [applicationId]: {
          ...current,
          savedStatus: current.status,
          savedNotes: current.notes,
          saving: false,
          error: null,
          savedAt: Date.now(),
        },
      };
    });
  }, []);

  return { drafts, initDraft, updateDraft, markSaved };
}

export default function ManageJobApplications() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [jobError, setJobError] = useState(null);

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statuses, setStatuses] = useState([]);
  const [newestFirst, setNewestFirst] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  const { drafts, initDraft, updateDraft, markSaved } = useApplicationDrafts();

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    setJobError(null);
    try {
      const res = await fetch(`/api/Jobs/${jobId}`, { headers: getAuthHeader() });
      if (!res.ok) throw new Error(`שגיאה בטעינת פרטי המשרה (${res.status}).`);
      const data = await res.json();
      setJob(data);
    } catch (err) {
      setJobError(err.message || 'אירעה שגיאה לא ידועה בטעינת המשרה.');
    }
  }, [jobId]);

  const fetchApplications = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery({ statuses, newestFirst, pageNumber, pageSize: PAGE_SIZE });
      const res = await fetch(`/api/Applications/job/${jobId}?${query}`, {
        headers: getAuthHeader(),
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error('העמוד מיועד למנהלת בלבד. יש להתחבר עם הרשאות ניהול.');
      }
      if (!res.ok) throw new Error(`אירעה שגיאה בטעינת המועמדויות (${res.status}).`);
      const data = await res.json();
      const list = Array.isArray(data?.items) ? data.items : [];
      setItems(list);
      setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 0);
      setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : 0);
      list.forEach((item) => initDraft(item.applicationId, item.status, item.notes));
    } catch (err) {
      setError(err.message || 'אירעה שגיאה לא ידועה.');
      setItems([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [jobId, statuses, newestFirst, pageNumber, initDraft]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusFilterChange = (event) => {
    const value = event.target.value;
    setPageNumber(1);
    setStatuses(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSortChange = (_event, value) => {
    if (value === null) return;
    setPageNumber(1);
    setNewestFirst(value === 'newest');
  };

  const handleClearFilters = () => {
    setStatuses([]);
    setNewestFirst(true);
    setPageNumber(1);
  };

  const handlePageChange = (_event, value) => {
    setPageNumber(value);
  };

  const handleSave = async (applicationId) => {
    const draft = drafts[applicationId];
    if (!draft) return;

    updateDraft(applicationId, { saving: true, error: null });

    try {
      const statusChanged = draft.status !== draft.savedStatus;
      const notesChanged = (draft.notes ?? '') !== (draft.savedNotes ?? '');

      if (statusChanged) {
        const res = await fetch('/api/Applications/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            applicationId,
            status: applicationStatusToIndex(draft.status),
            notes: draft.notes ?? null,
          }),
        });
        if (!res.ok) throw new Error(`עדכון הסטטוס נכשל (${res.status}).`);
      } else if (notesChanged) {
        const res = await fetch(`/api/Applications/${applicationId}/notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({ notes: draft.notes ?? null }),
        });
        if (!res.ok) throw new Error(`עדכון ההערות נכשל (${res.status}).`);
      }

      setItems((prev) =>
        prev.map((item) =>
          item.applicationId === applicationId
            ? { ...item, status: draft.status, notes: draft.notes ?? '', updatedAt: new Date().toISOString() }
            : item,
        ),
      );
      markSaved(applicationId);
    } catch (err) {
      updateDraft(applicationId, { saving: false, error: err.message || 'אירעה שגיאה בשמירה.' });
    }
  };

  const hasFilters = statuses.length > 0 || !newestFirst;

  const headerSummary = useMemo(() => {
    if (loading) return 'טוען מועמדויות...';
    if (totalCount === 0) return 'לא נמצאו מועמדויות למשרה זו';
    return `נמצאו ${totalCount} מועמדויות`;
  }, [loading, totalCount]);

  return (
    <PageShell>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Button
            component={RouterLink}
            to="/jobs"
            variant="text"
            size="small"
            startIcon={<ArrowForwardOutlinedIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            חזרה ללוח המשרות
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            ניהול מועמדויות למשרה
          </Typography>
          {job ? (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {job.title}
              </Typography>
              {job.companyName && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <BusinessOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.companyName}
                  </Typography>
                </Stack>
              )}
              {job.location && (
                <Typography variant="body2" color="text.secondary">
                  · {job.location}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body1" color="text.secondary">
              צפייה בכל המועמדויות שהוגשו למשרה, עדכון סטטוס המועמדות ותיעוד הערות פנימיות.
            </Typography>
          )}
          {jobError && (
            <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
              {jobError}
            </Alert>
          )}
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

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="manage-status-filter-label">סינון לפי סטטוס</InputLabel>
                <Select
                  labelId="manage-status-filter-label"
                  multiple
                  value={statuses}
                  onChange={handleStatusFilterChange}
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

              <Button variant="outlined" size="small" onClick={handleClearFilters} disabled={!hasFilters}>
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
                אין כרגע מועמדויות למשרה זו
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                ברגע שסטודנטית תגיש מועמדות, היא תופיע כאן להערכה ועדכון סטטוס.
              </Typography>
            </Stack>
          </Card>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => {
              const draft = drafts[item.applicationId];
              const currentStatus = draft?.status ?? normalizeApplicationStatus(item.status);
              const currentNotes = draft?.notes ?? item.notes ?? '';
              const isDirty =
                draft &&
                (draft.status !== draft.savedStatus || (draft.notes ?? '') !== (draft.savedNotes ?? ''));
              const studentName = item.student?.name?.trim() || 'מועמדת';
              const studentInitial = studentName.charAt(0).toUpperCase();

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
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: 'secondary.main',
                            color: 'text.primary',
                            fontWeight: 700,
                          }}
                        >
                          {studentInitial}
                        </Avatar>
                        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                            {studentName}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            flexWrap="wrap"
                            rowGap={0.5}
                            sx={{ color: 'text.secondary' }}
                          >
                            {item.student?.email && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <EmailOutlinedIcon fontSize="small" />
                                <MuiLink
                                  href={`mailto:${item.student.email}`}
                                  variant="body2"
                                  color="inherit"
                                  underline="hover"
                                >
                                  {item.student.email}
                                </MuiLink>
                              </Stack>
                            )}
                            {item.student?.phone && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <LocalPhoneOutlinedIcon fontSize="small" />
                                <Typography variant="body2">{item.student.phone}</Typography>
                              </Stack>
                            )}
                            {item.student?.address && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <HomeOutlinedIcon fontSize="small" />
                                <Typography variant="body2">{item.student.address}</Typography>
                              </Stack>
                            )}
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

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        מכתב פנייה אישי
                      </Typography>
                      {item.coverLetter ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {item.coverLetter}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          המועמדת לא צירפה מכתב פנייה אישי.
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
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
                      {item.student?.email && (
                        <Button
                          component={MuiLink}
                          href={`mailto:${item.student.email}`}
                          variant="text"
                          size="small"
                          startIcon={<MailOutlineOutlinedIcon />}
                        >
                          שליחת מייל
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

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          הערות פנימיות
                        </Typography>
                        <Tooltip title="ההערות גלויות למנהלת בלבד ולא לתלמידה">
                          <Typography variant="caption" color="text.secondary">
                            (לא גלויות לתלמידה)
                          </Typography>
                        </Tooltip>
                      </Stack>

                      <TextField
                        value={currentNotes}
                        onChange={(event) =>
                          updateDraft(item.applicationId, { notes: event.target.value })
                        }
                        multiline
                        minRows={3}
                        fullWidth
                        placeholder="תיעוד פנימי על המועמדת: רושם כללי, נקודות לחיזוק, שאלות להמשך..."
                      />

                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        justifyContent="space-between"
                      >
                        <FormControl size="small" sx={{ minWidth: 240 }}>
                          <InputLabel id={`status-select-${item.applicationId}`}>סטטוס מועמדות</InputLabel>
                          <Select
                            labelId={`status-select-${item.applicationId}`}
                            value={currentStatus}
                            label="סטטוס מועמדות"
                            onChange={(event) =>
                              updateDraft(item.applicationId, { status: event.target.value })
                            }
                            renderValue={(value) => (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <ApplicationStatusChip status={value} variant="filled" />
                              </Stack>
                            )}
                          >
                            {APPLICATION_STATUS_KEYS.map((key) => (
                              <MenuItem key={key} value={key}>
                                <ApplicationStatusChip status={key} variant="outlined" />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                          flexWrap="wrap"
                          rowGap={1}
                        >
                          {draft?.error && (
                            <Typography variant="body2" color="error">
                              {draft.error}
                            </Typography>
                          )}
                          {!draft?.error && draft?.savedAt && !isDirty && (
                            <Typography variant="body2" color="success.main">
                              נשמר בהצלחה
                            </Typography>
                          )}
                          <Button
                            variant="contained"
                            onClick={() => handleSave(item.applicationId)}
                            disabled={!isDirty || draft?.saving}
                            startIcon={<SaveOutlinedIcon />}
                          >
                            {draft?.saving ? 'שומר...' : 'שמירת שינויים'}
                          </Button>
                        </Stack>
                      </Stack>
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
