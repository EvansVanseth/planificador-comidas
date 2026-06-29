import { Name } from '@/domain/shared/value-objects/name.vo';
import { UserId } from '@/domain/users/value-objects/user-id.vo';

const USER_NAME_FIELD = "user name";

export type UserPrimitives = {
  id: string;
  name: string;
};

export class User {
  private id: UserId;
  private name: Name;

  private constructor(id: UserId, name: Name) {
    this.id = id;
    this.name = name;
  }

  public static create(id: string, name: string): User {
    return new User(UserId.create(id), Name.create(USER_NAME_FIELD, name));
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

  public toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      name: this.name.value
    };
  }

  public static fromPrimitives(data: UserPrimitives): User {
    return new User(UserId.create(data.id), Name.create(USER_NAME_FIELD, data.name));
  }
}
