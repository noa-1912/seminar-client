import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import {
  JobsBoardPage,
  ManageJobApplications,
  MyApplications,
  PersonalArea,
  PrivateInvitations,
} from './components/jobs'
import Home from './pages/Home/Home'
import JobDetailsPage from './pages/Jobs/JobDetailsPage'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import Settings from './pages/Settings/Settings'
import Profiles from './pages/Profiles/Profiles'
import StudentAvailabilityPage from './pages/Scheduling/StudentAvailability/StudentAvailabilityPage.jsx'
import AdminDashboard from './components/admin/AdminDashboard'

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
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-availability" element={<StudentAvailabilityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
