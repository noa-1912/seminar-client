import { apiFetch } from './apiFetch';

/**
 * @typedef {Object} SubmitApplicationPayload
 * @property {number} jobId
 * @property {string} coverLetter
 * @property {string} resumeUrl
 */

/**
 * @param {SubmitApplicationPayload} payload
 */
export function submitApplication(payload) {
  return apiFetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
