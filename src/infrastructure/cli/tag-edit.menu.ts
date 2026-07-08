import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function editarEtiqueta(container: IContainer, userId: string) {
  try {
    const tags = container.listTags.execute(userId);
    if (tags.length === 0) {
      console.log('No hay etiquetas para editar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la etiqueta a editar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...tags.map(t => ({ title: `${t.name} [${t.dimension}]${t.isSystem ? ' (sistema)' : ''}`, value: t.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;

    const selectedTag = tags.find(t => t.id === seleccion.id);
    const isSystemTag = selectedTag?.isSystem ?? false;

    const preguntas: any[] = [
      { type: 'text', name: 'name', message: 'Nuevo nombre (dejar vacio para mantener):' },
    ];

    if (!isSystemTag) {
      preguntas.push({
        type: 'select',
        name: 'dimension',
        message: 'Nueva dimension:',
        choices: [
          { title: '(Sin cambios)',       value: '__skip__' },
          { title: 'Momento del dia',     value: 'MOMENTO_DIA' },
          { title: 'Tipo de plato',       value: 'TIPO_PLATO' },
          { title: 'Estilo de vida',      value: 'ESTILOS_VIDA' },
        ]
      });
    }

    const cambios = await prompts(preguntas, { onCancel: ON_CANCEL });

    if (!cambios) return;

    const input: any = { id: seleccion.id };
    if (cambios.name.trim()) input.name = cambios.name.trim();
    if (!isSystemTag && cambios.dimension !== '__skip__') input.dimension = cambios.dimension;
    container.updateTag.execute(input);
    console.log(theme.success('Etiqueta actualizada correctamente'));

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(theme.error(error.message));
    }
    console.log(theme.header('\n--- Edicion cancelada ---'));
  }
}
