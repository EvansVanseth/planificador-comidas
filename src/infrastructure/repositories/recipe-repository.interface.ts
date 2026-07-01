import { Recipe } from "@/domain/recipes/aggregates/recipe.aggregate"

export interface RecipeRepository {
  findById(id: string): Recipe | null;
  findAll(): Recipe[];
  save(recipe: Recipe): void;
  delete(id: string): void;
}
