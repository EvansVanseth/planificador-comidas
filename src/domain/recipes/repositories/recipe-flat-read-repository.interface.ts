export type RecipeIngredientFlat = {
  recipeId: string;
  recipeName: string;
  ingredientId: string;
  quantityNote: string | null;
};

export interface RecipeFlatReadRepository {
  getIngredientsByRecipeIds(recipeIds: string[]): Promise<RecipeIngredientFlat[]>;
}
