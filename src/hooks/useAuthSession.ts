import { useCallback, useEffect, useState } from 'react';
import { AuthResponse, AuthUser, logoutSession, refreshSession } from '../api';

const TOKEN_KEY = 'mbv_payment_token';
const REFRESH_TOKEN_KEY = 'mbv_identity_refresh_token';
const EXPIRES_AT_KEY = 'mbv_identity_expires_at';
const USER_KEY = 'mbv_payment_user';
const REFRESH_EARLY_MS = 60_000;

export function useAuthSession() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_TOKEN_KEY));
  const [expiresAt, setExpiresAt] = useState(() => Number(localStorage.getItem(EXPIRES_AT_KEY)) || 0);
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as AuthUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setRefreshToken(null);
    setExpiresAt(0);
    setUser(null);
  }, []);

  const authenticate = useCallback((auth: AuthResponse) => {
    const nextExpiresAt = Date.now() + auth.expiresIn * 1_000;
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
    localStorage.setItem(EXPIRES_AT_KEY, String(nextExpiresAt));
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setToken(auth.accessToken);
    setRefreshToken(auth.refreshToken);
    setExpiresAt(nextExpiresAt);
    setUser(auth.user);
  }, []);

  function updateUser(updatedUser: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  const logout = useCallback(async () => {
    const currentRefreshToken = refreshToken;
    clearSession();
    if (currentRefreshToken) {
      try {
        await logoutSession(currentRefreshToken);
      } catch {
        // The local session is already removed even if the remote token expired.
      }
    }
  }, [clearSession, refreshToken]);

  useEffect(() => {
    if (!token) return;
    if (!refreshToken) {
      clearSession();
      return;
    }

    let cancelled = false;
    const renew = async () => {
      try {
        const refreshed = await refreshSession(refreshToken);
        if (!cancelled) authenticate(refreshed);
      } catch {
        if (!cancelled) clearSession();
      }
    };
    const delay = Math.max(0, expiresAt - Date.now() - REFRESH_EARLY_MS);
    const timer = window.setTimeout(() => void renew(), delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [authenticate, clearSession, expiresAt, refreshToken, token]);

  return {
    token,
    user,
    authenticate,
    updateUser,
    logout,
  };
}
