import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Link as MuiLink,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PageShell from '../../PageShell/PageShell';

const PAGE_SIZE = 10;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function PrivateInvitations() {
  const [items, setItems] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());
  // The application submission form itself is owned by another team.
  // This page only opens a placeholder dialog targeting the selected invitation.
  const [applyTarget, setApplyTarget] = useState(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/Invitations/my/all?pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}`,
        { headers: getAuthHeader() },
      );
      if (res.status === 401 || res.status === 403) {
        throw new Error('יש להתחבר כסטודנטית כדי לצפות בהזמנות הפרטיות שלך.');
      }
      if (!res.ok) {
        throw new Error(`אירעה שגיאה בטעינת ההזמנות (${res.status}).`);
      }
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 0);
      setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : 0);
    } catch (err) {
      setError(err.message || 'אירעה שגיאה לא ידועה.');
      setItems([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pageNumber]);

  const fetchAppliedJobIds = useCallback(async () => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      const res = await fetch('/api/Applications/my?pageNumber=1&pageSize=100', { headers });
      if (!res.ok) return;
      const data = await res.json();
      const ids = new Set(
        (Array.isArray(data?.items) ? data.items : [])
          .map((item) => item.jobId)
          .filter((id) => typeof id === 'number'),
      );
      setAppliedJobIds(ids);
    } catch {
      // Best-effort: if we fail we simply show the apply button on every invitation.
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  useEffect(() => {
    fetchAppliedJobIds();
  }, [fetchAppliedJobIds]);

  const handleMarkViewed = async (invitationId) => {
    setMarkingId(invitationId);
    try {
      const res = await fetch(`/api/Invitations/${invitationId}/view`, {
        method: 'PATCH',
        headers: getAuthHeader(),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.invitationId === invitationId ? { ...item, isViewedByStudent: true } : item,
          ),
        );
      }
    } catch {
      // Intentionally silent: the banner already surfaces any listing errors; this is a best-effort update.
    } finally {
      setMarkingId(null);
    }
  };

  const openApplyDialog = (invitation) => setApplyTarget(invitation);
  const closeApplyDialog = () => setApplyTarget(null);

  const handlePageChange = (_event, value) => {
    setPageNumber(value);
  };

  const newCount = useMemo(() => items.filter((item) => !item.isViewedByStudent).length, [items]);

  const headerSummary = useMemo(() => {
    if (loading) return 'טוען הזמנות...';
    if (totalCount === 0) return 'אין הזמנות פרטיות';
    return `נמצאו ${totalCount} הזמנות`;
  }, [loading, totalCount]);

  return (
    <PageShell>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            משרות שהוצעו לי
          </Typography>
          <Typography variant="body1" color="text.secondary">
            משרות שהמנהלת הזמינה אותך אישית להגיש אליהן מועמדות. הזמנה חדשה מסומנת כלא נצפתה עד שתפתחי אותה, וניתן להגיש מועמדות ישירות מכאן.
          </Typography>
        </Stack>

        <Card sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <MarkEmailUnreadOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {headerSummary}
              </Typography>
            </Stack>
            {newCount > 0 && (
              <Chip
                color="secondary"
                label={`${newCount} חדשות בעמוד זה`}
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
        </Card>

        {error && (
          <Alert severity="warning" variant="outlined">
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 && !error ? (
          <Card sx={{ p: 6 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.main', color: 'text.primary' }}>
                <InboxOutlinedIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                אין כרגע הזמנות פרטיות
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                כאשר המנהלת תזמין אותך אישית למשרה, ההזמנה תופיע כאן עם אפשרות לעבור לעמוד המשרה.
              </Typography>
            </Stack>
          </Card>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => {
              const isNew = !item.isViewedByStudent;
              const jobInitial = (item.jobTitle || '?').trim().charAt(0).toUpperCase();
              const hasApplied = appliedJobIds.has(item.jobId);

              return (
                <Card key={item.invitationId} sx={{ p: { xs: 2, md: 3 } }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                          src={item.jobImageUrl || undefined}
                          alt={item.jobTitle || 'משרה'}
                          sx={{ width: 56, height: 56, bgcolor: 'secondary.main', color: 'text.primary' }}
                        >
                          {jobInitial}
                        </Avatar>
                        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                            {item.jobTitle || 'משרה'}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <EventOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              הוזמנת: {formatDate(item.invitedAt)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Chip
                        icon={isNew ? <MarkEmailUnreadOutlinedIcon /> : <DraftsOutlinedIcon />}
                        label={isNew ? 'חדשה' : 'נצפתה'}
                        color={isNew ? 'warning' : 'default'}
                        variant={isNew ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, alignSelf: { xs: 'flex-start', md: 'center' } }}
                      />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                      {hasApplied ? (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          disabled
                          startIcon={<CheckCircleOutlineOutlinedIcon />}
                        >
                          המועמדות הוגשה
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => openApplyDialog(item)}
                          startIcon={<SendOutlinedIcon />}
                        >
                          הגשת מועמדות
                        </Button>
                      )}

                      {item.jobWebsiteUrl && (
                        <Button
                          component={MuiLink}
                          href={item.jobWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="text"
                          size="small"
                          startIcon={<OpenInNewOutlinedIcon />}
                        >
                          לאתר המשרה
                        </Button>
                      )}
                      {isNew && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleMarkViewed(item.invitationId)}
                          disabled={markingId === item.invitationId}
                          startIcon={<VisibilityOutlinedIcon />}
                        >
                          סימון כנצפתה
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
            <Pagination
              count={totalPages}
              page={pageNumber}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Stack>

      {/*
        Placeholder dialog: opens when the student clicks "הגשת מועמדות".
        The actual application form will be implemented by another team and
        should be plugged in here (receives `applyTarget` with the chosen invitation).
      */}
      <Dialog
        open={Boolean(applyTarget)}
        onClose={closeApplyDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          הגשת מועמדות{applyTarget ? ` - ${applyTarget.jobTitle}` : ''}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            טופס הגשת המועמדות יוטמע כאן על ידי צוות אחר.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeApplyDialog} color="inherit">
            סגירה
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
