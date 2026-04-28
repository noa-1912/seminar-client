import { Navigate, Route, Routes } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import Layout from './components/Layout/Layout'
import {
  JobsBoardPage,
  ManageJobApplications,
  MyApplications,
  PersonalArea,
  PrivateInvitations,
} from './components/jobs'
import About from './pages/About/About'
import AdminDashboard from './components/admin/AdminDashboard'
import Home from './pages/Home/Home'
import JobDetailsPage from './pages/Jobs/JobDetailsPage'

function PlaceholderPage({ title }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        העמוד בבניה כרגע.
      </Typography>
    </Box>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/jobs" element={<JobsBoardPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/jobs/:jobId/applications" element={<ManageJobApplications />} />
        <Route path="/personal-area" element={<PersonalArea />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/private-invitations" element={<PrivateInvitations />} />
        <Route path="/profiles" element={<PlaceholderPage title="פרופילים" />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<PlaceholderPage title="צור קשר" />} />
        <Route path="/settings" element={<PlaceholderPage title="הגדרות" />} />
        <Route path="/login" element={<PlaceholderPage title="התחברות" />} />
        <Route path="/signup" element={<PlaceholderPage title="הרשמה" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
