/**
 * AdminApplicationsPanel
 * ----------------------
 * Aggregated "applications by job" view used in the admin dashboard.
 *
 * Responsibilities:
 * - Load manager-visible jobs and candidate counters.
 * - Present lightweight funnel summary (total candidates / jobs with candidates).
 * - Provide a fast CTA that navigates into the full per-job applications workspace.
 *
 * Notes:
 * - This panel is intentionally read-focused and avoids inline mutation actions.
 * - Data source is `getManagementJobs()` from `adminService`.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { getManagementJobs } from "./adminService";
import { jobTypeLabelHe } from "./jobFormConstants";

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

export default function AdminApplicationsPanel() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");
        const data = await getManagementJobs();
        if (!active) return;
        setRows(data);
      } catch (e) {
        if (!active) return;
        setError(e?.message || "לא ניתן לטעון את נתוני המועמדויות כרגע.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const totalCandidates = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.candidates) || 0), 0),
    [rows]
  );

  const jobsWithCandidates = useMemo(
    () => rows.filter((row) => (Number(row.candidates) || 0) > 0).length,
    [rows]
  );

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} className="jobs-admin__panel-card">
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupsOutlinedIcon fontSize="small" color="primary" />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                סה"כ מועמדויות פעילות: {totalCandidates}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {jobsWithCandidates} משרות עם מועמדויות מתוך {rows.length} משרות
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {error ? <Alert severity="warning">{error}</Alert> : null}

      {isLoading ? (
        <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      ) : null}

      <TableContainer component={Paper} className="jobs-admin__management-table">
        <Table size="small" aria-label="applications by jobs table" className="jobs-admin__table">
          <TableHead>
            <TableRow>
              <TableCell>משרה</TableCell>
              <TableCell>חברה</TableCell>
              <TableCell>סוג</TableCell>
              <TableCell>סטטוס משרה</TableCell>
              <TableCell>מועמדויות</TableCell>
              <TableCell align="right">פעולה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.company}</TableCell>
                <TableCell>{jobTypeLabelHe(row.jobType)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={statusColors[row.status] || "default"}
                    label={statusLabels[row.status] || row.status}
                  />
                </TableCell>
                <TableCell>{row.candidates}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={<OpenInNewOutlinedIcon />}
                    onClick={() => navigate(`/jobs/${row.id}/applications`)}
                  >
                    ניהול מועמדויות
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    אין נתונים להצגה כרגע.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
