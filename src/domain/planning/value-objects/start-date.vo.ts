import { DomainError } from '@/domain/shared/errors/domain-error';

export class StartDate {
  readonly value: Date | null;

  private constructor(value: Date | null) {
    this.value = value;
  }

  public static create(value: Date | null | undefined): StartDate {
    if(value === null || value === undefined) {
      return new StartDate(null);
    }

    if(value.getDay() !== 1) {
      throw new DomainError('El día que asignar debe ser lunes');
    }

    return new StartDate(value);
  }

}