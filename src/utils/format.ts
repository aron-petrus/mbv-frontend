export function formatBrl(value: string | number) {
  const number = typeof value === 'number' ? value : Number(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(number) ? number : 0);
}

export function formatDecimal(value?: string) {
  const number = Number(value || '0');
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 }).format(Number.isFinite(number) ? number : 0);
}

export function formatBaseUnits(value?: string) {
  if (!value) {
    return '0';
  }
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(Number(value) / 10 ** 18);
}
