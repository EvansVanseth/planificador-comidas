import prompts from 'prompts';
import { IContainer } from '../container';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function gestionarExclusiones(
  container: IContainer,
  userId: string,
  planningId: string,
  ordenDia: number,
  meals: [string, any][],
  allTags: any[],
) {
  try {
    if (meals.length === 0) {
      console.log('No hay servicios en este dia');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'tagId',
      message: 'Selecciona el servicio:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...meals.map(([tagId, meal]) => {
          const tag = allTags.find((t: any) => t.id === tagId);
          const tagName = tag ? tag.name : tagId;
          const excls = meal!.getExclusions().length;
          return { title: `${tagName} (${excls} exclusiones)`, value: tagId };
        }),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegido?.tagId || elegido.tagId === '__cancel__') return;
    const momentTagId = elegido.tagId;

    const allUserTags = container.listTags.execute(userId).filter(
      t => t.dimension !== TagDimension.MOMENTO_DIA
    );
    const currentExclusions = meals.find(([id]) => id === momentTagId)?.[1]?.getExclusions() ?? [];

    const seleccion = await prompts({
      type: 'multiselect',
      name: 'tags',
      message: 'Selecciona etiquetas a excluir (ESPACIO para marcar, ENTER para confirmar):',
      choices: allUserTags.map(t => ({
        title: `${t.name} (${t.dimension})`,
        value: t.id,
        selected: currentExclusions.includes(t.id),
      })),
      instructions: false,
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.tags) return;

    container.setMealExclusions.execute(planningId, ordenDia, momentTagId, seleccion.tags);
    console.log(`Exclusiones actualizadas (${seleccion.tags.length} etiquetas)`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
