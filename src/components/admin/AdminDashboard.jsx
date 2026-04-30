/**
 * AdminDashboard
 * --------------
 * Top-level manager workspace for jobs and applications.
 *
 * Composition:
 * - Hero section (title, subtitle, primary create action).
 * - KPI statistics cards.
 * - Tabbed content:
 *   - Job management table.
 *   - Applications overview panel.
 * - Create-job dialog with full form.
 *
 * Data:
 * - Uses `getAdminDashboardStats()` for lightweight KPI cards.
 *
 * UX goal:
 * - Keep frequently-used manager actions available from a single entry point.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CreateJobForm from "./CreateJobForm";
import ManagementTable from "./ManagementTable";
import AdminApplicationsPanel from "./AdminApplicationsPanel";
import { getAdminDashboardStats } from "./adminService";
import "./jobsAdmin.css";
import "../../theme/Theme.css";

const defaultStats = {
  totalJobs: 24,
  openJobs: 11,
  placementsCompleted: 8,
  closedJobs: 5,
};

function StatCard({ icon, label, value }) {
  return (
    <Card className="jobs-admin__stat-card" elevation={0}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box className="jobs-admin__stat-icon">{icon}</Box>
          <Box>
            <Typography variant="body2" className="jobs-admin__stat-label">
              {label}
            </Typography>
            <Typography variant="h5" className="jobs-admin__stat-value">
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(defaultStats);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setIsLoadingStats(true);
        setStatsError("");
        const nextStats = await getAdminDashboardStats();
        if (isMounted) {
          setStats(nextStats);
        }
      } catch {
        if (isMounted) {
          setStatsError("לא ניתן לטעון נתונים מהשרת כרגע.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      {
        key: "totalJobs",
        label: "סה\"כ משרות",
        value: stats.totalJobs,
        icon: <WorkOutlineIcon fontSize="small" />,
      },
      {
        key: "openJobs",
        label: "משרות פתוחות",
        value: stats.openJobs,
        icon: <PendingActionsIcon fontSize="small" />,
      },
      {
        key: "placementsCompleted",
        label: "השמות שהושלמו",
        value: stats.placementsCompleted,
        icon: <CheckCircleOutlineIcon fontSize="small" />,
      },
      {
        key: "closedJobs",
        label: "משרות שנסגרו",
        value: stats.closedJobs,
        icon: <HighlightOffIcon fontSize="small" />,
      },
    ],
    [stats]
  );

  return (
    <Box className="jobs-admin">
      <Stack
        className="jobs-admin__hero"
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box>
          <Typography variant="h4" className="jobs-admin__title">
            לוח ניהול מעסיקים
          </Typography>
          <Typography variant="body1" className="jobs-admin__subtitle">
            סקירה מהירה של משרות פעילות והתקדמות בתהליכי השמה.
          </Typography>
        </Box>
        <Button
          variant="contained"
          className="btn btn--primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setIsCreateOpen(true)}
        >
          יצירת משרה חדשה
        </Button>
      </Stack>

      {statsError ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {statsError}
        </Alert>
      ) : null}

      {isLoadingStats ? (
        <Stack alignItems="center" py={4}>
          <CircularProgress size={28} />
        </Stack>
      ) : null}

      <Grid container spacing={2.5} mt={1}>
        {statCards.map((stat) => (
          <Grid key={stat.key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard icon={stat.icon} label={stat.label} value={stat.value} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Tabs
          className="jobs-admin__tabs"
          value={activeTab}
          onChange={(_event, nextValue) => setActiveTab(nextValue)}
          aria-label="admin management tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="ניהול משרות" />
          <Tab label="ניהול מועמדויות" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 ? <ManagementTable /> : <AdminApplicationsPanel />}
      </Box>

      <Dialog
        fullWidth
        maxWidth="md"
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      >
        <DialogTitle className="jobs-admin__dialog-title">יצירת מודעת דרושים חדשה</DialogTitle>
        <DialogContent>
          <CreateJobForm onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
