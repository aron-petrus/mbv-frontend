import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CircleDollarSign, Loader2 } from 'lucide-react';
import { createPurchaseOrder, getPurchaseOrder, quotePurchaseOrder } from '../../api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { isPurchaseFinal, normalizeDecimal } from '../../utils/purchase';
import { TextField } from '../ui/TextField';
import { OrderBox } from './OrderBox';
import { PurchaseHistory } from './PurchaseHistory';
import { QuoteBox } from './QuoteBox';

type AmountMode = 'tokenAmount' | 'brlAmount';

type PurchaseFlowProps = {
  token: string;
};

export function PurchaseFlow({ token }: PurchaseFlowProps) {
  const queryClient = useQueryClient();
  const [amountMode, setAmountMode] = useState<AmountMode>('tokenAmount');
  const [amount, setAmount] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [createError, setCreateError] = useState('');
  const debouncedAmount = useDebouncedValue(amount, 550);
  const normalizedAmount = normalizeDecimal(debouncedAmount);

  const quotePayload = useMemo(
    () => (amountMode === 'tokenAmount' ? { tokenAmount: normalizedAmount } : { brlAmount: normalizedAmount }),
    [amountMode, normalizedAmount],
  );

  const orderQuery = useQuery({
    queryKey: ['purchase-order', token, activeOrderId],
    queryFn: () => getPurchaseOrder(token, activeOrderId!),
    enabled: Boolean(activeOrderId),
    refetchInterval: (query) => (isPurchaseFinal(query.state.data?.status) ? false : 3500),
  });

  const quoteQuery = useQuery({
    queryKey: ['purchase-quote', token, amountMode, normalizedAmount],
    queryFn: () => quotePurchaseOrder(token, quotePayload),
    enabled: Boolean(normalizedAmount) && !activeOrderId,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () => createPurchaseOrder(token, quotePayload),
    onSuccess: (order) => {
      setActiveOrderId(order.id);
      queryClient.setQueryData(['purchase-order', token, order.id], order);
      void queryClient.invalidateQueries({ queryKey: ['purchase-orders', token] });
    },
    onError: (err) => setCreateError(err instanceof Error ? err.message : 'Não foi possível criar o pedido.'),
  });

  const order = orderQuery.data;
  const quote = quoteQuery.data;
  const showPurchaseForm = !activeOrderId;

  useEffect(() => {
    if (order?.status !== 'delivered') {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ['balances', token] });
    void queryClient.invalidateQueries({ queryKey: ['purchase-orders', token] });
  }, [order?.status, queryClient, token]);

  function startNewOrder() {
    setAmount('');
    setActiveOrderId(null);
    setCreateError('');
    void queryClient.invalidateQueries({ queryKey: ['balances', token] });
    void queryClient.invalidateQueries({ queryKey: ['purchase-orders', token] });
  }

  function cancelOrderView() {
    setActiveOrderId(null);
    setCreateError('');
  }

  function handleBuy() {
    setCreateError('');
    createMutation.mutate();
  }

  return (
    <section className="rounded-lg border border-[#dfe4d8] bg-white p-5 shadow-[0_18px_60px_rgba(23,31,24,0.08)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71806b]">Pedido</p>
          <h2 className="text-xl font-semibold">Comprar NTR</h2>
        </div>
        <CircleDollarSign className="h-5 w-5 text-[#557241]" />
      </div>

      {showPurchaseForm && (
        <>
          <div className="mb-3 grid grid-cols-2 rounded-md bg-[#eff2ea] p-1">
            <button
              className={`h-10 rounded text-sm font-medium transition ${amountMode === 'tokenAmount' ? 'bg-white shadow-sm' : 'text-[#66715f]'}`}
              type="button"
              onClick={() => setAmountMode('tokenAmount')}
            >
              Quantidade
            </button>
            <button
              className={`h-10 rounded text-sm font-medium transition ${amountMode === 'brlAmount' ? 'bg-white shadow-sm' : 'text-[#66715f]'}`}
              type="button"
              onClick={() => setAmountMode('brlAmount')}
            >
              Valor em BRL
            </button>
          </div>

          <TextField
            label={amountMode === 'tokenAmount' ? 'Quantidade de NTR' : 'Valor em reais'}
            value={amount}
            onChange={setAmount}
            placeholder={amountMode === 'tokenAmount' ? '100' : '1300,00'}
            inputMode="decimal"
          />
        </>
      )}

      {(quoteQuery.error || createError) && (
        <p className="mt-3 rounded-md bg-[#fff2ee] px-3 py-2 text-sm text-[#9b321d]">
          {createError || (quoteQuery.error instanceof Error ? quoteQuery.error.message : 'Não foi possível cotar.')}
        </p>
      )}

      {showPurchaseForm && (
        <div className="mt-4">
          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#21321d] px-4 text-sm font-semibold text-white transition hover:bg-[#314629] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={createMutation.isPending || quoteQuery.isFetching || !quote}
            onClick={handleBuy}
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Comprar
          </button>
        </div>
      )}

      {showPurchaseForm && quoteQuery.isFetching && (
        <p className="mt-3 flex items-center gap-2 text-sm text-[#66715f]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cotando automaticamente...
        </p>
      )}

      {showPurchaseForm && quote && <QuoteBox quote={quote} />}
      {order && (
        <OrderBox
          order={order}
          onCancel={order.status === 'pending_payment' ? cancelOrderView : undefined}
          onStartNew={order.status === 'delivered' ? startNewOrder : undefined}
        />
      )}
      <PurchaseHistory token={token} />
    </section>
  );
}
