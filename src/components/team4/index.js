// Public API of the "jobs" feature (owned by the jobs team).
// Importing from this barrel hides the internal folder layout from the rest of the app.

// Pages
export { default as JobDetailsPage }       from './JobDetailsPage/JobDetailsPage';
export { default as ManageJobApplications } from './ManageJobApplications/ManageJobApplications';
export { default as MyApplications }        from './MyApplications/MyApplications';
export { default as PersonalArea }          from './PersonalArea/PersonalArea';
export { default as PrivateInvitations }    from './PrivateInvitations/PrivateInvitations';
export { default as JobsBoardPage }         from './JobsBoard/JobsBoardPage';

// Shared components
export { default as ApplicationStatusChip } from './ApplicationStatusChip/ApplicationStatusChip';
export { default as ApplicationsSummary }   from './ApplicationsSummary/ApplicationsSummary';
export { default as UnreadInvitationsChip } from './UnreadInvitationsChip/UnreadInvitationsChip';
export { default as JobCard }               from './JobCard/JobCard';
export { default as JobFilters }            from './JobFilters/JobFilters';
export { default as JobList }               from './JobList/JobList';

// Hooks
export { useJobsSearch } from '../../features/jobs/hooks/useJobsSearch';
