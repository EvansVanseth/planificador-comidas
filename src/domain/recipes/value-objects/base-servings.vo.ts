import { NoIntegerError } from '@/domain/shared/errors/null-type-error';
import { MinRangeError } from '@/domain/shared/errors/ranges-error';

export class BaseServings {
  readonly value: number;
  static readonly MIN_VALUE = 1;
  private static readonly FIELD_NAME = 'base servings';

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): BaseServings {
    if (value < this.MIN_VALUE) {
      throw new MinRangeError(this.FIELD_NAME, this.MIN_VALUE);
    }

    if (!Number.isInteger(value)) {
      throw new NoIntegerError(this.FIELD_NAME);
    }

    return new BaseServings(value);
  }
}
