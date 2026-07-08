import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function eliminarServicio(container: IContainer, planningId: string, ordenDia: number, meals: [string, any][], allTags: any[]) {
  try {
    if (meals.length === 0) {
      console.log('No hay servicios para eliminar');
      return;
    }

    const elegido = await prompts({
      type: 'select',
      name: 'tagId',
      message: 'Selecciona servicio a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...meals.map(([tagId, meal]) => {
          const tag = allTags.find((t: any) => t.id === tagId);
          const tagName = tag ? tag.name : tagId;
          return { title: `${tagName} — ${meal!.getCovers()} comensales`, value: tagId };
        }),
      ],
    }, { onCancel: ON_CANCEL });

    if (!elegido?.tagId || elegido.tagId === '__cancel__') return;

    container.removeMealFromDay.execute(planningId, ordenDia, elegido.tagId);
    console.log(theme.success('Servicio eliminado'));
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(theme.error(error.message));
    }
  }
}
