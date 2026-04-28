import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { submitApplication } from '../api/applications.api';
import FileUploadZone from './FileUploadZone';

function getHebrewSubmissionError(message) {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('already') || normalized.includes('duplicate')) {
    return 'כבר הוגשה מועמדות למשרה זו.';
  }

  if (normalized.includes('deadline') || normalized.includes('expired')) {
    return 'לא ניתן להגיש למשרה זו כי מועד ההגשה הסתיים.';
  }

  if (normalized.includes('unauthorized') || normalized.includes('forbidden')) {
    return 'אין הרשאה לבצע את הפעולה הזו.';
  }

  if (normalized.includes('not found')) {
    return 'המשרה לא נמצאה.';
  }

  return 'אירעה שגיאה בעת שליחת המועמדות. נסה שוב.';
}

export default function ApplyToJobModal({ open, onClose, jobId, onSubmitted }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCoverLetter('');
      setResumeUrl('');
      setErrorMessage('');
      setSuccessMessage('');
      setIsSubmitting(false);
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    return Boolean(resumeUrl) && !isSubmitting;
  }, [isSubmitting, resumeUrl]);

  function handleResumeUploaded(url) {
    setResumeUrl(url);
    setErrorMessage('');
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    const parsedJobId = Number(jobId);

    if (!Number.isFinite(parsedJobId)) {
      setErrorMessage('לא ניתן לשלוח מועמדות עבור משרה זו.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await submitApplication({
        jobId: parsedJobId,
        coverLetter: coverLetter.trim(),
        resumeUrl,
      });

      setSuccessMessage('המועמדות נשלחה בהצלחה.');

      if (typeof onSubmitted === 'function') {
        onSubmitted();
      }

      window.setTimeout(() => {
        onClose?.();
      }, 700);
    } catch (error) {
      setErrorMessage(getHebrewSubmissionError(error?.message));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      dir="rtl"
      aria-labelledby="apply-job-dialog-title"
    >
      <DialogTitle id="apply-job-dialog-title">הגשת מועמדות למשרה</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            כדי לשלוח מועמדות יש להעלות קובץ קורות חיים.
          </Typography>

          <TextField
            label="מכתב מקדים (אופציונלי)"
            aria-label="מכתב מקדים"
            fullWidth
            multiline
            minRows={4}
            value={coverLetter}
            onChange={(event) => setCoverLetter(event.target.value)}
            disabled={isSubmitting}
          />

          <FileUploadZone onUploaded={handleResumeUploaded} />

          {!resumeUrl && (
            <Alert severity="info">יש להעלות קורות חיים לפני שליחת המועמדות.</Alert>
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="text"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="ביטול ושליחה מאוחר יותר"
        >
          ביטול
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="שליחת מועמדות"
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          שליחת מועמדות
        </Button>
      </DialogActions>
    </Dialog>
  );
}
