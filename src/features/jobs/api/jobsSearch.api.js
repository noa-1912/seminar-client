/**
 * API layer for the Jobs Board feature.
 * All requests go through the Vite dev-proxy (/api → backend).
 */

function buildSearchParams({ searchTerm, field, tagId, pageNumber, pageSize }) {
  const params = new URLSearchParams();
  if (searchTerm) params.set('searchTerm', searchTerm);
  if (field)      params.set('field', field);
  if (tagId)      params.set('tagId', String(tagId));
  params.set('pageNumber', String(pageNumber));
  params.set('pageSize',   String(pageSize));
  return params.toString();
}

function authHeaders() {
  const token = window.localStorage.getItem('token') || window.localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /api/jobs/search
 * Returns { items, totalCount, totalPages, pageNumber, pageSize }
 */
export async function searchJobs(filters) {
  const qs = buildSearchParams(filters);
  const res = await fetch(`/api/jobs/search?${qs}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`שגיאה בטעינת המשרות (${res.status})`);
  return res.json();
}

/**
 * GET /api/tags
 * Returns array of { tagId, name }
 */
export async function fetchTags() {
  const res = await fetch('/api/tags', { headers: authHeaders() });
  if (!res.ok) throw new Error(`שגיאה בטעינת התגיות (${res.status})`);
  return res.json();
}
