import { DomainError } from '@/domain/shared/errors/domain-error';
import { Id } from '@/domain/shared/value-objects/id.vo';
import { Name } from '@/domain/shared/value-objects/name.vo';
import { UserId } from '@/domain/users/value-objects/user-id.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

const TAG_NAME_FIELD = 'tag name';

export type TagPrimitives = {
  id: string;
  userId: string | null;
  name: string;
  dimension: TagDimension;
};

export class Tag {
  private id: Id;
  private userId: UserId | null;
  private name: Name;
  private dimension: TagDimension;

  private constructor(id: Id, userId: UserId | null, name: Name, dimension: TagDimension) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.dimension = dimension;
  }

  public static create(id: string, userId: string | null, name: string, dimension: TagDimension): Tag {
    return new Tag(
      Id.create(id),
      userId !== null ? UserId.create(userId) : null,
      Name.create(TAG_NAME_FIELD, name),
      dimension
    );
  }

  public getId(): string {
    return this.id.value;
  }

  public getUserId(): string | null {
    return this.userId?.value ?? null;
  }

  public getName(): string {
    return this.name.value;
  }

  public getDimension(): TagDimension {
    return this.dimension;
  }

  public rename(name: string): void {
    this.name = Name.create(TAG_NAME_FIELD, name);
  }

  public changeDimension(dimension: TagDimension): void {
    this.dimension = dimension;
  }

  public reassignUser(userId: string | null): void {
    this.userId = userId !== null ? UserId.create(userId) : null;
  }

  public toPrimitives(): TagPrimitives {
    return {
      id: this.id.value,
      userId: this.userId?.value ?? null,
      name: this.name.value,
      dimension: this.dimension,
    };
  }

  public static fromPrimitives(data: TagPrimitives): Tag {
    if (!Object.values(TagDimension).includes(data.dimension)) {
      throw new DomainError(`Dimensión de etiqueta inválida: ${data.dimension}`);
    }

    return new Tag(
      Id.create(data.id),
      data.userId !== null ? UserId.create(data.userId) : null,
      Name.create(TAG_NAME_FIELD, data.name),
      data.dimension
    );
  }
}
