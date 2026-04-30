const AUTH_TOKEN_KEY = 'authToken';

const STATUS_ERROR_MESSAGES = {
  401: 'ההתחברות פגה או שאינך מחובר. יש להתחבר מחדש.',
  403: 'אין לך הרשאה לבצע פעולה זו.',
  404: 'המשאב המבוקש לא נמצא.',
  409: 'הפעולה לא הושלמה עקב התנגשות בנתונים.',
  500: 'אירעה שגיאה בשרת. נסה שוב מאוחר יותר.',
};

const DEFAULT_ERROR_MESSAGE = 'אירעה שגיאה בלתי צפויה. נסה שוב.';

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
}

function buildErrorMessage(status, payload) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message.trim();
    }

    if (typeof payload.title === 'string' && payload.title.trim()) {
      return payload.title.trim();
    }
  }

  return STATUS_ERROR_MESSAGES[status] ?? DEFAULT_ERROR_MESSAGE;
}

/**
 * @param {string} path
 * @param {RequestInit & { includeAuth?: boolean }} [options]
 */
export async function apiFetch(path, options = {}) {
  const { includeAuth = true, headers, ...restOptions } = options;
  const requestHeaders = new Headers(headers ?? {});
  const hasBody = restOptions.body !== undefined && restOptions.body !== null;
  const isFormData = hasBody && restOptions.body instanceof FormData;

  if (hasBody && !isFormData && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (includeAuth && !requestHeaders.has('Authorization')) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(path, {
    ...restOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const payload = await parseResponseBody(response);
    const error = new Error(buildErrorMessage(response.status, payload));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return parseResponseBody(response);
}
