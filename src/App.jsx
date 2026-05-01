import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import {
  JobDetailsPage,
  JobsBoardPage,
  ManageJobApplications,
  MyApplications,
  PersonalArea,
  PrivateInvitations,
} from './components/team4'
import Home from './components/team6/Home/Home'
import About from './components/team1/marketing/About/About'
import Contact from './components/team1/marketing/Contact/Contact'
import Login from './components/team2/Login/Login'
import Signup from './components/team2/Signup/Signup'
import Settings from './components/team1/Settings/Settings'
import Profiles from './components/team3/Profiles/Profiles'
import StudentAvailabilityPage from './components/team5/availability/StudentAvailabilityPage.jsx'
import CreateInterviewSlots from './components/team5/interviews/CreateInterviewSlots'
import InterviewSlotsList from './components/team5/interviews/InterviewSlotsList'
import ScheduledInterviews from './components/team5/interviews/ScheduledInterviews/ScheduledInterviews'
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
        <Route path="/jobs/:jobId/interview-slots" element={<InterviewSlotsList />} />
        <Route path="/jobs/:jobId/interview-slots/new" element={<CreateInterviewSlots />} />
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
        <Route path="/my-interviews" element={<ScheduledInterviews />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
