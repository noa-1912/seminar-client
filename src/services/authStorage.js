const ACCESS_TOKEN_KEY = 'auth.accessToken';
const ACCESS_TOKEN_EXPIRES_KEY = 'auth.accessTokenExpiresAtUtc';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const REFRESH_TOKEN_EXPIRES_KEY = 'auth.refreshTokenExpiresAtUtc';

export function saveAuthSession(session) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(ACCESS_TOKEN_EXPIRES_KEY, session.accessTokenExpiresAtUtc);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  window.localStorage.setItem(REFRESH_TOKEN_EXPIRES_KEY, session.refreshTokenExpiresAtUtc);

  // Backward compatibility for existing API helpers.
  window.localStorage.setItem('token', session.accessToken);
  window.localStorage.setItem('authToken', session.accessToken);
}

export function clearAuthSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_EXPIRES_KEY);
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('authToken');
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || window.localStorage.getItem('token');
}

export function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAuthSession() {
  const accessToken = getAccessToken();
  const accessTokenExpiresAtUtc = window.localStorage.getItem(ACCESS_TOKEN_EXPIRES_KEY);
  const refreshToken = getRefreshToken();
  const refreshTokenExpiresAtUtc = window.localStorage.getItem(REFRESH_TOKEN_EXPIRES_KEY);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    accessTokenExpiresAtUtc,
    refreshToken,
    refreshTokenExpiresAtUtc,
  };
}
