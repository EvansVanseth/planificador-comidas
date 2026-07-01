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
import { InMemoryRecipeRepository } from './repositories/in-memory-recipe.repository';
//Use-cases
import { CreatePlanningUseCase } from '@/application/planning/create-planning.use-case';
import { AssignMealUseCase } from '@/application/planning/assign-meal.use-case';
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

// Init


export type RepositoryType = 'memory' | 'file';

export interface IContainer {
  // Planning
  listPlannings: ListPlanningsUseCase;
  createPlanning: CreatePlanningUseCase;
  updatePlanning: UpdatePlanningUseCase;
  deletePlanning: DeletePlanningUseCase;
  assignMeal: AssignMealUseCase;
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
}

export const createContainer = (mode: RepositoryType = 'memory', userId?: string) => {

  let planningRepository: PlanningRepository;
  let tagRepository: TagRepository;

  const ingredientRepository: IngredientRepository = new InMemoryIngredientRepository();
  const recipeRepository: RecipeRepository = new InMemoryRecipeRepository();

  switch (mode) {
    case 'file':
      planningRepository = new FilePlanningRepository('planning-data.json');
      tagRepository = new FileTagRepository('tags-db.json');
      break;
    case 'memory':
    default:
      planningRepository = new InMemoryPlanningRepository();
      tagRepository = new InMemoryTagRepository();
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
  }

};
