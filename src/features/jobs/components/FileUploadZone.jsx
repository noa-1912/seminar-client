import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { uploadResume } from '../api/files.api';

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function bytesToMb(sizeInBytes) {
  return (sizeInBytes / 1024 / 1024).toFixed(1);
}

function getFileExtension(fileName) {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex < 0) return '';
  return fileName.slice(dotIndex).toLowerCase();
}

function validateResumeFile(file) {
  if (!file) {
    return 'יש לבחור קובץ קורות חיים.';
  }

  const extension = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'ניתן להעלות רק קבצי PDF, DOC או DOCX.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'הקובץ גדול מדי. ניתן להעלות עד 15MB.';
  }

  return '';
}

export default function FileUploadZone({ onUploaded }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function resetSelection() {
    setSelectedFile(null);
    setUploadedUrl('');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleFileSelection(file) {
    const validationError = validateResumeFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    setIsUploading(true);

    try {
      const response = await uploadResume(file);
      const urlFromServer = response?.url;

      if (!urlFromServer) {
        throw new Error('העלאת הקובץ נכשלה. לא התקבלה כתובת קובץ מהשרת.');
      }

      setUploadedUrl(urlFromServer);
      if (typeof onUploaded === 'function') {
        onUploaded(urlFromServer);
      }
    } catch (error) {
      setUploadedUrl('');
      setErrorMessage(error?.message || 'אירעה שגיאה בהעלאת הקובץ. נסה שוב.');
    } finally {
      setIsUploading(false);
    }
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileSelection(file);
  }

  function openFilePicker() {
    if (isUploading) return;
    fileInputRef.current?.click();
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (isUploading) return;
    setIsDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragActive(false);
    if (isUploading) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    handleFileSelection(file);
  }

  return (
    <Stack spacing={2} dir="rtl">
      <Box
        onClick={openFilePicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="אזור העלאת קובץ קורות חיים"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
          }
        }}
        sx={(theme) => ({
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          p: 3,
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: theme.transitions.create(['border-color', 'background-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          opacity: isUploading ? 0.75 : 1,
        })}
      >
        <Stack spacing={1.5} alignItems="center">
          <UploadFileOutlinedIcon color="primary" />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            גררו לכאן קובץ קורות חיים או לחצו לבחירה
          </Typography>
          <Typography variant="body2" color="text.secondary">
            פורמטים נתמכים: PDF, DOC, DOCX | גודל מקסימלי: 15MB
          </Typography>
          {isUploading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                מעלה קובץ...
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      {selectedFile && (
        <Box
          sx={{
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {`${bytesToMb(selectedFile.size)}MB`}
              </Typography>
              {uploadedUrl && (
                <Typography variant="caption" color="success.main">
                  הקובץ הועלה בהצלחה.
                </Typography>
              )}
            </Stack>
            <Button
              variant="outlined"
              color="inherit"
              onClick={resetSelection}
              startIcon={<DeleteOutlineOutlinedIcon />}
              disabled={isUploading}
            >
              הסרה
            </Button>
          </Stack>
        </Box>
      )}

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </Stack>
  );
}
