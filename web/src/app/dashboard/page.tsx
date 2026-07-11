import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/login');

  const container = getContainer();
  const users = container.listUsers.execute();
  const user = users.find(u => u.id === userId);
  if (!user) redirect('/login');

  const recipes = container.listRecipes.execute(userId);
  const tags = container.listTags.execute(userId);
  const ingredients = container.listIngredients.execute(userId);
  const plannings = container.listPlannings.execute(userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-900">Planificador de Comidas</h1>
          <span className="text-gray-500 text-sm">{user.name}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          ¡Hola, {user.name}!
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/recipes" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-3xl mb-3">🍳</div>
            <h3 className="font-semibold text-gray-900">Recetas</h3>
            <p className="text-sm text-gray-500 mt-1">{recipes.length} receta(s)</p>
          </Link>

          <Link href="/ingredients" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-3xl mb-3">🥘</div>
            <h3 className="font-semibold text-gray-900">Ingredientes</h3>
            <p className="text-sm text-gray-500 mt-1">{ingredients.length} ingrediente(s)</p>
          </Link>

          <Link href="/tags" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-3xl mb-3">🏷️</div>
            <h3 className="font-semibold text-gray-900">Etiquetas</h3>
            <p className="text-sm text-gray-500 mt-1">{tags.length} etiqueta(s)</p>
          </Link>

          <Link href="/plannings" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900">Planificaciones</h3>
            <p className="text-sm text-gray-500 mt-1">{plannings.length} planificación(es)</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
