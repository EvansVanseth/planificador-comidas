import { Id } from '@/domain/shared/value-objects/id.vo';

export class UserId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): UserId {
    const id = Id.create(value);
    return new UserId(id.value);
  }
}
