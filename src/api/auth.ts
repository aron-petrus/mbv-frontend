import { apiRequest } from './client';
import { AuthResponse, AuthUser, UpdateUserPayload } from './types';

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(input: { email: string; password: string; name: string; document: string; phone: string }) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getMe(token: string) {
  return apiRequest<AuthUser>('/users/me', { token });
}

export function updateMe(token: string, input: UpdateUserPayload) {
  return apiRequest<AuthUser>('/users/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}
