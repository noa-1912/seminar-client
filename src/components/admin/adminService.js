// In Vite dev, `/api` is proxied to the backend (same origin; fewer CORS issues).
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "/api" : "http://localhost:5243/api");
let devManagerTokenPromise = null;

function getAuthToken() {
  return (
    window.localStorage.getItem("authToken") ||
    window.localStorage.getItem("token") ||
    import.meta.env.VITE_API_TOKEN ||
    ""
  );
}

function buildHeaders(customHeaders = {}) {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
}

async function ensureDevManagerToken() {
  if (!import.meta.env.DEV) {
    return;
  }

  if (!devManagerTokenPromise) {
    devManagerTokenPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/testauth/manager-token`);
      if (!response.ok) {
        throw new Error(`Failed to get dev manager token (${response.status})`);
      }

      const payload = await response.json();
      const token = payload?.token;
      if (!token) {
        throw new Error("Dev manager token payload is missing token.");
      }

      window.localStorage.setItem("authToken", token);
    })().finally(() => {
      devManagerTokenPromise = null;
    });
  }

  await devManagerTokenPromise;
}

async function fetchMultipartJson(url, formData) {
  await ensureDevManagerToken();

  const authHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  let response = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (import.meta.env.DEV && (response.status === 401 || response.status === 403)) {
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("token");
    await ensureDevManagerToken();
    response = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      /* ignore */
    }
    throw new Error(detail.trim() || `העלאה נכשלה (${response.status})`);
  }

  return response.json();
}

async function fetchJson(url, options = {}) {
  await ensureDevManagerToken();

  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (import.meta.env.DEV && (response.status === 401 || response.status === 403)) {
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("token");
    await ensureDevManagerToken();
    response = await fetch(url, {
      ...options,
      headers: buildHeaders(options.headers),
    });
  }

  if (!response.ok) {
    const suffix = response.status === 401 ? " (unauthorized)" : "";
    throw new Error(`Request failed with status ${response.status}${suffix}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function pickArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.Items)) {
    return payload.Items;
  }

  return [];
}

function pickTotalCount(payload) {
  return payload?.totalCount ?? payload?.TotalCount ?? 0;
}

async function getJobsCountByStatus(statuses = []) {
  const params = new URLSearchParams({
    pageNumber: "1",
    pageSize: "1",
    newestFirst: "true",
  });

  statuses.forEach((status) => params.append("statuses", status));

  const data = await fetchJson(`${API_BASE_URL}/jobs?${params.toString()}`);

  return pickTotalCount(data);
}

export async function createJob(payload) {
  return fetchJson(`${API_BASE_URL}/jobs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminDashboardStats() {
  const [totalJobs, openJobs, closedJobs] = await Promise.all([
    getJobsCountByStatus([]),
    getJobsCountByStatus(["Open"]),
    getJobsCountByStatus(["Closed"]),
  ]);

  return {
    totalJobs,
    openJobs,
    closedJobs,
    placementsCompleted: closedJobs,
  };
}

/** API expects JobStatus as numeric enum: Open=0, Closed=1, Pending=2 */
export const JOB_STATUS_API = {
  Open: 0,
  Closed: 1,
  Pending: 2,
};

export function jobStatusStringToApiValue(status) {
  return JOB_STATUS_API[status] ?? 0;
}

export async function getJobById(jobId) {
  return fetchJson(`${API_BASE_URL}/jobs/${jobId}`);
}

export async function getAllTags() {
  const data = await fetchJson(`${API_BASE_URL}/tags`);
  return Array.isArray(data) ? data : pickArray(data);
}

export async function updateJob(jobId, payload) {
  return fetchJson(`${API_BASE_URL}/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** Upload job listing image: POST multipart to /api/files/job-image (manager). Returns URL for jobImageUrl. */
export async function uploadJobImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const data = await fetchMultipartJson(`${API_BASE_URL}/files/job-image`, formData);
  const url = data?.url ?? data?.Url;
  if (!url) {
    throw new Error("תשובת השרת לא כוללת כתובת תמונה.");
  }
  return { url };
}

export async function getManagementJobs() {
  const params = new URLSearchParams({
    pageNumber: "1",
    pageSize: "50",
    newestFirst: "true",
  });

  const jobsPayload = await fetchJson(`${API_BASE_URL}/jobs?${params.toString()}`);
  const jobs = pickArray(jobsPayload);

  const rows = await Promise.all(
    jobs.map(async (job) => {
      const applicationsPayload = await fetchJson(
        `${API_BASE_URL}/applications/job/${job.jobId ?? job.JobId}?pageNumber=1&pageSize=1&newestFirst=true`
      );

      return {
        id: job.jobId ?? job.JobId,
        title: job.title ?? job.Title ?? "",
        jobType: job.jobType ?? job.JobType ?? "",
        company: job.companyName ?? job.CompanyName ?? "",
        status: job.status ?? job.Status ?? "",
        candidates: pickTotalCount(applicationsPayload),
        lastUpdate: job.createdAt ?? job.CreatedAt ?? null,
      };
    })
  );

  return rows;
}
