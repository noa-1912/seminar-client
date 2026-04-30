import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { fetchTags } from '../../../api';

export const FIELD_OPTIONS = [
  { value: 'Development', label: 'פיתוח' },
  { value: 'QA',          label: 'QA' },
  { value: 'DevOps',      label: 'DevOps' },
];

/**
 * Sidebar filter panel for the Jobs Board.
 *
 * Props:
 *   searchTerm  string
 *   onSearchTermChange (value: string) => void
 *   field       string
 *   onFieldChange (value: string) => void
 *   tagId       number | null
 *   onTagIdChange (value: number | null) => void
 *   onClear () => void
 *   hasActiveFilters boolean
 */
export default function JobFilters({
  searchTerm,
  onSearchTermChange,
  field,
  onFieldChange,
  tagId,
  onTagIdChange,
  onClear,
  hasActiveFilters,
}) {
  const [tags,         setTags]         = useState([]);
  const [tagsLoading,  setTagsLoading]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTagsLoading(true);
    fetchTags()
      .then((data) => {
        if (!cancelled) setTags(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setTags([]);
      })
      .finally(() => {
        if (!cancelled) setTagsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: '100%', md: 280 },
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        alignSelf: 'flex-start',
        position: { md: 'sticky' },
        top: { md: 24 },
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TuneOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            סינון משרות
          </Typography>
        </Stack>

        <Divider />

        {/* Free-text search */}
        <TextField
          size="small"
          label="חיפוש חופשי"
          placeholder="תפקיד, חברה, מיקום..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          fullWidth
        />

        {/* Field (domain) select */}
        <FormControl size="small" fullWidth>
          <InputLabel id="field-label">תחום</InputLabel>
          <Select
            labelId="field-label"
            value={field}
            label="תחום"
            onChange={(e) => onFieldChange(e.target.value)}
          >
            <MenuItem value="">הכל</MenuItem>
            {FIELD_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tags multi-select */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            טכנולוגיות
          </Typography>
          {tagsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <FormControl size="small" fullWidth>
              <InputLabel id="tag-label">תגית</InputLabel>
              <Select
                labelId="tag-label"
                value={tagId ?? ''}
                label="תגית"
                input={<OutlinedInput label="תגית" />}
                onChange={(e) => onTagIdChange(e.target.value === '' ? null : Number(e.target.value))}
              >
                <MenuItem value="">הכל</MenuItem>
                {tags.map((tag) => (
                  <MenuItem key={tag.tagId} value={tag.tagId}>
                    {tag.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {field && (
              <Chip
                size="small"
                label={FIELD_OPTIONS.find((o) => o.value === field)?.label ?? field}
                onDelete={() => onFieldChange('')}
              />
            )}
            {tagId != null && (
              <Chip
                size="small"
                label={tags.find((t) => t.tagId === tagId)?.name ?? `תגית ${tagId}`}
                onDelete={() => onTagIdChange(null)}
              />
            )}
            {searchTerm && (
              <Chip
                size="small"
                label={`"${searchTerm}"`}
                onDelete={() => onSearchTermChange('')}
              />
            )}
          </Stack>
        )}

        <Divider />

        <Button
          variant="outlined"
          size="small"
          disabled={!hasActiveFilters}
          onClick={onClear}
          fullWidth
        >
          ניקוי כל הפילטרים
        </Button>
      </Stack>
    </Box>
  );
}
