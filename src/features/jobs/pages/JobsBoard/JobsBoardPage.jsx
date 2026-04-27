import { Box, Stack, Typography } from '@mui/material';
import PageShell from '../../../../components/PageShell/PageShell';
import JobFilters from '../../components/JobFilters/JobFilters';
import JobList from '../../components/JobList/JobList';
import { useJobsSearch } from '../../hooks/useJobsSearch';

export default function JobsBoardPage() {
  const {
    searchTerm, setSearchTerm,
    field, setField,
    tagId, setTagId,
    jobs,
    isLoading,
    error,
    totalCount,
    totalPages,
    pageNumber,
    setPageNumber,
  } = useJobsSearch();

  const hasActiveFilters = Boolean(searchTerm || field || tagId != null);

  const handleClear = () => {
    setSearchTerm('');
    setField('');
    setTagId(null);
  };

  return (
    <PageShell>
      <Stack spacing={3}>
        {/* Page header */}
        <Stack spacing={0.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            לוח משרות
          </Typography>
          <Typography variant="body1" color="text.secondary">
            חפשי את המשרה המושלמת עבורך. השתמשי בפילטרים כדי לצמצם את התוצאות.
          </Typography>
        </Stack>

        {/* Two-column layout: sidebar + list */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            alignItems: 'flex-start',
          }}
        >
          {/* Sidebar */}
          <JobFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            field={field}
            onFieldChange={setField}
            tagId={tagId}
            onTagIdChange={setTagId}
            hasActiveFilters={hasActiveFilters}
            onClear={handleClear}
          />

          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <JobList
              jobs={jobs}
              isLoading={isLoading}
              error={error}
              totalCount={totalCount}
              totalPages={totalPages}
              pageNumber={pageNumber}
              onPageChange={setPageNumber}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClear}
            />
          </Box>
        </Box>
      </Stack>
    </PageShell>
  );
}
