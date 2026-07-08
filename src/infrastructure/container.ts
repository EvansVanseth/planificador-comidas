// Repository interfaces
import { PlanningRepository } from '@/infrastructure/repositories/planning-repository.interface';
import { TagRepository } from '@/infrastructure/repositories/tag-repository.interface';
import { IngredientRepository } from '@/infrastructure/repositories/ingredient-repository.interface';
import { RecipeRepository } from '@/infrastructure/repositories/recipe-repository.interface';
import { UserRepository } from '@/infrastructure/repositories/user-repository.interface';
//Repository implementations
import { InMemoryPlanningRepository } from './repositories/in-memory-planning.repository';
import { FilePlanningRepository } from './repositories/file-planning.repository';
import { FileTagRepository } from './repositories/file-tag.repository';
import { InMemoryTagRepository } from './repositories/in-memory-tag.repository';
import { InMemoryIngredientRepository } from './repositories/in-memory-ingredient.repository';
import { FileIngredientRepository } from './repositories/file-ingredient.repository';
import { InMemoryRecipeRepository } from './repositories/in-memory-recipe.repository';
import { FileRecipeRepository } from './repositories/file-recipe.repository';
import { InMemoryUserRepository } from './repositories/in-memory-user.repository';
import { FileUserRepository } from './repositories/file-user.repository';
//Use-cases
import { CreatePlanningUseCase } from '@/application/planning/create-planning.use-case';
import { AssignMealUseCase } from '@/application/planning/assign-meal.use-case';
import { AddDayToPlanningUseCase } from '@/application/planning/add-day-to-planning.use-case';
import { RemoveDayFromPlanningUseCase } from '@/application/planning/remove-day-from-planning.use-case';
import { RemoveMealFromDayUseCase } from '@/application/planning/remove-meal-from-day.use-case';
import { SetMealExclusionsUseCase } from '@/application/planning/set-meal-exclusions.use-case';
import { SetMealPreferencesUseCase } from '@/application/planning/set-meal-preferences.use-case';
import { BulkUpdateDaysUseCase } from '@/application/planning/bulk-update-days.use-case';
import { BulkCreateDaysUseCase } from '@/application/planning/bulk-create-days.use-case';
import { BulkRemoveDaysUseCase } from '@/application/planning/bulk-remove-days.use-case';
import { BulkAssignMealUseCase } from '@/application/planning/bulk-assign-meal.use-case';
import { BulkRemoveMealUseCase } from '@/application/planning/bulk-remove-meal.use-case';
import { DuplicatePlanningUseCase } from '@/application/planning/duplicate-planning.use-case';
import { AutoScheduleUseCase } from '@/application/planning/auto-schedule.use-case';
import { GreedyPlanner } from '@/infrastructure/planner/greedy-planner';
import { GetNeededIngredientsUseCase } from '@/application/planning/get-needed-ingredients.use-case';
import { GetShoppingListUseCase } from '@/application/planning/get-shopping-list.use-case';
import { AddPantryItemUseCase } from '@/application/planning/add-pantry-item.use-case';
import { RemovePantryItemUseCase } from '@/application/planning/remove-pantry-item.use-case';
import { MarkPantryItemAvailableUseCase } from '@/application/planning/mark-pantry-item-available.use-case';
import { UpdatePantryItemCoversUseCase } from '@/application/planning/update-pantry-item-covers.use-case';
import { AddShoppingItemUseCase } from '@/application/planning/add-shopping-item.use-case';
import { RemoveShoppingItemUseCase } from '@/application/planning/remove-shopping-item.use-case';
import { ToggleShoppingItemUseCase } from '@/application/planning/toggle-shopping-item.use-case';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
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
import { MergeIngredientsUseCase } from '@/application/ingredients/merge-ingredients.use-case';
import { CreateRecipeUseCase } from '@/application/recipes/create-recipe.use-case';
import { ListRecipesUseCase } from '@/application/recipes/list-recipes.use-case';
import { UpdateRecipeUseCase } from '@/application/recipes/update-recipe.use-case';
import { DeleteRecipeUseCase } from '@/application/recipes/delete-recipe.use-case';
import { AddNewIngredientToRecipeUseCase } from '@/application/recipes/add-new-ingredient-to-recipe.use-case';
import { AddNewTagToRecipeUseCase } from '@/application/recipes/add-new-tag-to-recipe.use-case';
//User use-cases
import { ListUsersUseCase } from '@/application/users/list-users.use-case';
import { CreateUserUseCase } from '@/application/users/create-user.use-case';
import { UpdateUserUseCase } from '@/application/users/update-user.use-case';
import { DeleteUserUseCase } from '@/application/users/delete-user.use-case';

// Init


export type RepositoryType = 'memory' | 'file';

export interface IContainer {
  // Planning
  listPlannings: ListPlanningsUseCase;
  createPlanning: CreatePlanningUseCase;
  updatePlanning: UpdatePlanningUseCase;
  deletePlanning: DeletePlanningUseCase;
  duplicatePlanning: DuplicatePlanningUseCase;
  autoSchedule: AutoScheduleUseCase;
  assignMeal: AssignMealUseCase;
  addDayToPlanning: AddDayToPlanningUseCase;
  removeDayFromPlanning: RemoveDayFromPlanningUseCase;
  removeMealFromDay: RemoveMealFromDayUseCase;
  setMealExclusions: SetMealExclusionsUseCase;
  setMealPreferences: SetMealPreferencesUseCase;
  bulkUpdateDays: BulkUpdateDaysUseCase;
  bulkCreateDays: BulkCreateDaysUseCase;
  bulkRemoveDays: BulkRemoveDaysUseCase;
  bulkAssignMeal: BulkAssignMealUseCase;
  bulkRemoveMeal: BulkRemoveMealUseCase;
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
  mergeIngredients: MergeIngredientsUseCase;
  // Recipes
  listRecipes: ListRecipesUseCase;
  createRecipe: CreateRecipeUseCase;
  updateRecipe: UpdateRecipeUseCase;
  deleteRecipe: DeleteRecipeUseCase;
  addNewIngredientToRecipe: AddNewIngredientToRecipeUseCase;
  addNewTagToRecipe: AddNewTagToRecipeUseCase;
  // Users
  listUsers: ListUsersUseCase;
  createUser: CreateUserUseCase;
  updateUser: UpdateUserUseCase;
  deleteUser: DeleteUserUseCase;
  // Seed helpers
  seedTagsForUser: (userId: string) => void;
  setSystemKey: (tagId: string, systemKey: string) => void;
}

export const createContainer = (mode: RepositoryType = 'memory') => {

  let planningRepository: PlanningRepository;
  let tagRepository: TagRepository;
  let ingredientRepository: IngredientRepository;
  let recipeRepository: RecipeRepository;
  let userRepository: UserRepository;

  switch (mode) {
    case 'file':
      planningRepository = new FilePlanningRepository('planning-data.json');
      tagRepository = new FileTagRepository('tags-db.json');
      ingredientRepository = new FileIngredientRepository('ingredients-db.json');
      recipeRepository = new FileRecipeRepository('recipes-db.json');
      userRepository = new FileUserRepository('users-db.json');
      break;
    case 'memory':
    default:
      planningRepository = new InMemoryPlanningRepository();
      tagRepository = new InMemoryTagRepository();
      ingredientRepository = new InMemoryIngredientRepository();
      recipeRepository = new InMemoryRecipeRepository();
      userRepository = new InMemoryUserRepository();
      break;
  }

  const container: IContainer = {
    // Planning
    listPlannings: new ListPlanningsUseCase(planningRepository),
    createPlanning: new CreatePlanningUseCase(planningRepository),
    updatePlanning: new UpdatePlanningUseCase(planningRepository),
    deletePlanning: new DeletePlanningUseCase(planningRepository),
    duplicatePlanning: new DuplicatePlanningUseCase(planningRepository),
    autoSchedule: new AutoScheduleUseCase(planningRepository, recipeRepository, tagRepository, new GreedyPlanner()),
    assignMeal: new AssignMealUseCase(planningRepository, tagRepository, recipeRepository),
    setMealExclusions: new SetMealExclusionsUseCase(planningRepository, tagRepository),
    setMealPreferences: new SetMealPreferencesUseCase(planningRepository, tagRepository),
    bulkUpdateDays: new BulkUpdateDaysUseCase(planningRepository, tagRepository),
    bulkCreateDays: new BulkCreateDaysUseCase(planningRepository),
    bulkRemoveDays: new BulkRemoveDaysUseCase(planningRepository),
    bulkAssignMeal: new BulkAssignMealUseCase(planningRepository, tagRepository, recipeRepository),
    bulkRemoveMeal: new BulkRemoveMealUseCase(planningRepository),
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
    mergeIngredients: new MergeIngredientsUseCase(ingredientRepository, recipeRepository),
    // Recipes
    listRecipes: new ListRecipesUseCase(recipeRepository),
    createRecipe: new CreateRecipeUseCase(recipeRepository),
    updateRecipe: new UpdateRecipeUseCase(recipeRepository),
    deleteRecipe: new DeleteRecipeUseCase(recipeRepository),
    addNewIngredientToRecipe: new AddNewIngredientToRecipeUseCase(recipeRepository, ingredientRepository),
    addNewTagToRecipe: new AddNewTagToRecipeUseCase(recipeRepository, tagRepository),
    // Users
    listUsers: new ListUsersUseCase(userRepository),
    createUser: new CreateUserUseCase(userRepository),
    updateUser: new UpdateUserUseCase(userRepository),
    deleteUser: new DeleteUserUseCase(userRepository),
    seedTagsForUser: (userId: string) => seedSystemTags(tagRepository, userId),
    setSystemKey: (tagId: string, systemKey: string) => {
      const tag = tagRepository.findById(tagId);
      if (!tag) throw new AppError(`Tag no encontrada: ${tagId}`);
      const migrated = Tag.create(tag.getId(), tag.getUserId(), tag.getName(), tag.getDimension(), true, systemKey);
      tagRepository.save(migrated);
    },
  };

  return container;
};
