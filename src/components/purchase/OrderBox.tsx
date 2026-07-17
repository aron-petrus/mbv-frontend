import { Copy, ExternalLink, Loader2, ReceiptText, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PurchaseOrder } from '../../api';
import { getPolygonScanTxUrl } from '../../utils/explorer';
import { isPurchaseProcessing, statusLabel } from '../../utils/purchase';

type OrderBoxProps = {
  order: PurchaseOrder;
  onCancel?: () => void;
  onStartNew?: () => void;
};

export function OrderBox({ order, onCancel, onStartNew }: OrderBoxProps) {
  const showPixPayment = order.status === 'pending_payment';
  const showProcessing = isPurchaseProcessing(order.status);
  const pixCode = order.paymentPixCode;

  return (
    <div className="mt-4 rounded-md border border-[#d9e1d1] bg-[#fbfcf8] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71806b]">Status</p>
          <p className="font-semibold">{statusLabel(order.status)}</p>
        </div>
        <ReceiptText className="h-5 w-5 text-[#557241]" />
      </div>

      {showPixPayment && (
        pixCode ? (
          <div className="space-y-3">
            <div className="mx-auto grid h-48 w-48 place-items-center rounded-md border border-[#e2e7dc] bg-white p-3">
              <QRCodeSVG value={pixCode} size={168} level="M" includeMargin={false} />
            </div>
            <div className="rounded-md border border-[#e2e7dc] bg-white p-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71806b]">Pix copia e cola</p>
              <p className="mt-2 max-h-28 overflow-auto break-all font-mono text-xs text-[#263323]">{pixCode}</p>
            </div>
            <button
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#cad3c2] px-3 text-sm font-semibold text-[#263323] transition hover:bg-[#f4f6f0]"
              type="button"
              onClick={() => void navigator.clipboard.writeText(pixCode)}
            >
              <Copy className="h-4 w-4 shrink-0" />
              Copiar Pix
            </button>
            {order.paymentExpiresAt && (
              <p className="text-center text-xs text-[#66715f]">
                Expira em {new Date(order.paymentExpiresAt).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-[#d9e1d1] bg-[#f5f8f0] p-4 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#557241]" />
            <p className="mt-3 font-semibold text-[#263323]">Preparando Pix</p>
            <p className="mt-1 text-sm text-[#66715f]">Estamos gerando o código de pagamento.</p>
          </div>
        )
      )}

      {showProcessing && (
        <div className="rounded-md border border-[#d9e1d1] bg-[#f5f8f0] p-4 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#557241]" />
          <p className="mt-3 font-semibold text-[#263323]">Processando pagamento</p>
          <p className="mt-1 text-sm text-[#66715f]">Recebemos a confirmação e estamos entregando seus tokens.</p>
        </div>
      )}

      {order.failureReason && <p className="mt-3 text-sm text-[#9b321d]">{order.failureReason}</p>}

      {order.deliveryTxHash && (
        <div className="mt-3 rounded-md border border-[#d9e1d1] bg-[#f7faf4] p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#557241]">
              <ExternalLink className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#263323]">Transação entregue na Polygon</p>
              <p className="mt-1 text-xs text-[#66715f]">Hash da entrega dos tokens</p>
            </div>
          </div>
          <p className="mt-3 break-all rounded-md border border-[#e2e7dc] bg-white p-3 font-mono text-xs text-[#263323]">
            {order.deliveryTxHash}
          </p>
          <a
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#cad3c2] px-3 text-sm font-semibold text-[#263323] transition hover:bg-[#f4f6f0]"
            href={getPolygonScanTxUrl(order.deliveryTxHash)}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir no PolygonScan
          </a>
        </div>
      )}

      {onCancel && (
        <button
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#cad3c2] px-4 text-sm font-semibold text-[#263323] transition hover:bg-[#f4f6f0]"
          type="button"
          onClick={onCancel}
        >
          Cancelar e editar pedido
        </button>
      )}

      {onStartNew && (
        <button
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#21321d] px-4 text-sm font-semibold text-white transition hover:bg-[#314629]"
          type="button"
          onClick={onStartNew}
        >
          <RefreshCw className="h-4 w-4" />
          Novo pedido
        </button>
      )}
    </div>
  );
}
