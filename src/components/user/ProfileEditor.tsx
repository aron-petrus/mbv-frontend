import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { AuthUser, updateMe } from '../../api';
import { isValidCpfOrCnpj, maskDocument, normalizeDocument } from '../../utils/document';
import { isValidBrazilPhone, maskBrazilPhone, normalizeBrazilPhone } from '../../utils/phone';
import { TextField } from '../ui/TextField';

type ProfileEditorProps = {
  token: string;
  user: AuthUser;
  onUserUpdated: (user: AuthUser) => void;
};

export function ProfileEditor({ token, user, onUserUpdated }: ProfileEditorProps) {
  const [form, setForm] = useState({
    name: user.name || '',
    document: maskDocument(user.document || ''),
    phone: maskBrazilPhone(user.phone || ''),
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const normalizedPhone = useMemo(() => normalizeBrazilPhone(form.phone), [form.phone]);
  const normalizedDocument = useMemo(() => normalizeDocument(form.document), [form.document]);
  const phoneIsValid = isValidBrazilPhone(form.phone);
  const documentIsValid = isValidCpfOrCnpj(form.document);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateMe(token, {
        name: form.name,
        document: normalizedDocument,
        phone: normalizedPhone,
      }),
    onSuccess: (updatedUser) => {
      onUserUpdated(updatedUser);
      setMessage('Dados atualizados.');
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Não foi possível atualizar seus dados.'),
  });

  useEffect(() => {
    setForm({
      name: user.name || '',
      document: maskDocument(user.document || ''),
      phone: maskBrazilPhone(user.phone || ''),
    });
  }, [user]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!documentIsValid) {
      setError('Informe um CPF ou CNPJ válido.');
      return;
    }

    if (!phoneIsValid) {
      setError('Telefone deve ter DDD+número, com 10 a 11 dígitos.');
      return;
    }

    updateMutation.mutate();
  }

  return (
    <form className="mt-4 space-y-3 border-t border-[#e4e8de] pt-4" onSubmit={submit}>
      <p className="text-sm font-semibold text-[#263323]">Dados do usuário</p>
      <TextField label="Nome" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
      <TextField
        label="CPF ou CNPJ"
        value={form.document}
        onChange={(document) => setForm({ ...form, document: maskDocument(document) })}
        required
        inputMode="numeric"
        placeholder="000.000.000-00"
      />
      <p className={`text-xs ${documentIsValid ? 'text-[#66715f]' : 'text-[#9b321d]'}`}>
        Use um CPF ou CNPJ válido.
      </p>
      <TextField
        label="Telefone"
        value={form.phone}
        onChange={(phone) => setForm({ ...form, phone: maskBrazilPhone(phone) })}
        required
        inputMode="numeric"
        placeholder="(11) 99999-9999"
      />
      <p className={`text-xs ${phoneIsValid ? 'text-[#66715f]' : 'text-[#9b321d]'}`}>
        Use DDD+número, com 10 a 11 dígitos.
      </p>

      {error && <p className="rounded-md bg-[#fff2ee] px-3 py-2 text-sm text-[#9b321d]">{error}</p>}
      {message && <p className="rounded-md bg-[#edf7e8] px-3 py-2 text-sm text-[#38572e]">{message}</p>}

      <button
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#cad3c2] px-4 text-sm font-semibold text-[#263323] transition hover:bg-[#f4f6f0] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={updateMutation.isPending || !phoneIsValid || !documentIsValid}
      >
        {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Salvar dados
      </button>
    </form>
  );
}
