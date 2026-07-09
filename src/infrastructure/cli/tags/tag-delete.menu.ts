import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function eliminarEtiqueta(container: IContainer, userId: string) {
  try {
    const tags = container.listTags.execute(userId).filter(t => !t.isSystem);
    if (tags.length === 0) {
      console.log('No hay etiquetas de usuario para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la etiqueta a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...tags.map(t => ({ title: `${t.name} [${t.dimension}]`, value: t.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;

    container.deleteTag.execute(seleccion.id);
    console.log('✓ Etiqueta eliminada correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
