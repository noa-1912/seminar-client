// Thin wrappers around StudentAvailabilityController.
// Route: api/students/{studentId}/availability

const GATEWAY_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_GATEWAY_URL || 'http://localhost:7000');

async function request(path, options = {}) {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`StudentAvailability API ${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) return null;
  // CreatedAtAction returns a body; GET/PUT return JSON; bulk/day return 204.
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function base(studentId) {
  return `/api/students/${encodeURIComponent(studentId)}/availability`;
}

/** GET all records for a student. */
export function getAllStudentAvailability(studentId) {
  return request(base(studentId));
}

/** GET records overlapping a single calendar day. */
export function getStudentAvailabilityForDate(studentId, date) {
  const iso = date instanceof Date ? date.toISOString() : date;
  return request(`${base(studentId)}?date=${encodeURIComponent(iso)}`);
}

/**
 * POST a new availability row.
 * dto: { studentId, startTime, endTime, status, reasonStudent }
 */
export function createStudentAvailability(studentId, dto) {
  return request(base(studentId), {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * PUT update an existing row by id.
 * dto: { id, startTime?, endTime?, status?, reasonStudent? }
 */
export function updateStudentAvailability(studentId, id, dto) {
  return request(`${base(studentId)}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

/** DELETE a row by id (scoped to the student). */
export function deleteStudentAvailability(studentId, id) {
  return request(`${base(studentId)}/${id}`, { method: 'DELETE' });
}

/**
 * POST day status: sets all records on the day to `status`,
 * or creates a full-day record if none exist.
 * status: 0 (Available) | 1 (Unavailable)
 */
export function updateWholeDayStatus(studentId, date, status, reason) {
  // Accepts either a Date or a pre-formatted ISO string. When a Date is given we
  // format it as local ISO without a TZ suffix so the server's date.Date lands
  // on the caller's intended calendar day.
  const iso =
    typeof date === 'string'
      ? date
      : (() => {
          const d = date;
          const pad = (n) => String(n).padStart(2, '0');
          return (
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
            `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
          );
        })();
  const params = new URLSearchParams({ status: String(status) });
  if (reason) params.set('reason', reason);
  return request(
    `${base(studentId)}/day/${encodeURIComponent(iso)}/status?${params.toString()}`,
    { method: 'POST' }
  );
}

/**
 * POST bulk: updates every row overlapping [start, end] and fills missing days.
 * dto: { start, end, status, reason? }
 */
export function bulkUpdateStudentAvailability(studentId, dto) {
  return request(`${base(studentId)}/bulk`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
