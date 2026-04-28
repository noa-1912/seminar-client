import { Chip } from '@mui/material';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// Mirrors backend enum jobs_service_backend.Data.Enums.ApplicationStatus.
// Order matters: index === enum value serialized by the API.
export const APPLICATION_STATUS_KEYS = ['Pending', 'Interviewed', 'Accepted', 'Rejected'];

export const APPLICATION_STATUS_META = {
  Pending: { label: 'ממתינה', color: 'warning', icon: PendingOutlinedIcon },
  Interviewed: { label: 'בראיון', color: 'info', icon: ChatBubbleOutlineOutlinedIcon },
  Accepted: { label: 'התקבלה', color: 'success', icon: CheckCircleOutlineOutlinedIcon },
  Rejected: { label: 'נדחתה', color: 'error', icon: CancelOutlinedIcon },
};

// Backend may serialize enums as numeric index or as string; normalize either form.
export function normalizeApplicationStatus(raw) {
  if (typeof raw === 'number') return APPLICATION_STATUS_KEYS[raw] ?? 'Pending';
  if (typeof raw === 'string') return APPLICATION_STATUS_KEYS.includes(raw) ? raw : 'Pending';
  return 'Pending';
}

export function applicationStatusToIndex(status) {
  const key = normalizeApplicationStatus(status);
  return APPLICATION_STATUS_KEYS.indexOf(key);
}

export default function ApplicationStatusChip({
  status,
  size = 'small',
  variant = 'outlined',
  sx,
}) {
  const key = normalizeApplicationStatus(status);
  const meta = APPLICATION_STATUS_META[key];
  const Icon = meta.icon;

  return (
    <Chip
      size={size}
      color={meta.color}
      variant={variant}
      icon={<Icon />}
      label={meta.label}
      sx={{ fontWeight: 600, ...sx }}
    />
  );
}
