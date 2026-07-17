import { Recipe } from "@/domain/recipes/aggregates/recipe.aggregate"

export interface RecipeRepository {
  findById(id: string): Promise<Recipe | null>;
  findAll(): Promise<Recipe[]>;
  findAllByUserId(userId: string): Promise<Recipe[]>;
  findByName(name: string): Promise<Recipe | null>;
  save(recipe: Recipe): Promise<void>;
  delete(id: string): Promise<void>;
}
