import { NoIntegerError } from '@/domain/shared/errors/null-type-error';
import { MinRangeError } from '@/domain/shared/errors/ranges-error';

export class CoversNumber {
  readonly value: number;
  static readonly MIN_VALUE = 0;
  private static readonly FIELD_NAME = 'Numero de comensales';

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): CoversNumber {
    if (value < this.MIN_VALUE) {
      throw new MinRangeError(this.FIELD_NAME, this.MIN_VALUE);
    }

    if (!Number.isInteger(value)) {
      throw new NoIntegerError(this.FIELD_NAME);
    }

    return new CoversNumber(value);
  }
}