import { Id } from '@/domain/shared/value-objects/id.vo';
import { Name } from '@/domain/shared/value-objects/name.vo';

const USER_NAME_FIELD = "user name";

export class User {
  private id: Id;
  private name: Name;

  private constructor(id: Id, name: Name) {
    this.id = id;
    this.name = name;
  }

  public static create(id: string, name: string): User {
    return new User(Id.create(id), Name.create(USER_NAME_FIELD, name));
  }

  public getId(): string {
    return this.id.value;
  }

  public getName(): string {
    return this.name.value;
  }

  public rename(name: string): void {
    this.name = Name.create(USER_NAME_FIELD, name);
  }

  public toPrimitives(): Record<string, unknown> {
    return {
      id: this.id.value,
      name: this.name.value
    };
  }

  public static fromPrimitives(data: { id: string; name: string }): User {
    return new User(Id.create(data.id), Name.create(USER_NAME_FIELD, data.name));
  }
}
