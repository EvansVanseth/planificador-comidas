import { Recipe } from "@/domain/recipes/aggregates/recipe.aggregate"

export interface RecipeRepository {
  findById(id: string): Recipe | null;
  findAll(): Recipe[];
  findAllByUserId(userId: string): Recipe[];
  findByName(name: string): Recipe | null;
  save(recipe: Recipe): void;
  delete(id: string): void;
}
