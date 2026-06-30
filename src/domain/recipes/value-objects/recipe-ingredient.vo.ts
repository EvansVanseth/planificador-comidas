import { Id } from '@/domain/shared/value-objects/id.vo';

export type RecipeIngredientPrimitives = {
  ingredientId: string;
  quantityNote: string | null;
};

export class RecipeIngredient {
  readonly ingredientId: string;
  readonly quantityNote: string | null;

  private constructor(ingredientId: string, quantityNote: string | null) {
    this.ingredientId = ingredientId;
    this.quantityNote = quantityNote;
    Object.freeze(this);
  }

  public static create(ingredientId: string, quantityNote?: string): RecipeIngredient {
    const id = Id.create(ingredientId);
    return new RecipeIngredient(id.value, quantityNote?.trim() || null);
  }

  public equals(other: RecipeIngredient): boolean {
    return this.ingredientId === other.ingredientId
      && this.quantityNote === other.quantityNote;
  }

  public toPrimitives(): RecipeIngredientPrimitives {
    return {
      ingredientId: this.ingredientId,
      quantityNote: this.quantityNote,
    };
  }

  public static fromPrimitives(data: RecipeIngredientPrimitives): RecipeIngredient {
    return new RecipeIngredient(
      Id.create(data.ingredientId).value,
      data.quantityNote
    );
  }
}
