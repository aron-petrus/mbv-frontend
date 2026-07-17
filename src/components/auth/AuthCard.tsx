import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AuthResponse, login, register } from '../../api';
import { isValidCpfOrCnpj, maskDocument, normalizeDocument } from '../../utils/document';
import { isValidBrazilPhone, maskBrazilPhone, normalizeBrazilPhone } from '../../utils/phone';
import { TextField } from '../ui/TextField';

type AuthMode = 'login' | 'register';

type AuthCardProps = {
  onAuthenticated: (auth: AuthResponse) => void;
};

export function AuthCard({ onAuthenticated }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    document: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const documentIsValid = mode === 'login' || isValidCpfOrCnpj(form.document);
  const phoneIsValid = mode === 'login' || isValidBrazilPhone(form.phone);
  const showDocumentError = submitted && mode === 'register' && !documentIsValid;
  const showPhoneError = submitted && mode === 'register' && !phoneIsValid;

  const authMutation = useMutation({
    mutationFn: () =>
      mode === 'login'
        ? login(form.email, form.password)
        : register({
            email: form.email,
            password: form.password,
            name: form.name,
            document: normalizeDocument(form.document),
            phone: normalizeBrazilPhone(form.phone),
          }),
    onSuccess: onAuthenticated,
    onError: (err) => setError(err instanceof Error ? err.message : 'Não foi possível autenticar.'),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError('');

    if (mode === 'register' && !documentIsValid) {
      setError('Informe um CPF ou CNPJ válido.');
      return;
    }

    if (mode === 'register' && !phoneIsValid) {
      setError('Telefone deve ter DDD+número, com 10 a 11 dígitos.');
      return;
    }

    authMutation.mutate();
  }

  return (
    <section className="rounded-lg border border-[#dfe4d8] bg-white p-5 shadow-[0_18px_60px_rgba(23,31,24,0.08)]">
      <div className="mb-5 grid grid-cols-2 rounded-md bg-[#eff2ea] p-1">
        <button
          className={`h-10 rounded text-sm font-medium transition ${mode === 'login' ? 'bg-white shadow-sm' : 'text-[#66715f]'}`}
          type="button"
          onClick={() => setMode('login')}
        >
          Entrar
        </button>
        <button
          className={`h-10 rounded text-sm font-medium transition ${mode === 'register' ? 'bg-white shadow-sm' : 'text-[#66715f]'}`}
          type="button"
          onClick={() => setMode('register')}
        >
          Registrar
        </button>
      </div>

      <form className="space-y-3" onSubmit={submit}>
        {mode === 'register' && (
          <>
            <TextField label="Nome" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
            <TextField
              label="CPF ou CNPJ"
              value={form.document}
              onChange={(document) => {
                setSubmitted(false);
                setError('');
                setForm({ ...form, document: maskDocument(document) });
              }}
              required
              inputMode="numeric"
              placeholder="000.000.000-00"
            />
            {showDocumentError && <p className="text-xs text-[#9b321d]">Use um CPF ou CNPJ válido.</p>}
            <TextField
              label="Telefone"
              value={form.phone}
              onChange={(phone) => {
                setSubmitted(false);
                setError('');
                setForm({ ...form, phone: maskBrazilPhone(phone) });
              }}
              required
              inputMode="numeric"
              placeholder="(11) 99999-9999"
            />
            {showPhoneError && <p className="text-xs text-[#9b321d]">Use DDD+número, com 10 a 11 dígitos.</p>}
          </>
        )}
        <TextField label="E-mail" value={form.email} onChange={(email) => setForm({ ...form, email })} required type="email" />
        <TextField
          label="Senha"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          required
          type="password"
          minLength={8}
        />

        {error && <p className="rounded-md bg-[#fff2ee] px-3 py-2 text-sm text-[#9b321d]">{error}</p>}

        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#21321d] px-4 text-sm font-semibold text-white transition hover:bg-[#314629] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={authMutation.isPending}
        >
          {authMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </section>
  );
}
