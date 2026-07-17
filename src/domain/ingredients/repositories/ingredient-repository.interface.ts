import { Ingredient } from "@/domain/ingredients/aggregates/ingredient.aggregate"

export interface IngredientRepository {
  findById(id: string): Promise<Ingredient | null>;
  findAll(): Promise<Ingredient[]>;
  findAllByUserId(userId: string): Promise<Ingredient[]>;
  findByName(name: string): Promise<Ingredient | null>;
  save(ingredient: Ingredient): Promise<void>;
  delete(id: string): Promise<void>;
}
