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

  async execute(id: string): Promise<DeleteUserResult> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(`User not found: ${id}`);

    const tags = await this.tagRepository.findAllByUserId(id);
    await Promise.all(tags.map(t => this.tagRepository.delete(t.getId())));

    const ingredients = await this.ingredientRepository.findAllByUserId(id);
    await Promise.all(ingredients.map(i => this.ingredientRepository.delete(i.getId())));

    const recipes = await this.recipeRepository.findAllByUserId(id);
    await Promise.all(recipes.map(r => this.recipeRepository.delete(r.getId())));

    const plannings = await this.planningRepository.findAllByUserId(id);
    await Promise.all(plannings.map(p => this.planningRepository.delete(p.getId())));

    await this.userRepository.delete(id);

    return {
      tagsDeleted: tags.length,
      ingredientsDeleted: ingredients.length,
      recipesDeleted: recipes.length,
      planningsDeleted: plannings.length,
    };
  }
}
