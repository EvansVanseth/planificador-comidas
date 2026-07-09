import { UserRepository } from '../../domain/users/repositories/user-repository.interface';
import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type DeleteUserResult = {
  tagsDeleted: number;
  ingredientsDeleted: number;
  recipesDeleted: number;
  planningsDeleted: number;
};

export class DeleteUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private tagRepository: TagRepository,
    private ingredientRepository: IngredientRepository,
    private recipeRepository: RecipeRepository,
    private planningRepository: PlanningRepository,
  ) {}

  execute(id: string): DeleteUserResult {
    const user = this.userRepository.findById(id);
    if (!user) throw new AppError(`User not found: ${id}`);

    const tags = this.tagRepository.findAllByUserId(id);
    tags.forEach(t => this.tagRepository.delete(t.getId()));

    const ingredients = this.ingredientRepository.findAllByUserId(id);
    ingredients.forEach(i => this.ingredientRepository.delete(i.getId()));

    const recipes = this.recipeRepository.findAllByUserId(id);
    recipes.forEach(r => this.recipeRepository.delete(r.getId()));

    const plannings = this.planningRepository.findAllByUserId(id);
    plannings.forEach(p => this.planningRepository.delete(p.getId()));

    this.userRepository.delete(id);

    return {
      tagsDeleted: tags.length,
      ingredientsDeleted: ingredients.length,
      recipesDeleted: recipes.length,
      planningsDeleted: plannings.length,
    };
  }
}
