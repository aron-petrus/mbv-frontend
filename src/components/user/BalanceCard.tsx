import { Wallet } from 'lucide-react';
import { BalanceResponse } from '../../api';
import { formatBaseUnits } from '../../utils/format';

type BalanceCardProps = {
  balance?: BalanceResponse;
  loading: boolean;
};

export function BalanceCard({ balance, loading }: BalanceCardProps) {
  return (
    <div className="rounded-md border border-[#e4e8de] bg-[#f9faf6] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#71806b]">Saldo disponível</p>
          <p className="mt-1 text-2xl font-semibold">{loading ? '...' : formatBaseUnits(balance?.availableBaseUnits)}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[#e8efdf] text-[#38572e]">
          <Wallet className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-2 text-sm text-[#66715f]">
        {balance?.symbol || 'NTR'} · {balance?.network || 'Polygon'}
      </p>
    </div>
  );
}
