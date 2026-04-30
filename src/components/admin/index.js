/**
 * Admin module public exports.
 *
 * Keeps import sites clean by exposing:
 * - `AdminDashboard` (main entry component).
 * - `CreateJobForm` (standalone form usage).
 * - `adminService` named utilities.
 */
export { default as AdminDashboard } from "./AdminDashboard";
export { default as CreateJobForm } from "./CreateJobForm";
export * from "./adminService";
