import {
  Alert,
  Box,
  Chip,
  CircularProgress,
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
import { useEffect, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { getManagementJobs } from "./adminService";

const statusLabels = {
  Open: "Open",
  Pending: "Pending",
  Closed: "Closed",
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

  useEffect(() => {
    let isMounted = true;

    async function loadRows() {
      try {
        setIsLoading(true);
        setError("");
        const nextRows = await getManagementJobs();
        if (isMounted) {
          setRows(nextRows);
        }
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
  }, []);

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
                      {row.jobType}
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
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => logAction("view", row.id)}
                          aria-label={`View ${row.title}`}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}

                    <Tooltip title="Email">
                      <IconButton
                        size="small"
                        onClick={() => logAction("email", row.id)}
                        aria-label={`Email ${row.title}`}
                      >
                        <EmailOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => logAction("edit", row.id)}
                        aria-label={`Edit ${row.title}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => logAction("delete", row.id)}
                        aria-label={`Delete ${row.title}`}
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
    </Box>
  );
}
