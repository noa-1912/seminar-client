# Admin Module Documentation

This folder contains the manager/admin UI for job lifecycle operations in the seminar client.

## Goals

- Provide a single operational workspace for job and application management.
- Keep all admin API interactions centralized and predictable.
- Maintain stable, professional UI behavior for dense management workflows.

## File Guide

- `AdminDashboard.jsx`  
  Entry view for managers. Renders KPI cards, tabs, and the create-job dialog.

- `ManagementTable.jsx`  
  Main jobs operations table. Supports filtering, read/view, edit, status toggle, delete, and quick navigation to applications.

- `AdminApplicationsPanel.jsx`  
  Aggregated applications-by-job panel used as the second dashboard tab.

- `CreateJobForm.jsx`  
  Form for creating jobs, including private-invitation flow and tag selection.

- `EditJobForm.jsx`  
  Form for updating existing jobs with full payload compatibility.

- `JobImageField.jsx`  
  Shared image input component with upload and direct URL support.

- `adminService.js`  
  API abstraction layer for all admin-side backend communication.

- `jobFormConstants.js`  
  Option lists and enum/label conversion helpers shared by admin forms.

- `jobsAdmin.css`  
  Shared styling system for dashboard, cards, table, tabs, dialogs, and action buttons.

- `index.js`  
  Public module exports (barrel file).

## Integration Notes

- Frontend-only implementation: existing backend endpoints are consumed without backend schema changes.
- In development, token bootstrapping and `/api` proxy behavior are handled in `adminService.js`.
- Components are written to tolerate mixed backend casing (`camelCase` and `PascalCase`) where relevant.

## Maintenance Conventions

- Keep business/API logic in `adminService.js`, not inside UI render code.
- Reuse constants from `jobFormConstants.js` for all job enum rendering and parsing.
- Preserve fixed dimensions for icon actions to avoid visual jitter in dense tables.
- Add concise JSDoc/module comments when adding new admin files or exported functions.
