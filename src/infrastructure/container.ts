// Repository interfaces
import { PlanningRepository } from '@/infrastructure/repositories/planning-repository.interface';
import { TagRepository } from '@/infrastructure/repositories/tag-repository.interface';
import { IngredientRepository } from '@/infrastructure/repositories/ingredient-repository.interface';
import { RecipeRepository } from '@/infrastructure/repositories/recipe-repository.interface';
//Repository implementations
import { InMemoryPlanningRepository } from './repositories/in-memory-planning.repository';
import { FilePlanningRepository } from './repositories/file-planning.repository';
import { FileTagRepository } from './repositories/file-tag.repository';
import { InMemoryTagRepository } from './repositories/in-memory-tag.repository';
import { InMemoryIngredientRepository } from './repositories/in-memory-ingredient.repository';
import { FileIngredientRepository } from './repositories/file-ingredient.repository';
import { InMemoryRecipeRepository } from './repositories/in-memory-recipe.repository';
import { FileRecipeRepository } from './repositories/file-recipe.repository';
//Use-cases
import { CreatePlanningUseCase } from '@/application/planning/create-planning.use-case';
import { AssignMealUseCase } from '@/application/planning/assign-meal.use-case';
import { AddDayToPlanningUseCase } from '@/application/planning/add-day-to-planning.use-case';
import { RemoveDayFromPlanningUseCase } from '@/application/planning/remove-day-from-planning.use-case';
import { RemoveMealFromDayUseCase } from '@/application/planning/remove-meal-from-day.use-case';
import { GetNeededIngredientsUseCase } from '@/application/planning/get-needed-ingredients.use-case';
import { GetShoppingListUseCase } from '@/application/planning/get-shopping-list.use-case';
import { AddPantryItemUseCase } from '@/application/planning/add-pantry-item.use-case';
import { RemovePantryItemUseCase } from '@/application/planning/remove-pantry-item.use-case';
import { MarkPantryItemAvailableUseCase } from '@/application/planning/mark-pantry-item-available.use-case';
import { UpdatePantryItemCoversUseCase } from '@/application/planning/update-pantry-item-covers.use-case';
import { AddShoppingItemUseCase } from '@/application/planning/add-shopping-item.use-case';
import { RemoveShoppingItemUseCase } from '@/application/planning/remove-shopping-item.use-case';
import { ToggleShoppingItemUseCase } from '@/application/planning/toggle-shopping-item.use-case';
import { seedSystemTags } from '@/application/tags/seed-system-tags';
import { ListPlanningsUseCase } from '@/application/planning/list-plannings.use-case';
import { UpdatePlanningUseCase } from '@/application/planning/update-planning.use-case';
import { DeletePlanningUseCase } from '@/application/planning/delete-planning.use-case';
import { CreateTagUseCase } from '@/application/tags/create-tag.use-case';
import { ListTagsUseCase } from '@/application/tags/list-tags.use-case';
import { UpdateTagUseCase } from '@/application/tags/update-tag.use-case';
import { DeleteTagUseCase } from '@/application/tags/delete-tag.use-case';
import { CreateIngredientUseCase } from '@/application/ingredients/create-ingredient.use-case';
import { ListIngredientsUseCase } from '@/application/ingredients/list-ingredients.use-case';
import { UpdateIngredientUseCase } from '@/application/ingredients/update-ingredient.use-case';
import { DeleteIngredientUseCase } from '@/application/ingredients/delete-ingredient.use-case';
import { CreateRecipeUseCase } from '@/application/recipes/create-recipe.use-case';
import { ListRecipesUseCase } from '@/application/recipes/list-recipes.use-case';
import { UpdateRecipeUseCase } from '@/application/recipes/update-recipe.use-case';
import { DeleteRecipeUseCase } from '@/application/recipes/delete-recipe.use-case';
import { AddNewIngredientToRecipeUseCase } from '@/application/recipes/add-new-ingredient-to-recipe.use-case';
import { AddNewTagToRecipeUseCase } from '@/application/recipes/add-new-tag-to-recipe.use-case';

// Init


export type RepositoryType = 'memory' | 'file';

export interface IContainer {
  // Planning
  listPlannings: ListPlanningsUseCase;
  createPlanning: CreatePlanningUseCase;
  updatePlanning: UpdatePlanningUseCase;
  deletePlanning: DeletePlanningUseCase;
  assignMeal: AssignMealUseCase;
  addDayToPlanning: AddDayToPlanningUseCase;
  removeDayFromPlanning: RemoveDayFromPlanningUseCase;
  removeMealFromDay: RemoveMealFromDayUseCase;
  getNeededIngredients: GetNeededIngredientsUseCase;
  getShoppingList: GetShoppingListUseCase;
  addPantryItem: AddPantryItemUseCase;
  removePantryItem: RemovePantryItemUseCase;
  markPantryItemAvailable: MarkPantryItemAvailableUseCase;
  updatePantryItemCovers: UpdatePantryItemCoversUseCase;
  addShoppingItem: AddShoppingItemUseCase;
  removeShoppingItem: RemoveShoppingItemUseCase;
  toggleShoppingItem: ToggleShoppingItemUseCase;
  // Tags
  listTags: ListTagsUseCase;
  createTag: CreateTagUseCase;
  updateTag: UpdateTagUseCase;
  deleteTag: DeleteTagUseCase;
  // Ingredients
  listIngredients: ListIngredientsUseCase;
  createIngredient: CreateIngredientUseCase;
  updateIngredient: UpdateIngredientUseCase;
  deleteIngredient: DeleteIngredientUseCase;
  // Recipes
  listRecipes: ListRecipesUseCase;
  createRecipe: CreateRecipeUseCase;
  updateRecipe: UpdateRecipeUseCase;
  deleteRecipe: DeleteRecipeUseCase;
  addNewIngredientToRecipe: AddNewIngredientToRecipeUseCase;
  addNewTagToRecipe: AddNewTagToRecipeUseCase;
}

export const createContainer = (mode: RepositoryType = 'memory', userId?: string) => {

  let planningRepository: PlanningRepository;
  let tagRepository: TagRepository;
  let ingredientRepository: IngredientRepository;
  let recipeRepository: RecipeRepository;

  switch (mode) {
    case 'file':
      planningRepository = new FilePlanningRepository('planning-data.json');
      tagRepository = new FileTagRepository('tags-db.json');
      ingredientRepository = new FileIngredientRepository('ingredients-db.json');
      recipeRepository = new FileRecipeRepository('recipes-db.json');
      break;
    case 'memory':
    default:
      planningRepository = new InMemoryPlanningRepository();
      tagRepository = new InMemoryTagRepository();
      ingredientRepository = new InMemoryIngredientRepository();
      recipeRepository = new InMemoryRecipeRepository();
      break;
  }

  if (userId) {
    seedSystemTags(tagRepository, userId);
  }

  return {
    // Planning
    listPlannings: new ListPlanningsUseCase(planningRepository),
    createPlanning: new CreatePlanningUseCase(planningRepository),
    updatePlanning: new UpdatePlanningUseCase(planningRepository),
    deletePlanning: new DeletePlanningUseCase(planningRepository),
    assignMeal: new AssignMealUseCase(planningRepository, tagRepository),
    addDayToPlanning: new AddDayToPlanningUseCase(planningRepository),
    removeDayFromPlanning: new RemoveDayFromPlanningUseCase(planningRepository),
    removeMealFromDay: new RemoveMealFromDayUseCase(planningRepository),
    getNeededIngredients: new GetNeededIngredientsUseCase(planningRepository, recipeRepository, ingredientRepository),
    getShoppingList: new GetShoppingListUseCase(planningRepository, recipeRepository, ingredientRepository),
    addPantryItem: new AddPantryItemUseCase(planningRepository),
    removePantryItem: new RemovePantryItemUseCase(planningRepository),
    markPantryItemAvailable: new MarkPantryItemAvailableUseCase(planningRepository),
    updatePantryItemCovers: new UpdatePantryItemCoversUseCase(planningRepository),
    addShoppingItem: new AddShoppingItemUseCase(planningRepository),
    removeShoppingItem: new RemoveShoppingItemUseCase(planningRepository),
    toggleShoppingItem: new ToggleShoppingItemUseCase(planningRepository),
    // Tags
    listTags: new ListTagsUseCase(tagRepository),
    createTag: new CreateTagUseCase(tagRepository),
    updateTag: new UpdateTagUseCase(tagRepository),
    deleteTag: new DeleteTagUseCase(tagRepository),
    // Ingredients
    listIngredients: new ListIngredientsUseCase(ingredientRepository),
    createIngredient: new CreateIngredientUseCase(ingredientRepository),
    updateIngredient: new UpdateIngredientUseCase(ingredientRepository),
    deleteIngredient: new DeleteIngredientUseCase(ingredientRepository),
    // Recipes
    listRecipes: new ListRecipesUseCase(recipeRepository),
    createRecipe: new CreateRecipeUseCase(recipeRepository),
    updateRecipe: new UpdateRecipeUseCase(recipeRepository),
    deleteRecipe: new DeleteRecipeUseCase(recipeRepository),
    addNewIngredientToRecipe: new AddNewIngredientToRecipeUseCase(recipeRepository, ingredientRepository),
    addNewTagToRecipe: new AddNewTagToRecipeUseCase(recipeRepository, tagRepository),
  }

};
