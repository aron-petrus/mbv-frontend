export function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function normalizeBrazilPhone(value: string) {
  return onlyDigits(value).replace(/^55(?=\d{10,11}$)/, '');
}

export function isValidBrazilPhone(value: string) {
  return /^\d{10,11}$/.test(normalizeBrazilPhone(value));
}
