/**
 * Manager jobs table: list, view dialog, edit modal.
 */
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditJobForm from "./EditJobForm";
import { fieldLabelHe, jobTypeLabelHe } from "./jobFormConstants";
import { getJobById, getManagementJobs } from "./adminService";

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

function logAction(actionName, jobId) {
  console.log(`[ManagementTable] ${actionName}`, jobId);
}

export default function ManagementTable() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editJobId, setEditJobId] = useState(null);

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
    } catch {
      setError("לא ניתן לרענן את הטבלה. רענני את הדף.");
    }
  };

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

      <TableContainer component={Paper} className="jobs-admin__management-table">
        <Table size="small" aria-label="management jobs table">
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
            {rows.map((row) => (
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
                    onClick={() => logAction("candidates", row.id)}
                  >
                    {row.candidates}
                  </Link>
                </TableCell>

                <TableCell>{formatDate(row.lastUpdate)}</TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    {row.status !== "Closed" ? (
                      <Tooltip title="צפייה במשרה (קריאה בלבד)">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenView(row.id)}
                          aria-label={`צפייה במשרה ${row.title}`}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}

                    <Tooltip title="אימייל">
                      <IconButton
                        size="small"
                        onClick={() => logAction("email", row.id)}
                        aria-label={`אימייל ${row.title}`}
                      >
                        <EmailOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="עריכה">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(row.id)}
                        aria-label={`עריכת ${row.title}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="מחיקה">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => logAction("delete", row.id)}
                        aria-label={`מחיקת ${row.title}`}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    אין משרות להצגה כרגע.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={viewOpen} onClose={handleCloseView} fullWidth maxWidth="sm">
        <DialogTitle>צפייה במשרה</DialogTitle>
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
              {Array.isArray(viewJob.tags ?? viewJob.Tags) && (viewJob.tags ?? viewJob.Tags).length ? (
                <Typography variant="body2">
                  <strong>תגיות:</strong> {(viewJob.tags ?? viewJob.Tags).join(", ")}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="md">
        <DialogTitle>עריכת משרה</DialogTitle>
        <DialogContent>
          <EditJobForm
            open={editOpen}
            jobId={editJobId}
            onSuccess={handleEditSaved}
            onCancel={handleCloseEdit}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
