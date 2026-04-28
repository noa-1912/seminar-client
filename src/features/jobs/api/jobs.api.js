import { apiFetch } from './apiFetch';

/**
 * @param {number|string} jobId
 */
export function getJobById(jobId) {
  return apiFetch(`/api/jobs/${jobId}`);
}
