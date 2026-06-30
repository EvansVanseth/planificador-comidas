import { Id } from '@/domain/shared/value-objects/id.vo';

export type PlanningShoppingItemPrimitives = {
  id: string;
  ingredientId: string;
  completed: boolean;
};

export class PlanningShoppingItem {
  private id: Id;
  private ingredientId: Id;
  private completed: boolean;

  private constructor(id: Id, ingredientId: Id, completed: boolean) {
    this.id = id;
    this.ingredientId = ingredientId;
    this.completed = completed;
  }

  public static create(id: string, ingredientId: string, completed = false): PlanningShoppingItem {
    return new PlanningShoppingItem(
      Id.create(id),
      Id.create(ingredientId),
      completed,
    );
  }

  public getId(): string {
    return this.id.value;
  }

  public getIngredientId(): string {
    return this.ingredientId.value;
  }

  public isCompleted(): boolean {
    return this.completed;
  }

  public markAsCompleted(): void {
    this.completed = true;
  }

  public markAsPending(): void {
    this.completed = false;
  }

  public toggle(): void {
    this.completed = !this.completed;
  }

  public toPrimitives(): PlanningShoppingItemPrimitives {
    return {
      id: this.id.value,
      ingredientId: this.ingredientId.value,
      completed: this.completed,
    };
  }

  public static fromPrimitives(data: PlanningShoppingItemPrimitives): PlanningShoppingItem {
    return new PlanningShoppingItem(
      Id.create(data.id),
      Id.create(data.ingredientId),
      data.completed,
    );
  }
}
