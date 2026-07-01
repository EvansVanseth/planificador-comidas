import { Ingredient } from "@/domain/ingredients/aggregates/ingredient.aggregate"

export interface IngredientRepository {
  findById(id: string): Ingredient | null;
  findAll(): Ingredient[];
  save(ingredient: Ingredient): void;
  delete(id: string): void;
}
