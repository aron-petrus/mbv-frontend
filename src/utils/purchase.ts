export const finalPurchaseStatuses = new Set(['delivered', 'payment_failed', 'expired', 'refunded', 'delivery_failed']);

export function isPurchaseFinal(status?: string) {
  return Boolean(status && finalPurchaseStatuses.has(status));
}

export function isPurchaseProcessing(status?: string) {
  return status === 'payment_completed' || status === 'provisioning_wallet' || status === 'delivering';
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    created: 'Pedido criado',
    pending_payment: 'Aguardando Pix',
    payment_completed: 'Pagamento recebido',
    provisioning_wallet: 'Preparando carteira',
    delivering: 'Enviando tokens',
    delivered: 'Tokens entregues',
    payment_failed: 'Pagamento falhou',
    expired: 'Pix expirado',
    refunded: 'Reembolsado',
    delivery_failed: 'Falha na entrega',
  };
  return labels[status] || status;
}

export function normalizeDecimal(value: string) {
  return value.trim().replace(',', '.');
}
