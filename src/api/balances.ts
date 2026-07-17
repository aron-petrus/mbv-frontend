import { apiRequest } from './client';
import { BalanceResponse } from './types';

export function getBalances(token: string) {
  return apiRequest<BalanceResponse>('/users/me/balances', { token });
}
