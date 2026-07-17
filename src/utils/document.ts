import { onlyDigits } from './phone';

export function normalizeDocument(value: string) {
  return onlyDigits(value).slice(0, 14);
}

export function maskDocument(value: string) {
  const digits = normalizeDocument(value);

  if (digits.length <= 11) {
    return maskCpf(digits);
  }

  return maskCnpj(digits);
}

export function isValidCpfOrCnpj(value: string) {
  const digits = normalizeDocument(value);
  if (digits.length === 11) {
    return isValidCpf(digits);
  }
  if (digits.length === 14) {
    return isValidCnpj(digits);
  }
  return false;
}

function maskCpf(digits: string) {
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function maskCnpj(digits: string) {
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

function isValidCpf(cpf: string) {
  if (/^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const firstDigit = calculateCpfDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateCpfDigit(`${cpf.slice(0, 9)}${firstDigit}`, 11);
  return cpf === `${cpf.slice(0, 9)}${firstDigit}${secondDigit}`;
}

function calculateCpfDigit(base: string, startWeight: number) {
  const sum = base.split('').reduce((acc, digit, index) => acc + Number(digit) * (startWeight - index), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

function isValidCnpj(cnpj: string) {
  if (/^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const firstDigit = calculateCnpjDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateCnpjDigit(`${cnpj.slice(0, 12)}${firstDigit}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj === `${cnpj.slice(0, 12)}${firstDigit}${secondDigit}`;
}

function calculateCnpjDigit(base: string, weights: number[]) {
  const sum = base.split('').reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}
