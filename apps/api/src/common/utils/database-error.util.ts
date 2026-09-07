const FOREIGN_KEY_VIOLATION = '23503';
const UNIQUE_VIOLATION = '23505';

interface PgDriverError {
  code?: string;
  constraint?: string;
}

function getDriverError(error: unknown): PgDriverError {
  return (error as { driverError?: PgDriverError; code?: string; constraint?: string })?.driverError ?? (error as PgDriverError) ?? {};
}

export function isForeignKeyViolation(error: unknown): boolean {
  return getDriverError(error).code === FOREIGN_KEY_VIOLATION;
}

export function isUniqueViolation(error: unknown): boolean {
  return getDriverError(error).code === UNIQUE_VIOLATION;
}

export function getViolatedConstraint(error: unknown): string | undefined {
  return getDriverError(error).constraint;
}
