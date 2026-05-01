/**
 * ManagementTable
 * ---------------
 * Operational jobs table for managers with end-to-end actions.
 *
 * Core capabilities:
 * - List jobs with status and candidate counters.
 * - Search by title/company and filter by job status.
 * - Open read-only job details dialog.
 * - Open edit flow in modal form.
 * - Trigger quick actions (email, close/reopen, delete).
 * - Navigate to per-job applications management.
 *
 * Design intent:
 * - Keep row actions compact but stable (fixed icon-button sizing).
 * - Centralize table refresh after mutations to preserve consistency.
 */
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EditJobForm from "./EditJobForm";
import { fieldLabelHe, jobTypeLabelHe } from "./jobFormConstants";
import { deleteJob, getJobById, getManagementJobs, updateJobStatus } from "./adminService";

/** Maps API JobStatus string to Hebrew chip label */
const statusLabels = {
  Open: "פתוח",
  Pending: "ממתין",
  Closed: "סגור",
};

const statusColors = {
  Open: "success",
  Pending: "warning",
  Closed: "error",
};

function formatDate(dateValue) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function ManagementTable() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  const [actionLoadingByJobId, setActionLoadingByJobId] = useState({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");

  const refreshRows = useCallback(async () => {
    const nextRows = await getManagementJobs();
    setRows(nextRows);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRows() {
      try {
        setIsLoading(true);
        setError("");
        await refreshRows();
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.message || "לא ניתן לטעון את טבלת הניהול כרגע.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRows();
    return () => {
      isMounted = false;
    };
  }, [refreshRows]);

  const handleOpenView = async (jobId) => {
    setViewOpen(true);
    setViewJob(null);
    setViewError("");
    setViewLoading(true);
    try {
      const job = await getJobById(jobId);
      setViewJob(job);
    } catch (e) {
      setViewError(e?.message || "טעינת פרטי המשרה נכשלה.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setViewJob(null);
    setViewError("");
  };

  const handleOpenEdit = (jobId) => {
    setEditJobId(jobId);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditJobId(null);
  };

  const handleEditSaved = async () => {
    handleCloseEdit();
    try {
      await refreshRows();
      setSuccessMessage("המשרה נשמרה בהצלחה.");
    } catch {
      setError("לא ניתן לרענן את הטבלה. רענני את הדף.");
    }
  };

  const handleOpenApplications = (jobId) => {
    navigate(`/jobs/${jobId}/applications`);
  };

  const handleOpenInterviewScheduling = (jobId) => {
    navigate(`/jobs/${jobId}/interview-slots`);
  };

  const setJobActionLoading = (jobId, isLoadingAction) => {
    setActionLoadingByJobId((prev) => ({ ...prev, [jobId]: isLoadingAction }));
  };

  const handleSendEmail = (row) => {
    const subject = encodeURIComponent(`עדכון עבור המשרה: ${row.title}`);
    window.open(`mailto:?subject=${subject}`, "_blank");
  };

  const handleToggleJobStatus = async (row) => {
    const nextStatus = row.status === "Closed" ? "Open" : "Closed";
    setJobActionLoading(row.id, true);
    try {
      await updateJobStatus(row.id, nextStatus);
      await refreshRows();
      setSuccessMessage(
        nextStatus === "Closed" ? "המשרה נסגרה בהצלחה." : "המשרה נפתחה מחדש בהצלחה."
      );
    } catch (e) {
      setError(e?.message || "עדכון סטטוס המשרה נכשל.");
    } finally {
      setJobActionLoading(row.id, false);
    }
  };

  const handleDeleteJob = async (row) => {
    const confirmed = window.confirm(`למחוק את המשרה "${row.title}"?`);
    if (!confirmed) return;

    setJobActionLoading(row.id, true);
    try {
      await deleteJob(row.id);
      await refreshRows();
      setSuccessMessage("המשרה נמחקה בהצלחה.");
    } catch (e) {
      setError(e?.message || "מחיקת המשרה נכשלה.");
    } finally {
      setJobActionLoading(row.id, false);
    }
  };

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const byStatus = statusFilter === "all" || row.status === statusFilter;
      const byQuery =
        !normalizedQuery ||
        String(row.title).toLowerCase().includes(normalizedQuery) ||
        String(row.company).toLowerCase().includes(normalizedQuery);
      return byStatus && byQuery;
    });
  }, [rows, query, statusFilter]);

  return (
    <Box className="jobs-admin__management">
      <Typography variant="h6" className="jobs-admin__management-title">
        טבלת ניהול משרות
      </Typography>

      {error ? <Alert severity="warning">{error}</Alert> : null}

      {isLoading ? (
        <Stack alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Stack>
      ) : null}

      <Paper
        className="jobs-admin__search-bar"
        variant="outlined"
        sx={{
          mb: 1.5,
          p: 1.5,
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexGrow: 1 }}>
          <TextField
            size="small"
            placeholder="חיפוש לפי שם משרה או חברה..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="סטטוס"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">הכל</MenuItem>
            <MenuItem value="Open">פתוח</MenuItem>
            <MenuItem value="Pending">ממתין</MenuItem>
            <MenuItem value="Closed">סגור</MenuItem>
          </TextField>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          מוצגות {filteredRows.length} מתוך {rows.length} משרות
        </Typography>
      </Paper>

      <TableContainer component={Paper} className="jobs-admin__management-table">
        <Table size="small" aria-label="management jobs table" className="jobs-admin__table">
          <TableHead>
            <TableRow>
              <TableCell>כותרת</TableCell>
              <TableCell>חברה</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>מועמדים</TableCell>
              <TableCell>מועד אחרון</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {row.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {jobTypeLabelHe(row.jobType)}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>{row.company}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    color={statusColors[row.status] || "default"}
                    label={statusLabels[row.status] || row.status}
                  />
                </TableCell>

                <TableCell>
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={() => handleOpenApplications(row.id)}
                  >
                    {row.candidates}
                  </Link>
                </TableCell>

                <TableCell>{formatDate(row.lastUpdate)}</TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                    <Box sx={{ width: 18, display: "flex", justifyContent: "center" }}>
                      {actionLoadingByJobId[row.id] ? <CircularProgress size={16} /> : null}
                    </Box>
                    <Tooltip title={row.status !== "Closed" ? "צפייה במשרה (קריאה בלבד)" : "משרה סגורה"}>
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenView(row.id)}
                          aria-label={`צפייה במשרה ${row.title}`}
                          disabled={row.status === "Closed"}
                          className="jobs-admin__action-btn"
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="אימייל">
                      <IconButton
                        size="small"
                        onClick={() => handleSendEmail(row)}
                        aria-label={`אימייל ${row.title}`}
                        disabled={Boolean(actionLoadingByJobId[row.id])}
                        className="jobs-admin__action-btn"
                      >
                        <EmailOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={row.status === "Closed" ? "פתיחה מחדש" : "סגירת משרה"}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleJobStatus(row)}
                        aria-label={row.status === "Closed" ? `פתיחת ${row.title}` : `סגירת ${row.title}`}
                        disabled={Boolean(actionLoadingByJobId[row.id])}
                        className="jobs-admin__action-btn"
                      >
                        {row.status === "Closed" ? (
                          <LockOpenOutlinedIcon fontSize="small" />
                        ) : (
                          <LockOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="עריכה">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(row.id)}
                        aria-label={`עריכת ${row.title}`}
                        disabled={Boolean(actionLoadingByJobId[row.id])}
                        className="jobs-admin__action-btn"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="ניהול מועמדויות">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenApplications(row.id)}
                        aria-label={`ניהול מועמדויות עבור ${row.title}`}
                        disabled={Boolean(actionLoadingByJobId[row.id])}
                        className="jobs-admin__action-btn"
                      >
                        <GroupsOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="תזמון ראיונות">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenInterviewScheduling(row.id)}
                        aria-label={`תזמון ראיונות עבור ${row.title}`}
                        disabled={Boolean(actionLoadingByJobId[row.id])}
                        className="jobs-admin__action-btn"
                      >
                        <EventAvailableOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="מחיקה">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteJob(row)}
                        aria-label={`מחיקת ${row.title}`}
                        disabled={Boolean(actionLoadingByJobId[row.id])}
                        className="jobs-admin__action-btn"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    לא נמצאו משרות לפי הסינון הנוכחי.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={viewOpen} onClose={handleCloseView} fullWidth maxWidth="sm">
        <DialogTitle className="jobs-admin__dialog-title">צפייה במשרה</DialogTitle>
        <DialogContent>
          {viewLoading ? (
            <Stack alignItems="center" py={2}>
              <CircularProgress size={24} />
            </Stack>
          ) : null}
          {viewError ? <Alert severity="error">{viewError}</Alert> : null}
          {viewJob && !viewLoading ? (
            <Stack spacing={1.25} sx={{ pt: 0.5, pb: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {viewJob.title ?? viewJob.Title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {viewJob.companyName ?? viewJob.CompanyName} · {viewJob.location ?? viewJob.Location}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  label={
                    statusLabels[viewJob.status ?? viewJob.Status] ??
                    (viewJob.status ?? viewJob.Status)
                  }
                  color={statusColors[viewJob.status ?? viewJob.Status] || "default"}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={jobTypeLabelHe(viewJob.jobType ?? viewJob.JobType)}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={fieldLabelHe(viewJob.field ?? viewJob.Field)}
                />
              </Stack>
              <Typography variant="body2">
                <strong>תיאור:</strong> {viewJob.description ?? viewJob.Description}
              </Typography>
              <Typography variant="body2">
                <strong>דרישות:</strong> {viewJob.requirements ?? viewJob.Requirements}
              </Typography>
              <Typography variant="body2">
                <strong>ניסיון (שנים):</strong> {viewJob.experience ?? viewJob.Experience}
              </Typography>
              <Typography variant="body2">
                <strong>שכר:</strong>{" "}
                {viewJob.salaryMin != null && viewJob.salaryMax != null
                  ? `${viewJob.salaryMin} – ${viewJob.salaryMax}`
                  : "—"}
              </Typography>
              <Typography variant="body2">
                <strong>מועד אחרון:</strong> {formatDate(viewJob.deadline ?? viewJob.Deadline)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                פורסם: {formatDate(viewJob.createdAt ?? viewJob.CreatedAt)}
              </Typography>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                  תגיות:
                </Typography>
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                  {(viewJob.tags ?? viewJob.Tags ?? []).length > 0 ? (
                    (viewJob.tags ?? viewJob.Tags).map((tag) => (
                      <Chip key={String(tag)} size="small" label={String(tag)} color="secondary" variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      ללא תגיות
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="md">
        <DialogTitle className="jobs-admin__dialog-title">עריכת משרה</DialogTitle>
        <DialogContent>
          <EditJobForm
            open={editOpen}
            jobId={editJobId}
            onSuccess={handleEditSaved}
            onCancel={handleCloseEdit}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
