import { useState } from 'react';
import { AuthResponse, AuthUser } from '../api';

const TOKEN_KEY = 'mbv_payment_token';
const USER_KEY = 'mbv_payment_user';

export function useAuthSession() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? (JSON.parse(saved) as AuthUser) : null;
  });

  function authenticate(auth: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setToken(auth.accessToken);
    setUser(auth.user);
  }

  function updateUser(updatedUser: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  return {
    token,
    user,
    authenticate,
    updateUser,
    logout,
  };
}
