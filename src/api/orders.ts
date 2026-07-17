import { apiRequest } from './client';
import { PurchaseOrder, PurchaseOrdersResponse, QuotePayload, QuoteResponse } from './types';

export function quotePurchaseOrder(token: string, input: QuotePayload) {
  return apiRequest<QuoteResponse>('/purchase-orders/quote', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export function createPurchaseOrder(token: string, input: QuotePayload) {
  return apiRequest<PurchaseOrder>('/purchase-orders', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export function getPurchaseOrder(token: string, id: string) {
  return apiRequest<PurchaseOrder>(`/purchase-orders/${id}`, { token });
}

export function listPurchaseOrders(token: string, input: { limit: number; offset: number }) {
  const query = new URLSearchParams({
    limit: String(input.limit),
    offset: String(input.offset),
  });

  return apiRequest<PurchaseOrdersResponse>(`/purchase-orders?${query.toString()}`, { token });
}
