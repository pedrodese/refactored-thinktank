import { getViolatedConstraint, isForeignKeyViolation, isUniqueViolation } from './database-error.util.js';

describe('isForeignKeyViolation', () => {
  it('detects a foreign key violation nested under driverError (TypeORM QueryFailedError shape)', () => {
    expect(isForeignKeyViolation({ driverError: { code: '23503' } })).toBe(true);
  });

  it('detects a foreign key violation when code is at the top level', () => {
    expect(isForeignKeyViolation({ code: '23503' })).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isForeignKeyViolation(new Error('boom'))).toBe(false);
    expect(isForeignKeyViolation({ driverError: { code: '23505' } })).toBe(false);
  });
});

describe('isUniqueViolation', () => {
  it('detects a unique constraint violation nested under driverError', () => {
    expect(isUniqueViolation({ driverError: { code: '23505' } })).toBe(true);
  });

  it('returns false for unrelated errors', () => {
    expect(isUniqueViolation({ driverError: { code: '23503' } })).toBe(false);
  });
});

describe('getViolatedConstraint', () => {
  it('returns the constraint name from driverError', () => {
    expect(getViolatedConstraint({ driverError: { code: '23505', constraint: 'index_users_on_cpf' } })).toBe(
      'index_users_on_cpf',
    );
  });

  it('returns undefined when there is no constraint info', () => {
    expect(getViolatedConstraint(new Error('boom'))).toBeUndefined();
  });
});
