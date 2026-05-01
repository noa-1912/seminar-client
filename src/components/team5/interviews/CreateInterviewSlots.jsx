import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import PageShell from '../../PageShell/PageShell';
import './CreateInterviewSlots.css';

// Mirrors SchedulingService.Enums.InterviewType (numeric values).
const INTERVIEW_TYPE_OPTIONS = [
  { value: 0, label: 'ראיון טכני' },
  { value: 1, label: 'ראיון מקצועי' },
  { value: 2, label: 'ראיון אישי' },
  { value: 3, label: 'אחר' },
];

const INITIAL_FORM = {
  interviewType: 0,
  timeStart: '',
  timeEnd: '',
  place: '',
  quantity: 1,
};

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Converts the value of <input type="datetime-local"> to a backend ISO string. */
function localInputToIsoString(localValue) {
  if (!localValue) return '';
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

function formatDurationMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes - hours * 60);
  if (hours > 0 && minutes > 0) return `${hours} שעות ו-${minutes} דקות`;
  if (hours > 0) return `${hours} שעות`;
  return `${minutes} דקות`;
}

export default function CreateInterviewSlots() {
  const { jobId: jobIdParam } = useParams();
  const navigate = useNavigate();

  const jobId = useMemo(() => {
    const parsed = Number(jobIdParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [jobIdParam]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { totalMinutes, perSlotMinutes, isRangeValid } = useMemo(() => {
    if (!form.timeStart || !form.timeEnd) {
      return { totalMinutes: 0, perSlotMinutes: 0, isRangeValid: false };
    }
    const start = new Date(form.timeStart).getTime();
    const end = new Date(form.timeEnd).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return { totalMinutes: 0, perSlotMinutes: 0, isRangeValid: false };
    }
    const total = (end - start) / 60000;
    const qty = Math.max(1, Number(form.quantity) || 1);
    return {
      totalMinutes: total,
      perSlotMinutes: total / qty,
      isRangeValid: true,
    };
  }, [form.timeStart, form.timeEnd, form.quantity]);

  const handleChange = (field) => (event) => {
    const rawValue = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]:
        field === 'quantity' || field === 'interviewType'
          ? rawValue === '' ? '' : Number(rawValue)
          : rawValue,
    }));
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const validate = () => {
    if (!jobId) return 'מזהה המשרה אינו תקין.';
    if (!form.place.trim()) return 'יש להזין כתובת לראיון.';
    if (!form.timeStart || !form.timeEnd) return 'יש לבחור זמן התחלה וזמן סיום.';
    if (!isRangeValid) return 'זמן הסיום חייב להיות מאוחר יותר מזמן ההתחלה.';
    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty < 1) return 'כמות הראיונות חייבת להיות מספר שלם חיובי.';
    if (qty > 200) return 'ניתן ליצור עד 200 ראיונות בבת אחת.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      jobId,
      timeStart: localInputToIsoString(form.timeStart),
      timeEnd: localInputToIsoString(form.timeEnd),
      place: form.place.trim(),
      interviewType: Number(form.interviewType),
      quantity: Number(form.quantity),
    };

    try {
      setSubmitting(true);
      setErrorMessage('');
      const response = await fetch('/api/interview-slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `שגיאה בעת יצירת הראיונות (${response.status}).`);
      }

      const created = await response.json().catch(() => null);
      const createdCount = Array.isArray(created) ? created.length : payload.quantity;
      setSuccessMessage(`נוצרו ${createdCount} ראיונות בהצלחה.`);
      setForm({ ...INITIAL_FORM, place: form.place });
    } catch (err) {
      setErrorMessage(err?.message || 'אירעה שגיאה בעת יצירת הראיונות.');
    } finally {
      setSubmitting(false);
    }
  };

  const minStartAttr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}T${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  }, []);

  return (
    <PageShell>
      <Stack spacing={3} className="create-slots">
        {jobIdParam ? (
          <Button
            component={RouterLink}
            to={`/jobs/${jobIdParam}/applications`}
            variant="text"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            חזרה לניהול מועמדויות
          </Button>
        ) : null}
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            יצירת ראיונות חדשים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {jobId ? `יצירת ראיונות עבור משרה #${jobId}` : 'מזהה המשרה חסר בכתובת.'}
          </Typography>
        </Stack>

        {!jobId && (
          <Alert severity="error">
            לא נמצא מזהה משרה תקין בכתובת. חזרה לעמוד המשרה כדי להמשיך.
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          className="create-slots__form"
          noValidate
        >
          <Stack spacing={2.5}>
            <TextField
              select
              label="סוג ראיון"
              value={form.interviewType}
              onChange={handleChange('interviewType')}
              fullWidth
              required
            >
              {INTERVIEW_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
            >
              <TextField
                label="זמן התחלה"
                type="datetime-local"
                value={form.timeStart}
                onChange={handleChange('timeStart')}
                slotProps={{ inputLabel: { shrink: true } }}
                inputProps={{ min: minStartAttr }}
                fullWidth
                required
              />
              <TextField
                label="זמן סיום"
                type="datetime-local"
                value={form.timeEnd}
                onChange={handleChange('timeEnd')}
                slotProps={{ inputLabel: { shrink: true } }}
                inputProps={{ min: form.timeStart || minStartAttr }}
                fullWidth
                required
              />
            </Stack>

            <TextField
              label="כתובת"
              value={form.place}
              onChange={handleChange('place')}
              placeholder="לדוגמה: רחוב הרצל 1, תל אביב"
              fullWidth
              required
            />

            <TextField
              label="כמות ראיונות"
              type="number"
              value={form.quantity}
              onChange={handleChange('quantity')}
              inputProps={{ min: 1, step: 1 }}
              helperText="כאשר הכמות גדולה מאחת, חלון הזמן יחולק שווה בשווה לכמה ראיונות רצופים."
              fullWidth
              required
            />

            {isRangeValid && Number(form.quantity) >= 1 && (
              <Box className="create-slots__preview">
                <Typography variant="body2" color="text.secondary">
                  משך כולל: {formatDurationMinutes(totalMinutes)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כל ראיון יימשך כ-{formatDurationMinutes(perSlotMinutes)}.
                </Typography>
              </Box>
            )}

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !jobId}
                startIcon={submitting ? <CircularProgress size={16} /> : null}
              >
                {submitting ? 'יוצר...' : 'צור ראיונות'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </PageShell>
  );
}
