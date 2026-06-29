import { DomainError } from '@/domain/shared/errors/domain-error'

export class OutRangeError extends DomainError {
  constructor (field: string, min: number, max: number) {
    super(`El valor de ${field} está fuera de rango permitido (min/max): [${min}, ${max}].`);
  }
}

export class MinRangeError extends DomainError {
  constructor (field: string, min: number) {
    super(`El valor de ${field} no puede ser menor que [${min}].`);
  }
}

export class MaxRangeError extends DomainError {
  constructor (field: string, max: number) {
    super(`El valor de ${field} no puede ser mayor que [${max}].`);
  }
}