import { Id } from '@/domain/shared/value-objects/id.vo';
import { CoversNumber } from '../value-objects/covers-number.vo';

export type PlanningPantryItemPrimitives = {
  id: string;
  ingredientId: string;
  available: boolean;
  covers: number;
};

export class PlanningPantryItem {
  private id: Id;
  private ingredientId: Id;
  private available: boolean;
  private covers: CoversNumber;

  private constructor(id: Id, ingredientId: Id, available: boolean, covers: CoversNumber) {
    this.id = id;
    this.ingredientId = ingredientId;
    this.available = available;
    this.covers = covers;
  }

  public static create(id: string, ingredientId: string, available = false, covers = 0): PlanningPantryItem {
    return new PlanningPantryItem(
      Id.create(id),
      Id.create(ingredientId),
      available,
      CoversNumber.create(covers),
    );
  }

  public getId(): string {
    return this.id.value;
  }

  public getIngredientId(): string {
    return this.ingredientId.value;
  }

  public isAvailable(): boolean {
    return this.available;
  }

  public getCovers(): number {
    return this.covers.value;
  }

  public markAsAvailable(): void {
    this.available = true;
    this.covers = CoversNumber.create(0);
  }

  public updateCovers(covers: number): void {
    this.available = false;
    this.covers = CoversNumber.create(covers);
  }

  public toPrimitives(): PlanningPantryItemPrimitives {
    return {
      id: this.id.value,
      ingredientId: this.ingredientId.value,
      available: this.available,
      covers: this.covers.value,
    };
  }

  public static fromPrimitives(data: PlanningPantryItemPrimitives): PlanningPantryItem {
    return new PlanningPantryItem(
      Id.create(data.id),
      Id.create(data.ingredientId),
      data.available,
      CoversNumber.create(data.covers),
    );
  }
}
