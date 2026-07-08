import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function agregarServicio(
  container: IContainer,
  userId: string,
  planningId: string,
  ordenDia: number,
  momentTags: any[],
  recipes: any[],
) {
  try {
    if (momentTags.length === 0) {
      console.log('No hay etiquetas de tipo MOMENTO_DIA. Crea una primero.');
      return;
    }

    const tagElegida = await prompts({
      type: 'select',
      name: 'id',
      message: 'Momento del dia:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...momentTags.map(t => ({ title: t.name, value: t.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!tagElegida?.id || tagElegida.id === '__cancel__') return;

    const coversResp = await prompts({
      type: 'number',
      name: 'value',
      message: 'Comensales:',
      validate: (v: number) => v >= 0 ? true : 'Debe ser un numero positivo',
    }, { onCancel: ON_CANCEL });

    if (coversResp === undefined) return;
    const covers = coversResp.value;

    let recipeId: string | undefined;
    if (covers > 0 && recipes.length > 0) {
      const recipeResp = await prompts({
        type: 'select',
        name: 'id',
        message: 'Receta (opcional):',
        choices: [
          { title: '(ninguna)', value: '' },
          ...recipes.map(r => ({ title: r.name, value: r.id })),
        ],
      }, { onCancel: ON_CANCEL });
      if (recipeResp?.id) recipeId = recipeResp.id;
    }

    container.assignMeal.execute(planningId, ordenDia, tagElegida.id, recipeId ?? '', covers);
    console.log(theme.success('Servicio agregado'));
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(theme.error(error.message));
    }
  }
}
