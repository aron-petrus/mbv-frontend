import { apiRequest } from './client';
import { AuthResponse, AuthUser, UpdateUserPayload } from './types';

const IDENTITY_API_PATH = '/identity/v1';

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>(`${IDENTITY_API_PATH}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(input: { email: string; password: string; name: string; document: string; phone: string }) {
  return apiRequest<AuthResponse>(`${IDENTITY_API_PATH}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function refreshSession(refreshToken: string) {
  return apiRequest<AuthResponse>(`${IDENTITY_API_PATH}/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function logoutSession(refreshToken: string) {
  return apiRequest<{ ok: true }>(`${IDENTITY_API_PATH}/auth/logout`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function getMe(token: string) {
  return apiRequest<AuthUser>(`${IDENTITY_API_PATH}/users/me`, { token });
}

export function updateMe(token: string, input: UpdateUserPayload) {
  return apiRequest<AuthUser>(`${IDENTITY_API_PATH}/users/me`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}
