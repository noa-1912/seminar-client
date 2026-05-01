import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { useNavigate } from 'react-router-dom';

/**
 * Displays a single job listing card.
 *
 * Props:
 *   job  {
 *     jobId, title, companyName, location, isRemote,
 *     jobType, field, tags: [{ tagId, name }]
 *   }
 *   onClick (job) => void   – optional
 */
export default function JobCard({ job, onClick }) {
  const navigate = useNavigate();
  const companyInitial = (job.companyName || '?').trim().charAt(0).toUpperCase();
  const canNavigateToDetails = job.jobId !== undefined && job.jobId !== null && job.jobId !== '';

  const handleOpenDetails = (event) => {
    event?.stopPropagation?.();
    if (!canNavigateToDetails) return;
    navigate(`/jobs/${job.jobId}`);
  };

  const handleOpenInterviewSlots = (event) => {
    event?.stopPropagation?.();
    if (!canNavigateToDetails) return;
    navigate(`/jobs/${job.jobId}/interview-slots/new`);
  };

  const content = (
    <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Company avatar */}
        <Avatar
          sx={{
            width: 52,
            height: 52,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: 22,
            fontWeight: 700,
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          {companyInitial}
        </Avatar>

        <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
          {/* Title */}
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }} noWrap>
            {job.title || 'משרה ללא שם'}
          </Typography>

          {/* Company */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <BusinessOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {job.companyName || '—'}
            </Typography>
          </Stack>

          {/* Location + Remote */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {job.location && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnOutlinedIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">
                  {job.location}
                </Typography>
              </Stack>
            )}
            {job.isRemote && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LaptopOutlinedIcon fontSize="small" sx={{ color: 'success.main', fontSize: 16 }} />
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                  עבודה מרחוק
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* JobType + Field badges */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.25 }}>
            {job.field && (
              <Chip
                label={job.field}
                size="small"
                variant="outlined"
                icon={<WorkOutlineOutlinedIcon />}
                sx={{ borderColor: 'primary.main', color: 'primary.main' }}
              />
            )}
            {job.jobType && (
              <Chip
                label={job.jobType}
                size="small"
                variant="outlined"
                sx={{ borderColor: 'text.disabled', color: 'text.secondary' }}
              />
            )}
          </Stack>

          {/* Technology tags */}
          {job.tags && job.tags.length > 0 && (
            <Box sx={{ mt: 0.5 }}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {job.tags.slice(0, 6).map((tag) => (
                  <Chip
                    key={tag.tagId}
                    label={tag.name}
                    size="small"
                    sx={{
                      bgcolor: 'action.selected',
                      color: 'text.primary',
                      fontSize: 11,
                      height: 22,
                    }}
                  />
                ))}
                {job.tags.length > 6 && (
                  <Tooltip title={job.tags.slice(6).map((t) => t.name).join(', ')}>
                    <Chip
                      label={`+${job.tags.length - 6}`}
                      size="small"
                      sx={{ bgcolor: 'action.hover', fontSize: 11, height: 22 }}
                    />
                  </Tooltip>
                )}
              </Stack>
            </Box>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ pt: 1 }}>
            <Button variant="outlined" size="small" onClick={handleOpenDetails} disabled={!canNavigateToDetails}>
              לפרטי המשרה
            </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<EventAvailableOutlinedIcon fontSize="small" />}
              onClick={handleOpenInterviewSlots}
              disabled={!canNavigateToDetails}
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              קביעת ראיונות
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </CardContent>
  );

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.main',
        },
      }}
    >
      {onClick ? (
        <CardActionArea onClick={() => onClick(job)} sx={{ borderRadius: 3 }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
