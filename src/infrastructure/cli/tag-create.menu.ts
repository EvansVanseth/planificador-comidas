import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function crearEtiqueta(container: IContainer, userId: string) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre de la etiqueta:' },
      {
        type: 'select',
        name: 'dimension',
        message: 'Dimension:',
        choices: [
          { title: '(Cancelar)',       value: '__cancel__' },
          { title: 'Momento del dia',  value: 'MOMENTO_DIA' },
          { title: 'Tipo de plato',    value: 'TIPO_PLATO' },
          { title: 'Estilo de vida',   value: 'ESTILOS_VIDA' },
        ]
      },
    ], { onCancel: ON_CANCEL });

    if (!answers || answers.dimension === '__cancel__') return;
    if (!answers) return;

    const id = container.createTag.execute(userId, answers.name, answers.dimension, false);
    console.log(`Etiqueta creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}
