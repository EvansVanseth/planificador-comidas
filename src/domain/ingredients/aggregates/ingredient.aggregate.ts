import { Id } from '@/domain/shared/value-objects/id.vo';
import { Name } from '@/domain/shared/value-objects/name.vo';
import { UserId } from '@/domain/users/value-objects/user-id.vo';

const INGREDIENT_NAME_FIELD = 'ingredient name';

export type IngredientPrimitives = {
  id: string;
  userId: string;
  name: string;
};

export class Ingredient {
  private id: Id;
  private userId: UserId;
  private name: Name;

  private constructor(id: Id, userId: UserId, name: Name) {
    this.id = id;
    this.userId = userId;
    this.name = name;
  }

  public static create(id: string, userId: string, name: string): Ingredient {
    return new Ingredient(
      Id.create(id),
      UserId.create(userId),
      Name.create(INGREDIENT_NAME_FIELD, name)
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

  public rename(name: string): void {
    this.name = Name.create(INGREDIENT_NAME_FIELD, name);
  }

  public toPrimitives(): IngredientPrimitives {
    return {
      id: this.id.value,
      userId: this.userId.value,
      name: this.name.value,
    };
  }

  public static fromPrimitives(data: IngredientPrimitives): Ingredient {
    return new Ingredient(
      Id.create(data.id),
      UserId.create(data.userId),
      Name.create(INGREDIENT_NAME_FIELD, data.name)
    );
  }
}
