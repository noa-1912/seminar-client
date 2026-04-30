import { useEffect, useState } from 'react';
import { Chip } from '@mui/material';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export default function UnreadInvitationsChip({ sx, count: countOverride }) {
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // When an explicit count is provided, skip the network call (useful for previews/tests).
    if (typeof countOverride === 'number') {
      setCount(countOverride);
      setLoaded(true);
      return undefined;
    }

    let active = true;

    (async () => {
      try {
        const res = await fetch('/api/Invitations/my/new?pageNumber=1&pageSize=1', {
          headers: getAuthHeader(),
        });
        if (!active) return;
        if (!res.ok) {
          setLoaded(true);
          return;
        }
        const data = await res.json().catch(() => null);
        if (!active) return;
        setCount(typeof data?.totalCount === 'number' ? data.totalCount : 0);
      } catch {
        // Silent: the summary chip is best-effort; errors should not break the parent card.
      } finally {
        if (active) setLoaded(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [countOverride]);

  if (!loaded || count === 0) return null;

  const label = count === 1 ? 'הזמנה אחת שטרם נקראה' : `${count} הזמנות שטרם נקראו`;

  return (
    <Chip
      size="small"
      color="warning"
      icon={<MarkEmailUnreadOutlinedIcon />}
      label={label}
      sx={{ fontWeight: 600, ...sx }}
    />
  );
}
