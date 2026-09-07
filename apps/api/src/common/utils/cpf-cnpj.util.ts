function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function hasAllSameDigits(value: string): boolean {
  return value.split('').every((digit) => digit === value[0]);
}

function calculateCheckDigit(digits: string, weights: number[]): number {
  const sum = digits
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || hasAllSameDigits(cpf)) return false;

  const firstCheckDigit = calculateCheckDigit(cpf.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondCheckDigit = calculateCheckDigit(cpf.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cpf[9] === String(firstCheckDigit) && cpf[10] === String(secondCheckDigit);
}

export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || hasAllSameDigits(cnpj)) return false;

  const firstCheckDigit = calculateCheckDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondCheckDigit = calculateCheckDigit(
    cnpj.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return cnpj[12] === String(firstCheckDigit) && cnpj[13] === String(secondCheckDigit);
}
