import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Loader2, WalletCards } from 'lucide-react';
import { getOrCreateUserAddress } from '../../api';

type WalletAddressPanelProps = {
  token: string;
};

export function WalletAddressPanel({ token }: WalletAddressPanelProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const addressQuery = useQuery({
    queryKey: ['user-address', token],
    queryFn: () => getOrCreateUserAddress(token),
    enabled: open,
    refetchInterval: (query) => (query.state.data?.status === 'provisioning' ? 3500 : false),
  });

  const address = addressQuery.data?.address;
  const provisioning = addressQuery.isFetching || addressQuery.data?.status === 'provisioning';

  async function copyAddress() {
    if (!address) {
      return;
    }

    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-3">
      <button
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#cad3c2] px-3 text-sm font-semibold text-[#263323] transition hover:bg-[#f4f6f0]"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <WalletCards className="h-4 w-4" />
        {open ? 'Fechar carteira' : 'Mostrar carteira'}
      </button>

      {open && (
        <div className="mt-3 rounded-md border border-[#e4e8de] bg-[#f9faf6] p-4">
          {addressQuery.error && (
            <p className="rounded-md bg-[#fff2ee] px-3 py-2 text-sm text-[#9b321d]">
              {addressQuery.error instanceof Error ? addressQuery.error.message : 'Não foi possível carregar a carteira.'}
            </p>
          )}

          {provisioning && !address && (
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#557241]" />
              <p className="mt-3 font-semibold text-[#263323]">Criando carteira</p>
              <p className="mt-1 text-sm text-[#66715f]">Estamos preparando o endereço. Isso pode levar alguns instantes.</p>
            </div>
          )}

          {address && (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71806b]">Endereço da carteira</p>
              <p className="mt-2 break-all rounded-md border border-[#d9e1d1] bg-white p-3 font-mono text-sm text-[#263323]">
                {address}
              </p>
              <button
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#cad3c2] px-3 text-sm font-semibold text-[#263323] transition hover:bg-[#f4f6f0]"
                type="button"
                onClick={copyAddress}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copiado' : 'Copiar endereço'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
