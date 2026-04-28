import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import JobCard from '../JobCard/JobCard';

/**
 * Renders the jobs list with loading, error, and empty states.
 *
 * Props:
 *   jobs         Job[]
 *   isLoading    boolean
 *   error        string | null
 *   totalCount   number
 *   totalPages   number
 *   pageNumber   number
 *   onPageChange (page: number) => void
 *   onJobClick   (job) => void   – optional
 *   onClearFilters () => void    – shown in empty state when filters are active
 *   hasActiveFilters boolean
 */
export default function JobList({
  jobs,
  isLoading,
  error,
  totalCount,
  totalPages,
  pageNumber,
  onPageChange,
  onJobClick,
  onClearFilters,
  hasActiveFilters,
}) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (jobs.length === 0) {
    return (
      <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 10 }}>
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: 'action.selected',
            color: 'text.secondary',
          }}
        >
          <SearchOffOutlinedIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          לא נמצאו משרות
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          {hasActiveFilters
            ? 'נסי לשנות את הפילטרים או לנקות את החיפוש.'
            : 'כרגע אין משרות פתוחות. נסי שוב מאוחר יותר.'}
        </Typography>
        {hasActiveFilters && onClearFilters && (
          <Button variant="outlined" onClick={onClearFilters}>
            ניקוי הפילטרים
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {/* Result count */}
      <Typography variant="body2" color="text.secondary">
        {`נמצאו ${totalCount} משרות`}
      </Typography>

      {/* Cards */}
      <Stack spacing={1.5}>
        {jobs.map((job) => (
          <JobCard key={job.jobId} job={job} onClick={onJobClick} />
        ))}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={(_e, page) => onPageChange(page)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Stack>
  );
}
