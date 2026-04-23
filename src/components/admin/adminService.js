const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5243/api";

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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (!response.ok) {
    const suffix = response.status === 401 ? " (unauthorized)" : "";
    throw new Error(`Request failed with status ${response.status}${suffix}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function isUnauthorizedError(error) {
  return String(error?.message || "").includes("401");
}

async function getJobsCountByStatus(statuses = []) {
  const params = new URLSearchParams({
    pageNumber: "1",
    pageSize: "1",
    newestFirst: "true",
  });

  statuses.forEach((status) => params.append("statuses", status));

  const data = await fetchJson(`${API_BASE_URL}/jobs?${params.toString()}`);

  // Supports both camelCase and PascalCase API naming.
  return data?.totalCount ?? data?.TotalCount ?? 0;
}

export async function createJob(payload) {
  try {
    return await fetchJson(`${API_BASE_URL}/jobs`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return fetchJson(`${API_BASE_URL}/mock/admin/jobs`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }
    throw error;
  }
}

export async function getAdminDashboardStats() {
  try {
    // Backend currently exposes counts through paginated jobs endpoints.
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
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return fetchJson(`${API_BASE_URL}/mock/admin/stats`);
    }
    throw error;
  }
}
