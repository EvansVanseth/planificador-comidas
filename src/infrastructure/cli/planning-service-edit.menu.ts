import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function modificarServicio(
  container: IContainer,
  userId: string,
  planningId: string,
  ordenDia: number,
  meals: [string, any][],
  momentTags: any[],
  recipes: any[],
) {
  try {
    if (meals.length === 0) {
      console.log('No hay servicios que modificar');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'tagId',
      message: 'Selecciona el servicio a modificar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...meals.map(([tagId, meal]) => {
          const tag = momentTags.find((t: any) => t.id === tagId);
          const tagName = tag ? tag.name : tagId;
          const recipe = meal!.getRecipeId() ? recipes.find((r: any) => r.id === meal!.getRecipeId()) : null;
          const recipeName = recipe ? recipe.name : (meal!.getRecipeId() ? '?' : 'ninguna');
          return { title: `${tagName} — ${meal!.getCovers()} comensales, ${recipeName}`, value: tagId };
        }),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegido?.tagId || elegido.tagId === '__cancel__') return;

    const coversResp = await prompts({
      type: 'number',
      name: 'value',
      message: 'Nuevos comensales:',
      validate: (v: number) => v >= 0 ? true : 'Debe ser un numero positivo',
    }, { onCancel: ON_CANCEL });

    if (coversResp === undefined) return;
    const covers = coversResp.value;

    let recipeId: string | undefined;
    if (covers > 0 && recipes.length > 0) {
      const recipeResp = await prompts({
        type: 'select',
        name: 'id',
        message: 'Nueva receta (opcional):',
        choices: [
          { title: '(ninguna)', value: '' },
          ...recipes.map(r => ({ title: r.name, value: r.id })),
        ],
      }, { onCancel: ON_CANCEL });
      if (recipeResp?.id) recipeId = recipeResp.id;
    }

    container.assignMeal.execute(planningId, ordenDia, elegido.tagId, recipeId ?? '', covers);
    console.log(theme.success('Servicio modificado'));
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(theme.error(error.message));
    }
  }
}
