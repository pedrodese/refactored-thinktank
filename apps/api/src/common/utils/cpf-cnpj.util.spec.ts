import { isValidCnpj, isValidCpf } from './cpf-cnpj.util.js';

describe('cpf-cnpj.util', () => {
  it('accepts a valid CPF', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
  });

  it('rejects a CPF with all repeated digits', () => {
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('rejects a CPF with a wrong check digit', () => {
    expect(isValidCpf('111.444.777-36')).toBe(false);
  });

  it('accepts a valid CNPJ', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('rejects a CNPJ with a wrong check digit', () => {
    expect(isValidCnpj('11.222.333/0001-82')).toBe(false);
  });
});
