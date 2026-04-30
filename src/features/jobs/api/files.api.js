import { apiFetch } from './apiFetch';

/**
 * @param {File} file
 */
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiFetch('/api/files/resume', {
    method: 'POST',
    body: formData,
  });

  return {
    ...response,
    url: response?.url ?? response?.Url ?? '',
  };
}
