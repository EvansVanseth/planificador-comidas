import { OutRangeError } from '@/domain/shared/errors/ranges-error';

export class PlannedWeeks {
  readonly value: number;

  private static readonly FIELD_NAME = 'semanas planeadas';
  static readonly MIN_VALUE = 1
  static readonly MAX_VALUE = 12

  private constructor (value: number) {
    this.value = value;
  }

  public static create(value: number): PlannedWeeks {
    if (value < this.MIN_VALUE || value > this.MAX_VALUE) {
      throw new OutRangeError(this.FIELD_NAME, this.MIN_VALUE, this.MAX_VALUE);
    }
    return new PlannedWeeks(value);
  }
}