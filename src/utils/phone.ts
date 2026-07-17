export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function normalizeBrazilPhone(value: string) {
  return onlyDigits(value).replace(/^55(?=\d{10,11}$)/, '');
}

export function isValidBrazilPhone(value: string) {
  return /^\d{10,11}$/.test(normalizeBrazilPhone(value));
}

export function maskBrazilPhone(value: string) {
  const digits = normalizeBrazilPhone(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
