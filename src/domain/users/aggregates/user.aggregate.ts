import { Name } from '@/domain/shared/value-objects/name.vo';
import { UserId } from '@/domain/users/value-objects/user-id.vo';
import { DomainError } from '@/domain/shared/errors/domain-error';

const USER_NAME_FIELD = "user name";

export type UserPrimitives = {
  id: string;
  name: string;
  email: string;
};

export class User {
  private id: UserId;
  private name: Name;
  private email: string;

  private constructor(id: UserId, name: Name, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  public static create(id: string, name: string, email: string): User {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail.length === 0) {
      throw new DomainError("El email no puede estar vacío");
    }
    if (!trimmedEmail.includes('@')) {
      throw new DomainError("El email debe contener un @");
    }

    return new User(UserId.create(id), Name.create(USER_NAME_FIELD, name), trimmedEmail);
  }

  public getId(): string {
    return this.id.value;
  }

  public getName(): string {
    return this.name.value;
  }

  public getEmail(): string {
    return this.email;
  }

  public rename(name: string): void {
    this.name = Name.create(USER_NAME_FIELD, name);
  }

  public changeEmail(email: string): void {
    const trimmed = email.trim().toLowerCase();
    if (trimmed.length === 0) {
      throw new DomainError("El email no puede estar vacío");
    }
    if (!trimmed.includes('@')) {
      throw new DomainError("El email debe contener un @");
    }
    this.email = trimmed;
  }

  public toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      name: this.name.value,
      email: this.email,
    };
  }

  public static fromPrimitives(data: UserPrimitives): User {
    return new User(UserId.create(data.id), Name.create(USER_NAME_FIELD, data.name), data.email);
  }
}
