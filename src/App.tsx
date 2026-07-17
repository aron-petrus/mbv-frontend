import { AuthCard } from './components/auth/AuthCard';
import { BrandHeader } from './components/layout/BrandHeader';
import { PurchaseFlow } from './components/purchase/PurchaseFlow';
import { AccountPanel } from './components/user/AccountPanel';
import { useAuthSession } from './hooks/useAuthSession';

export function App() {
  const session = useAuthSession();

  return (
    <main className="min-h-screen bg-[#f7f8f2] text-[#171f18]">
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col justify-center px-5 py-10">
        <BrandHeader />

        {!session.token ? (
          <AuthCard onAuthenticated={session.authenticate} />
        ) : (
          <div className="space-y-4">
            <AccountPanel token={session.token} user={session.user} onLogout={session.logout} onUserUpdated={session.updateUser} />
            <PurchaseFlow token={session.token} />
          </div>
        )}
      </div>
    </main>
  );
}
