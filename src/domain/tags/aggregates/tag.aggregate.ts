import { DomainError } from '@/domain/shared/errors/domain-error';
import { Id } from '@/domain/shared/value-objects/id.vo';
import { Name } from '@/domain/shared/value-objects/name.vo';
import { UserId } from '@/domain/users/value-objects/user-id.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { TagOrder } from '../value-objects/tag-order.vo';

const TAG_NAME_FIELD = 'tag name';

export type TagPrimitives = {
  id: string;
  userId: string;
  name: string;
  dimension: TagDimension;
  isSystem: boolean;
  systemKey?: string | null;
  order?: number;
};

export class Tag {
  private id: Id;
  private userId: UserId;
  private name: Name;
  private dimension: TagDimension;
  private isSystem: boolean;
  private systemKey: string | null;
  private order: TagOrder;

  private constructor(id: Id, userId: UserId, name: Name, dimension: TagDimension, isSystem: boolean, systemKey: string | null, order: TagOrder) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.dimension = dimension;
    this.isSystem = isSystem;
    this.systemKey = systemKey;
    this.order = order;
  }

  public static create(id: string, userId: string, name: string, dimension: TagDimension, isSystem: boolean, systemKey?: string | null, order: number = 0): Tag {
    if (dimension === TagDimension.FORMATO && !isSystem) {
      throw new DomainError('La dimensión FORMATO es exclusiva del sistema');
    }

    return new Tag(
      Id.create(id),
      UserId.create(userId),
      Name.create(TAG_NAME_FIELD, name),
      dimension,
      isSystem,
      systemKey ?? null,
      TagOrder.create(order),
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

  public getSystemKey(): string | null {
    return this.systemKey;
  }

  public getOrder(): number {
    return this.order.value;
  }

  public rename(name: string): void {
    this.name = Name.create(TAG_NAME_FIELD, name);
  }

  public changeDimension(dimension: TagDimension): void {
    if (this.isSystem) {
      throw new DomainError('No se puede cambiar la dimensión de una etiqueta del sistema');
    }

    if (dimension === TagDimension.FORMATO) {
      throw new DomainError('No se puede cambiar una etiqueta de usuario a la dimensión FORMATO');
    }

    this.dimension = dimension;
    if (dimension !== TagDimension.MOMENTO_DIA) {
      this.order = TagOrder.create(0);
    }
  }

  public reassignUser(userId: string): void {
    if (this.dimension === TagDimension.FORMATO) {
      throw new DomainError('No se puede asignar un usuario a una etiqueta FORMATO');
    }
    this.userId = UserId.create(userId);
  }

  public changeOrder(order: number): void {
    this.order = TagOrder.create(order);
  }

  public toPrimitives(): TagPrimitives {
    return {
      id: this.id.value,
      userId: this.userId.value,
      name: this.name.value,
      dimension: this.dimension,
      isSystem: this.isSystem,
      systemKey: this.systemKey,
      order: this.order.value,
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
      data.systemKey ?? null,
      TagOrder.create(data.order ?? 0),
    );
  }
}
