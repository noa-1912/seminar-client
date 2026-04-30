/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, login, logout, register as registerUser } from '../services/authApi';
import { clearAuthSession, getAuthSession, getRefreshToken, saveAuthSession } from '../services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const existingSession = getAuthSession();
      if (!existingSession) {
        if (active) {
          setStatus('unauthenticated');
          setUser(null);
        }
        return;
      }

      try {
        const me = await fetchMe();
        if (!active) {
          return;
        }
        setUser(me);
        setStatus('authenticated');
      } catch {
        clearAuthSession();
        if (active) {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async ({ nationalId, password }) => {
    const session = await login({ nationalId, password });
    saveAuthSession({
      accessToken: session.accessToken,
      accessTokenExpiresAtUtc: session.accessTokenExpiresAtUtc,
      refreshToken: session.refreshToken,
      refreshTokenExpiresAtUtc: session.refreshTokenExpiresAtUtc,
    });

    const me = await fetchMe();
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const signUp = useCallback(async ({ nationalId, email, password, role }) => {
    await registerUser({ nationalId, email, password, role });
    return signIn({ nationalId, password });
  }, [signIn]);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch {
      // Intentionally ignore API failures on logout and clear local state.
    } finally {
      clearAuthSession();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      signIn,
      signUp,
      signOut,
    }),
    [user, status, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

