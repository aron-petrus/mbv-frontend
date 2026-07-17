import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { AuthUser, getBalances } from '../../api';
import { BalanceCard } from './BalanceCard';
import { ProfileEditor } from './ProfileEditor';
import { WalletAddressPanel } from './WalletAddressPanel';

type AccountPanelProps = {
  token: string;
  user: AuthUser | null;
  onLogout: () => void;
  onUserUpdated: (user: AuthUser) => void;
};

export function AccountPanel({ token, user, onLogout, onUserUpdated }: AccountPanelProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const balanceQuery = useQuery({
    queryKey: ['balances', token],
    queryFn: () => getBalances(token),
  });

  return (
    <section className="rounded-lg border border-[#dfe4d8] bg-white p-5 shadow-[0_18px_60px_rgba(23,31,24,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#66715f]">Olá, {user?.name || user?.email}</p>
          <h2 className="text-xl font-semibold">Sua conta</h2>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-md border border-[#dfe4d8] text-[#43513d] transition hover:bg-[#f4f6f0]"
          type="button"
          title="Sair"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <BalanceCard balance={balanceQuery.data} loading={balanceQuery.isLoading} />

      <WalletAddressPanel token={token} />

      <button
        className="mt-4 flex h-10 w-full items-center justify-center rounded-md border border-[#cad3c2] px-3 text-sm font-semibold text-[#263323] transition hover:bg-[#f4f6f0]"
        type="button"
        onClick={() => setProfileOpen((open) => !open)}
      >
        {profileOpen ? 'Fechar edição' : 'Editar usuário'}
      </button>

      {profileOpen && user && <ProfileEditor token={token} user={user} onUserUpdated={onUserUpdated} />}
    </section>
  );
}
