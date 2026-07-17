import { apiRequest } from './client';
import { UserAddressResponse } from './types';

export function getOrCreateUserAddress(token: string) {
  return apiRequest<UserAddressResponse>('/users/me/address', { token });
}
