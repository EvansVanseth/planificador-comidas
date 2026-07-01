import { DomainError } from '@/domain/shared/errors/domain-error';
import { Id } from '@/domain/shared/value-objects/id.vo';
import { Name } from '@/domain/shared/value-objects/name.vo';
import { UserId } from '@/domain/users/value-objects/user-id.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

const TAG_NAME_FIELD = 'tag name';

export type TagPrimitives = {
  id: string;
  userId: string;
  name: string;
  dimension: TagDimension;
  isSystem: boolean;
};

export class Tag {
  private id: Id;
  private userId: UserId;
  private name: Name;
  private dimension: TagDimension;
  private isSystem: boolean;

  private constructor(id: Id, userId: UserId, name: Name, dimension: TagDimension, isSystem: boolean) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.dimension = dimension;
    this.isSystem = isSystem;
  }

  public static create(id: string, userId: string, name: string, dimension: TagDimension, isSystem: boolean): Tag {
    if (dimension === TagDimension.FORMATO && !isSystem) {
      throw new DomainError('La dimensión FORMATO es exclusiva del sistema');
    }

    return new Tag(
      Id.create(id),
      UserId.create(userId),
      Name.create(TAG_NAME_FIELD, name),
      dimension,
      isSystem,
    );
  }

  public getId(): string {
    return this.id.value;
  }

  public getUserId(): string {
    return this.userId.value;
  }

  public getName(): string {
    return this.name.value;
  }

  public getDimension(): TagDimension {
    return this.dimension;
  }

  public isSystemTag(): boolean {
    return this.isSystem;
  }

  public rename(name: string): void {
    this.name = Name.create(TAG_NAME_FIELD, name);
  }

  public changeDimension(dimension: TagDimension): void {
    if (dimension === TagDimension.FORMATO && !this.isSystem) {
      throw new DomainError('No se puede cambiar una etiqueta de usuario a la dimensión FORMATO');
    }

    this.dimension = dimension;
  }

  public reassignUser(userId: string): void {
    if (this.dimension === TagDimension.FORMATO) {
      throw new DomainError('No se puede asignar un usuario a una etiqueta FORMATO');
    }
    this.userId = UserId.create(userId);
  }

  public toPrimitives(): TagPrimitives {
    return {
      id: this.id.value,
      userId: this.userId.value,
      name: this.name.value,
      dimension: this.dimension,
      isSystem: this.isSystem,
    };
  }

  public static fromPrimitives(data: TagPrimitives): Tag {
    if (!Object.values(TagDimension).includes(data.dimension)) {
      throw new DomainError(`Dimensión de etiqueta inválida: ${data.dimension}`);
    }

    return new Tag(
      Id.create(data.id),
      UserId.create(data.userId),
      Name.create(TAG_NAME_FIELD, data.name),
      data.dimension,
      data.isSystem,
    );
  }
}
