import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import { useAuth } from '../../../auth/AuthContext';
import { isManagerRole } from '../../../auth/resolveUserRole';

const INTERVIEW_TYPE_LABELS = {
  0: 'ראיון טכני',
  1: 'ראיון מקצועי',
  2: 'ראיון אישי',
  3: 'אחר',
};

function getAuthHeader() {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('token') || window.localStorage.getItem('authToken')
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeSlot(raw) {
  const id = raw.interviewSlotID ?? raw.InterviewSlotID;
  const jobID = raw.jobID ?? raw.JobID;
  const timeStart = raw.timeStart ?? raw.TimeStart;
  const timeEnd = raw.timeEnd ?? raw.TimeEnd;
  const place = raw.place ?? raw.Place ?? '';
  const interviewType = Number(raw.interviewType ?? raw.InterviewType ?? 0);
  const slotStatus = Number(raw.slotStatus ?? raw.SlotStatus ?? 0);
  return {
    id,
    jobID,
    timeStart,
    timeEnd,
    place,
    interviewType,
    slotStatus,
  };
}

function normalizeAvailableStudent(raw) {
  const studentId = Number(raw.studentId ?? raw.StudentId);
  const start = raw.start ?? raw.Start;
  const end = raw.end ?? raw.End;
  return { studentId, start, end };
}

function formatRange(timeStart, timeEnd) {
  const start = new Date(timeStart);
  const end = new Date(timeEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—';
  const dateStr = start.toLocaleDateString('he-IL', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const t0 = start.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  const t1 = end.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr}, ${t0}–${t1}`;
}

/**
 * @param {{ jobId: number | null, variant?: 'standalone' | 'embedded' }} props
 */
export default function InterviewSlotsPanel({ jobId, variant = 'standalone' }) {
  const embedded = variant === 'embedded';
  const { user, status: authStatus, isAuthenticated } = useAuth();

  const managerOk = isAuthenticated && isManagerRole(user);

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [pickerSlot, setPickerSlot] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const loadSlots = useCallback(async () => {
    if (!jobId || !managerOk) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/interview-slots', { headers: getAuthHeader() });
      if (res.status === 401 || res.status === 403) {
        throw new Error('אין הרשאה לצפות ברשימת זמני הראיון. נדרשות הרשאות מנהלת.');
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `שגיאה בטעינת זמני הראיון (${res.status}).`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const now = Date.now();
      const normalized = list
        .map(normalizeSlot)
        .filter((s) => s.jobID === jobId && new Date(s.timeEnd).getTime() > now)
        .sort((a, b) => new Date(a.timeStart) - new Date(b.timeStart));
      setSlots(normalized);
    } catch (err) {
      setError(err?.message || 'אירעה שגיאה בטעינת הנתונים.');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [jobId, managerOk]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const fetchAvailableForSlot = useCallback(async (slot) => {
    if (!slot) return;
    setSearchLoading(true);
    setDialogError('');
    setCandidates([]);
    setSelectedStudentId('');
    try {
      const startIso = new Date(slot.timeStart).toISOString();
      const endIso = new Date(slot.timeEnd).toISOString();
      const qs = new URLSearchParams({ start: startIso, end: endIso }).toString();
      const res = await fetch(`/api/scheduled-interviews/available-students?${qs}`, {
        headers: { ...getAuthHeader(), Accept: 'application/json' },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `שגיאה בחיפוש (${res.status}).`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data.map(normalizeAvailableStudent).filter((x) => x.studentId > 0) : [];
      setCandidates(list);
    } catch (err) {
      setDialogError(err?.message || 'אירעה שגיאה בחיפוש מועמדות זמינות.');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pickerSlot) {
      fetchAvailableForSlot(pickerSlot);
    }
  }, [pickerSlot, fetchAvailableForSlot]);

  const handleOpenPicker = (slot) => {
    setAssignSuccess('');
    setPickerSlot(slot);
  };

  const handleClosePicker = () => {
    setPickerSlot(null);
    setCandidates([]);
    setDialogError('');
    setSelectedStudentId('');
  };

  const handleAssign = async () => {
    if (!pickerSlot || !selectedStudentId) return;
    setAssignLoading(true);
    setDialogError('');
    try {
      const studentId = Number(selectedStudentId);
      const res = await fetch('/api/scheduled-interviews', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          slotId: pickerSlot.id,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `שיבוץ נכשל (${res.status}).`);
      }
      handleClosePicker();
      setAssignSuccess('המועמדת שובצה לראיון בהצלחה.');
      await loadSlots();
    } catch (err) {
      setDialogError(err?.message || 'אירעה שגיאה בשיבוץ.');
    } finally {
      setAssignLoading(false);
    }
  };

  if (authStatus === 'loading') {
    return (
      <Box display="flex" justifyContent="center" py={embedded ? 3 : 6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Alert severity="warning" sx={{ maxWidth: 560 }}>
        יש להתחבר כדי לצפות בתזמון ראיונות.
        <Box sx={{ mt: 1 }}>
          <Button component={RouterLink} to="/login" variant="contained" size="small">
            התחברות
          </Button>
        </Box>
      </Alert>
    );
  }

  if (!managerOk) {
    return (
      <Alert severity="error" sx={{ maxWidth: 560 }}>
        העמוד מיועד למנהלות בלבד.
      </Alert>
    );
  }

  return (
    <Box sx={embedded ? { pt: 1 } : undefined}>
      <Stack spacing={3} sx={{ maxWidth: 960, mx: embedded ? 0 : 'auto', width: '100%' }}>
        {!embedded && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to={jobId ? `/jobs/${jobId}/applications` : '/jobs'}
              variant="text"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              חזרה לניהול מועמדויות
            </Button>
            {jobId ? (
              <Button
                component={RouterLink}
                to={`/jobs/${jobId}/interview-slots/new`}
                variant="outlined"
                size="small"
              >
                יצירת זמני ראיון חדשים
              </Button>
            ) : null}
          </Stack>
        )}

        {!embedded && (
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              זמני ראיון למשרה
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {jobId
                ? `חלונות שטרם הסתיימו (פנויים ומתוזמנים) · משרה #${jobId}`
                : 'לא נבחרה משרה.'}
            </Typography>
          </Stack>
        )}

        {assignSuccess && <Alert severity="success">{assignSuccess}</Alert>}

        {!embedded && !jobId && <Alert severity="info">בחרו משרה כדי לראות זמני ראיון.</Alert>}

        {jobId && error && <Alert severity="error">{error}</Alert>}

        {jobId && loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {jobId && !loading && !error && slots.length === 0 && (
          <Alert severity="info">אין זמני ראיון עתידיים למשרה זו.</Alert>
        )}

        {jobId && !loading && slots.length > 0 && (
          <Table size="small" sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>זמן</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>מיקום</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>סוג</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>סטטוס חלון</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: 72 }}>
                  שיבוץ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slots.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatRange(row.timeStart, row.timeEnd)}</TableCell>
                  <TableCell>{row.place || '—'}</TableCell>
                  <TableCell>
                    {INTERVIEW_TYPE_LABELS[row.interviewType] ?? `סוג (${row.interviewType})`}
                  </TableCell>
                  <TableCell>
                    {row.slotStatus === 1 ? (
                      <Chip label="מתוזמן (תפוס)" color="primary" size="small" variant="outlined" />
                    ) : (
                      <Chip label="פנוי" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {row.slotStatus === 0 ? (
                      <Tooltip title="חיפוש מועמדת זמינה בשעה זו">
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label="חיפוש מועמדת זמינה"
                          onClick={() => handleOpenPicker(row)}
                        >
                          <PersonSearchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="חלון תפוס">
                        <span>
                          <IconButton size="small" disabled aria-label="חלון תפוס">
                            <PersonSearchIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={Boolean(pickerSlot)} onClose={handleClosePicker} fullWidth maxWidth="sm">
          <DialogTitle>מועמדות זמינות לחלון</DialogTitle>
          <DialogContent dividers>
            {pickerSlot ? (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {formatRange(pickerSlot.timeStart, pickerSlot.timeEnd)} · {pickerSlot.place || 'ללא מיקום'}
                </Typography>
                {searchLoading && (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={28} />
                  </Box>
                )}
                {dialogError && <Alert severity="error">{dialogError}</Alert>}
                {!searchLoading && !dialogError && candidates.length === 0 && (
                  <Alert severity="info">לא נמצאו מועמדות עם זמינות מתאימה לשעה זו.</Alert>
                )}
                {!searchLoading && candidates.length > 0 && (
                  <RadioGroup
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    {candidates.map((c) => (
                      <FormControlLabel
                        key={c.studentId}
                        value={String(c.studentId)}
                        control={<Radio size="small" />}
                        label={`מועמדת #${c.studentId}`}
                      />
                    ))}
                  </RadioGroup>
                )}
              </Stack>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClosePicker} disabled={assignLoading}>
              סגירה
            </Button>
            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={assignLoading || !selectedStudentId || candidates.length === 0}
            >
              {assignLoading ? 'משבצת...' : 'שבץ לראיון'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
