import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, baseServings, prepTime, preparation, tags, ingredients } = body;

    if (!userId || !name || !tags || !ingredients) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const c = getContainer();
    await c.createRecipe.execute(
      userId,
      name,
      baseServings ?? 4,
      prepTime ?? 30,
      preparation ?? null,
      ingredients,
      tags,
    );

    const cookieStore = await cookies();
    cookieStore.set('toast_queue', JSON.stringify([{ message: 'Receta creada correctamente.', type: 'success' }]), {
      path: '/dashboard',
      maxAge: 10,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al crear la receta';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
