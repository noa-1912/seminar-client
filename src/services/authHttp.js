import axios from 'axios';
import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthSession } from './authStorage';

const isDev = import.meta.env.DEV;
let refreshPromise = null;

const authHttp = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

authHttp.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isDev) {
    console.debug('[auth][request]', {
      method: config.method,
      url: `${config.baseURL ?? ''}${config.url ?? ''}`,
      payload: config.data,
    });
  }
  return config;
});

authHttp.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.debug('[auth][response]', {
        status: response.status,
        url: response.config?.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');
    const hasRefreshToken = Boolean(getRefreshToken());

    if (status === 401 && !isRefreshCall && hasRefreshToken && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = authHttp
            .post('/auth/refresh', { refreshToken: getRefreshToken() })
            .then((response) => response.data)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const session = await refreshPromise;
        saveAuthSession({
          accessToken: session.accessToken,
          accessTokenExpiresAtUtc: session.accessTokenExpiresAtUtc,
          refreshToken: session.refreshToken,
          refreshTokenExpiresAtUtc: session.refreshTokenExpiresAtUtc,
        });

        return authHttp.request(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
        return Promise.reject(refreshError);
      }
    }

    if (isDev) {
      console.error('[auth][response-error]', {
        status: error?.response?.status,
        url: error?.config?.url,
        data: error?.response?.data,
      });
    }
    return Promise.reject(error);
  },
);

export default authHttp;
