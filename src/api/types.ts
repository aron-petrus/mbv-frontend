export type AuthUser = {
  id: string;
  email: string;
  name: string;
  document: string;
  phone: string;
  status: 'active' | 'disabled' | 'blocked';
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export type BalanceResponse = {
  userId: string;
  symbol: string;
  network: string;
  balanceBaseUnits: string;
  reservedBaseUnits?: string;
  availableBaseUnits: string;
  vault: null | {
    vaultId: string;
    address: string | null;
  };
};

export type QuotePayload = {
  brlAmount?: string;
  tokenAmount?: string;
};

export type QuoteResponse = {
  symbol: string;
  network: string;
  networkGroup: string;
  contractAddress: string;
  decimals: number;
  priceBrlPerToken: string;
  brlAmountCents: number;
  brlAmount: string;
  tokenAmountBaseUnits: string;
  tokenAmount: string;
};

export type PurchaseOrder = {
  id: string;
  userId: string;
  status: string;
  brlAmountCents: number;
  tokenAmountBaseUnits: string;
  priceBrlPerTokenSnapshot: string;
  tokenDecimalsSnapshot: number;
  paymentProviderTransactionId: string | null;
  paymentPixCode: string | null;
  paymentExpiresAt: string | null;
  paidAt: string | null;
  deliveredAt: string | null;
  failureReason: string | null;
  deliveryTxHash: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrdersResponse = {
  items: PurchaseOrder[];
  pagination: {
    limit: number;
    offset: number;
  };
};

export type UpdateUserPayload = {
  name?: string;
  document?: string;
  phone?: string;
};

export type UserAddressResponse = {
  status: 'created' | 'provisioning';
  address: string | null;
};
