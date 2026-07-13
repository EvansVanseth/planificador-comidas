import { DomainError } from '@/domain/shared/errors/domain-error';

export class TagOrder {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): TagOrder {
    if (!Number.isInteger(value)) {
      throw new DomainError(`El orden debe ser un número entero, pero se recibió ${value}.`);
    }

    if (value < 0) {
      throw new DomainError(`El orden no puede ser menor que 0, pero se recibió ${value}.`);
    }

    return new TagOrder(value);
  }
}
