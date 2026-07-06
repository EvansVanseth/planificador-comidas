import { Ingredient } from "@/domain/ingredients/aggregates/ingredient.aggregate"

export interface IngredientRepository {
  findById(id: string): Ingredient | null;
  findAll(): Ingredient[];
  findAllByUserId(userId: string): Ingredient[];
  findByName(name: string): Ingredient | null;
  save(ingredient: Ingredient): void;
  delete(id: string): void;
}
