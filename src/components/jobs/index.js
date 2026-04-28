// Public API of the "jobs" feature (owned by the jobs team).
// Importing from this barrel hides the internal folder layout from the rest of the app.

// Pages
export { default as ManageJobApplications } from './pages/ManageJobApplications/ManageJobApplications';
export { default as MyApplications }        from './pages/MyApplications/MyApplications';
export { default as PersonalArea }          from './pages/PersonalArea/PersonalArea';
export { default as PrivateInvitations }    from './pages/PrivateInvitations/PrivateInvitations';
export { default as JobsBoardPage }         from './pages/JobsBoard/JobsBoardPage';

// Shared components
export { default as ApplicationStatusChip } from './components/ApplicationStatusChip/ApplicationStatusChip';
export { default as ApplicationsSummary }   from './components/ApplicationsSummary/ApplicationsSummary';
export { default as UnreadInvitationsChip } from './components/UnreadInvitationsChip/UnreadInvitationsChip';
export { default as JobCard }               from './components/JobCard/JobCard';
export { default as JobFilters }            from './components/JobFilters/JobFilters';
export { default as JobList }               from './components/JobList/JobList';

// Hooks
export { useJobsSearch } from '../../features/jobs/hooks/useJobsSearch';
