import { DomainError } from '@/domain/shared/errors/domain-error'

export class NullError extends DomainError {
  constructor (field: string) {
    super(`El campo ${field} no puede estar vacío.`);
  }
}

export class NoIntegerError extends DomainError {
  constructor (field: string) {
    super(`El campo ${field} debe ser un entero.`);
  }
}