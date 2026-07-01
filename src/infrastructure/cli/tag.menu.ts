import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => { throw new AppError('Operacion cancelada por el usuario'); };

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
        { title: 'Editar etiqueta',   value: 'edit' },
        { title: 'Eliminar etiqueta', value: 'delete' },
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
      case 'edit':
        await editarEtiqueta(container);
        break;
      case 'delete':
        await eliminarEtiqueta(container);
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
    ], { onCancel: ON_CANCEL });

    const userId = answers.isSystem ? null : '550e8400-e29b-41d4-a716-446655440000';
    const id = container.createTag.execute(userId, answers.name, answers.dimension);
    console.log(`Etiqueta creada: ${id}`);

  } catch (error) {
    if (error instanceof DomainError) console.log(error.message);
    console.log('\n--- Creacion cancelada ---');
  }
}

async function editarEtiqueta(container: IContainer) {
  try {
    const tags = container.listTags.execute();
    if (tags.length === 0) {
      console.log('No hay etiquetas para editar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la etiqueta a editar:',
      choices: tags.map(t => ({ title: `${t.name} [${t.dimension}]`, value: t.id })),
    }, { onCancel: ON_CANCEL });

    const cambios = await prompts([
      { type: 'text', name: 'name', message: 'Nuevo nombre (dejar vacio para mantener):' },
      {
        type: 'select',
        name: 'dimension',
        message: 'Nueva dimension:',
        choices: [
          { title: '(Sin cambios)',       value: '__skip__' },
          { title: 'Momento del dia',     value: 'MOMENTO_DIA' },
          { title: 'Formato',             value: 'FORMATO' },
          { title: 'Tipo de plato',       value: 'TIPO_PLATO' },
          { title: 'Estilo de vida',      value: 'ESTILOS_VIDA' },
        ]
      },
    ], { onCancel: ON_CANCEL });

    const input: any = { id: seleccion.id };
    if (cambios.name.trim()) input.name = cambios.name.trim();
    if (cambios.dimension !== '__skip__') input.dimension = cambios.dimension;
    container.updateTag.execute(input);
    console.log('Etiqueta actualizada correctamente');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}

async function eliminarEtiqueta(container: IContainer) {
  try {
    const tags = container.listTags.execute();
    if (tags.length === 0) {
      console.log('No hay etiquetas para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la etiqueta a eliminar:',
      choices: tags.map(t => ({ title: `${t.name} [${t.dimension}]`, value: t.id })),
    }, { onCancel: ON_CANCEL });

    container.deleteTag.execute(seleccion.id);
    console.log('Etiqueta eliminada correctamente');

  } catch (error) {
    if (error instanceof AppError) console.log(error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}
