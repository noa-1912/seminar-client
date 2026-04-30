import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, LinearProgress, Paper, Snackbar, Stack, Typography } from '@mui/material';
import PageShell from '../../PageShell/PageShell';
import StudentAvailabilityCalendar from './StudentAvailabilityCalendar/StudentAvailabilityCalendar';
import {
  createStudentAvailability,
  deleteStudentAvailability,
  getAllStudentAvailability,
  updateWholeDayStatus,
} from '../../../services/studentAvailabilityApi';

// TODO: replace with the authenticated student id once auth is wired.
const DEV_STUDENT_ID = 1;

const AvailabilityStatus = { Available: 0, Unavailable: 1 };
const AvailabilityReasonKind = { Personal: 0, Interview: 1 };

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toIsoDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** "HH:mm" from a Date (local). */
function timeFromDate(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Local ISO without TZ suffix — what EF/System.Text.Json treats as DateTimeKind.Unspecified. */
function toLocalIsoNoTz(date) {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  );
}

function combineDateKeyAndTime(dateKey, hhmm) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  return toLocalIsoNoTz(new Date(y, m - 1, d, h, mi, 0));
}

function dayEndIso(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return toLocalIsoNoTz(new Date(y, m - 1, d, 23, 59, 59));
}

/** Truthy if the record covers essentially the full day (created by UpdateWholeDayStatusAsync). */
function isFullDayRecord(record) {
  const s = new Date(record.startTime);
  const e = new Date(record.endTime);
  if (s.getHours() !== 0 || s.getMinutes() !== 0) return false;
  // Server uses dayEnd.AddTicks(-1), which is "next day 00:00 - 1 tick".
  // Accept anything within the last second of the same day.
  const sameDay = e.getFullYear() === s.getFullYear() && e.getMonth() === s.getMonth() && e.getDate() === s.getDate();
  return sameDay && e.getHours() === 23 && e.getMinutes() === 59;
}

/** Group server records into the calendar's { [dateKey]: { dayStatus, slots[], ... } } shape. */
function serverRecordsToValue(records) {
  const byDate = {};
  for (const r of records || []) {
    const start = new Date(r.startTime);
    const key = toIsoDateKey(start);
    if (!byDate[key]) {
      byDate[key] = {
        dayStatus: AvailabilityStatus.Available,
        dayReasonStudent: '',
        dayReasonStatus: AvailabilityReasonKind.Personal,
        slots: [],
      };
    }

    if (isFullDayRecord(r)) {
      byDate[key].dayStatus = r.status ?? AvailabilityStatus.Available;
      byDate[key].dayReasonStudent = r.reasonStudent || '';
      byDate[key].dayReasonStatus = r.reasonStatus ?? AvailabilityReasonKind.Personal;
      continue;
    }

    const end = new Date(r.endTime);
    byDate[key].slots.push({
      id: r.id,
      start: timeFromDate(start),
      end: timeFromDate(end),
      status: r.status ?? AvailabilityStatus.Available,
      reasonStudent: r.reasonStudent || '',
      reasonStatus: r.reasonStatus ?? AvailabilityReasonKind.Personal,
    });
  }

  for (const k of Object.keys(byDate)) {
    byDate[k].slots.sort((a, b) => a.start.localeCompare(b.start));
  }
  return byDate;
}

function recordOverlapsDay(record, dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dayStart = new Date(y, m - 1, d);
  const dayEnd = new Date(y, m - 1, d + 1);
  const rs = new Date(record.startTime);
  const re = new Date(record.endTime);
  return rs < dayEnd && re > dayStart;
}

function parseTimeToMinutes(hhmm) {
  const [h, mi] = hhmm.split(':').map(Number);
  return h * 60 + mi;
}
function minutesToTime(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/**
 * Persist the drawer's day state. The server forbids overlapping records,
 * so the safest approach is: delete every record overlapping the day, then
 * re-create from the client state.
 */
async function commitDay(studentId, dateKey, dayEntry, allServerRecords) {
  const overlapping = (allServerRecords || []).filter((r) => recordOverlapsDay(r, dateKey));

  for (const r of overlapping) {
    await deleteStudentAvailability(studentId, r.id);
  }

  const slots = Array.isArray(dayEntry?.slots) ? dayEntry.slots : [];
  const dayStatus = dayEntry?.dayStatus ?? AvailabilityStatus.Available;
  const dayReason = dayEntry?.dayReasonStudent || '';

  // Case A: available day, no exceptions → no records needed.
  if (dayStatus === AvailabilityStatus.Available && slots.length === 0) return;

  // Case C: unavailable day, no exceptions → one full-day Unavailable record.
  if (dayStatus === AvailabilityStatus.Unavailable && slots.length === 0) {
    await updateWholeDayStatus(
      studentId,
      `${dateKey}T00:00:00`,
      AvailabilityStatus.Unavailable,
      dayReason
    );
    return;
  }

  // Case B: available day with exceptions → just create each exception row.
  if (dayStatus === AvailabilityStatus.Available) {
    for (const s of slots) {
      await createStudentAvailability(studentId, {
        studentId,
        startTime: combineDateKeyAndTime(dateKey, s.start),
        endTime: combineDateKeyAndTime(dateKey, s.end),
        status: s.status ?? AvailabilityStatus.Unavailable,
        reasonStudent: s.reasonStudent || '',
      });
    }
    return;
  }

  // Case D: unavailable day with exceptions.
  // Available exceptions become Available rows; the remaining time is filled with
  // Unavailable rows so the server correctly reflects "unavailable by default".
  const availables = slots
    .filter((s) => (s.status ?? AvailabilityStatus.Available) === AvailabilityStatus.Available)
    .map((s) => ({
      startMin: parseTimeToMinutes(s.start),
      endMin: parseTimeToMinutes(s.end),
      reasonStudent: s.reasonStudent || '',
    }))
    .sort((a, b) => a.startMin - b.startMin);

  const dayEndMin = 24 * 60 - 1;
  let cursor = 0;

  for (const a of availables) {
    if (a.startMin > cursor) {
      await createStudentAvailability(studentId, {
        studentId,
        startTime: combineDateKeyAndTime(dateKey, minutesToTime(cursor)),
        endTime: combineDateKeyAndTime(dateKey, minutesToTime(a.startMin)),
        status: AvailabilityStatus.Unavailable,
        reasonStudent: dayReason,
      });
    }
    await createStudentAvailability(studentId, {
      studentId,
      startTime: combineDateKeyAndTime(dateKey, minutesToTime(a.startMin)),
      endTime: combineDateKeyAndTime(dateKey, minutesToTime(a.endMin)),
      status: AvailabilityStatus.Available,
      reasonStudent: a.reasonStudent,
    });
    cursor = a.endMin;
  }

  if (cursor < dayEndMin) {
    await createStudentAvailability(studentId, {
      studentId,
      startTime: combineDateKeyAndTime(dateKey, minutesToTime(cursor)),
      endTime: dayEndIso(dateKey),
      status: AvailabilityStatus.Unavailable,
      reasonStudent: dayReason,
    });
  }
}

export default function StudentAvailabilityPage() {
  const [value, setValue] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const serverRecordsRef = useRef([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const records = (await getAllStudentAvailability(DEV_STUDENT_ID)) || [];
      serverRecordsRef.current = records;
      setValue(serverRecordsToValue(records));
    } catch (e) {
      setError(e?.message || 'שגיאה בטעינת הזמינות');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCommitDay = useCallback(
    async (dateKey, dayEntry) => {
      setSaving(true);
      setError('');
      try {
        await commitDay(DEV_STUDENT_ID, dateKey, dayEntry, serverRecordsRef.current);
        await refresh();
      } catch (e) {
        setError(e?.message || 'שגיאה בשמירת הזמינות');
        // Pull the server's canonical state so the UI reflects reality after a failure.
        try {
          await refresh();
        } catch {
          /* already reported */
        }
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const minDate = useMemo(() => new Date(), []);

  return (
    <PageShell>
      <Stack spacing={2.5}>
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={0.75}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
              זמינות לראיונות
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 720 }}>
              בחרו ימים, סמנו זמינות יומית, והוסיפו חריגות לשעות ספציפיות. אפשר להתחיל מזמינות מלאה ואז לחסום שעות, או להפך.
            </Typography>
            {(loading || saving) && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
          </Stack>
        </Paper>

        {error ? (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        ) : null}

        <StudentAvailabilityCalendar
          value={value}
          onChange={setValue}
          onCommitDay={handleCommitDay}
          minDate={minDate}
        />
      </Stack>

      <Snackbar
        open={saving}
        message="שומר..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </PageShell>
  );
}
