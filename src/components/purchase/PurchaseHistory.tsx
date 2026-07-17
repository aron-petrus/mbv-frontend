import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { listPurchaseOrders } from '../../api';
import { getPolygonScanTxUrl, shortHash } from '../../utils/explorer';
import { formatBrl } from '../../utils/format';
import { statusLabel } from '../../utils/purchase';

const HISTORY_LIMIT = 5;

type PurchaseHistoryProps = {
  token: string;
};

export function PurchaseHistory({ token }: PurchaseHistoryProps) {
  const [offset, setOffset] = useState(0);
  const historyQuery = useQuery({
    queryKey: ['purchase-orders', token, offset],
    queryFn: () => listPurchaseOrders(token, { limit: HISTORY_LIMIT, offset }),
  });

  const items = historyQuery.data?.items ?? [];

  return (
    <div className="mt-5 border-t border-[#e4e8de] pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#263323]">Histórico de pedidos</h3>
        <span className="text-xs text-[#66715f]">5 por página</span>
      </div>

      {historyQuery.isLoading && <p className="text-sm text-[#66715f]">Carregando...</p>}
      {historyQuery.error && (
        <p className="rounded-md bg-[#fff2ee] px-3 py-2 text-sm text-[#9b321d]">
          {historyQuery.error instanceof Error ? historyQuery.error.message : 'Não foi possível carregar o histórico.'}
        </p>
      )}
      {!historyQuery.isLoading && !historyQuery.error && items.length === 0 && (
        <p className="text-sm text-[#66715f]">Nenhum pedido ainda.</p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-[#e4e8de] bg-[#f9faf6] p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <strong>{formatBrl(item.brlAmountCents / 100)}</strong>
              <span className="text-[#66715f]">{statusLabel(item.status)}</span>
            </div>
            <p className="mt-1 text-xs text-[#66715f]">{new Date(item.createdAt).toLocaleString('pt-BR')}</p>
            {item.deliveryTxHash && (
              <div className="mt-2 rounded-md border border-[#d9e1d1] bg-white p-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#263323]">Transação Polygon</p>
                    <p className="truncate font-mono text-xs text-[#66715f]">{shortHash(item.deliveryTxHash)}</p>
                  </div>
                  <a
                    className="grid h-8 w-8 shrink-0 place-items-center rounded border border-[#cad3c2] text-[#263323] transition hover:bg-[#f4f6f0]"
                    href={getPolygonScanTxUrl(item.deliveryTxHash)}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir no PolygonScan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <a
                  className="flex h-8 items-center justify-center gap-2 rounded border border-[#cad3c2] text-xs font-semibold text-[#263323] transition hover:bg-[#f4f6f0]"
                  href={getPolygonScanTxUrl(item.deliveryTxHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir no PolygonScan
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          className="h-10 rounded-md border border-[#cad3c2] text-sm font-semibold text-[#263323] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={offset === 0 || historyQuery.isFetching}
          onClick={() => setOffset(Math.max(0, offset - HISTORY_LIMIT))}
        >
          Anterior
        </button>
        <button
          className="h-10 rounded-md border border-[#cad3c2] text-sm font-semibold text-[#263323] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={items.length < HISTORY_LIMIT || historyQuery.isFetching}
          onClick={() => setOffset(offset + HISTORY_LIMIT)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
