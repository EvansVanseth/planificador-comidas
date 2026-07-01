import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

export async function menuEtiquetas(container: IContainer) {
  let continuar = true;
  while (continuar) {
    const response = await prompts({
      type: 'select',
      name: 'opcion',
      message: 'Etiquetas — ¿Que quieres hacer?',
      choices: [
        { title: 'Listar etiquetas',  value: 'list' },
        { title: 'Crear etiqueta',    value: 'create' },
        { title: 'Volver',            value: 'back' }
      ]
    });

    switch (response.opcion) {
      case 'list':
        listarEtiquetas(container);
        break;
      case 'create':
        await crearEtiqueta(container);
        break;
      case 'back':
        continuar = false;
        break;
    }
  }
}

function listarEtiquetas(container: IContainer) {
  const tags = container.listTags.execute();
  if (tags.length === 0) {
    console.log('No hay etiquetas');
    return;
  }
  console.log('--- Etiquetas ---');
  tags.forEach(t => console.log(`(id: ${t.id}) ${t.name} [${t.dimension}]${t.userId ? '' : ' (sistema)'}`));
}

async function crearEtiqueta(container: IContainer) {
  try {
    const answers = await prompts([
      { type: 'text', name: 'name', message: 'Nombre de la etiqueta:' },
      {
        type: 'select',
        name: 'dimension',
        message: 'Dimension:',
        choices: [
          { title: 'Momento del dia', value: 'MOMENTO_DIA' },
          { title: 'Formato',         value: 'FORMATO' },
          { title: 'Tipo de plato',   value: 'TIPO_PLATO' },
          { title: 'Estilo de vida',  value: 'ESTILOS_VIDA' },
        ]
      },
      { type: 'confirm', name: 'isSystem', message: '¿Es etiqueta del sistema?', initial: true },
    ], {
      onCancel: () => { throw new AppError('Operacion cancelada por el usuario'); }
    });

    const userId = answers.isSystem ? null : '550e8400-e29b-41d4-a716-446655440000';
    const id = container.createTag.execute(userId, answers.name, answers.dimension);
    console.log(`Etiqueta creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError) {
      console.log(error.message);
    }
    console.log('\n--- Creacion cancelada ---');
  }
}
