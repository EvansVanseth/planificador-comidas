import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContainer } from '@/domain-container';
import Link from 'next/link';
import { logout } from './actions';
import { getTodayDayOrder, getDayName, formatDate } from './helpers';
import { GridIcon, RecipeIcon, CalendarIcon, CatalogIcon, LogoutIcon } from './icons';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/login');

  const c = getContainer();
  const users = c.listUsers.execute();
  const user = users.find((u) => u.id === userId);
  if (!user) redirect('/login');

  const recipes = c.listRecipes.execute(userId);
  const tags = c.listTags.execute(userId);
  const plannings = c.listPlannings.execute(userId);
  const activePlanning = plannings.length > 0 ? plannings[0].toPrimitives() : null;

  const tagsById = new Map(tags.map((t) => [t.id, t]));

  let todayMeals: { time: string; timeName: string; recipeName: string | null }[] = [];
  let todayName = '';
  if (activePlanning) {
    const dayOrder = getTodayDayOrder(
      activePlanning.startdate,
      activePlanning.weeks,
    );
    if (dayOrder) {
      todayName = getDayName(dayOrder);
      const day = activePlanning.days.find((d) => d.order === dayOrder);
      if (day) {
        todayMeals = day.services.map((s) => {
          const timeTag = tagsById.get(s.time);
          const recipe = s.recipeId
            ? recipes.find((r) => r.id === s.recipeId)
            : null;
          return {
            time: s.time,
            timeName: timeTag?.name ?? s.time,
            recipeName: recipe?.name ?? null,
          };
        });
      }
    }
  }

  const totalMeals = activePlanning
    ? activePlanning.days.reduce(
        (sum, d) => sum + d.services.filter((s) => s.recipeId).length,
        0,
      )
    : 0;

  const totalCovers = activePlanning
    ? activePlanning.days.reduce(
        (sum, d) =>
          sum + d.services.reduce((s, sv) => s + sv.covers, 0),
        0,
      )
    : 0;

  const pantryCount = activePlanning
    ? activePlanning.pantryItems.filter((p) => p.available).length
    : 0;

  const shoppingPending = activePlanning
    ? activePlanning.shoppingItems.filter((s) => !s.completed).length
    : 0;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-2 px-6">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#009B65"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 5v5a3 3 0 0 0 6 0V5" />
            <path d="M8 5v15" />
            <path d="M19 20V5c-3.5 0-4.5 1.5-4.5 4.5s1 4.5 4.5 4.5" />
          </svg>
          <span className="text-xl font-bold text-[#0a0a0a]">PlanComidas</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          <NavItem
            href="/dashboard"
            label="Panel"
            active
          >
            <GridIcon />
          </NavItem>
          <NavItem href="/recipes" label="Recetas">
            <RecipeIcon />
          </NavItem>
          <NavItem href="/plannings" label="Planificador">
            <CalendarIcon />
          </NavItem>
          <NavItem href="/catalog" label="Catálogo">
            <CatalogIcon />
          </NavItem>
        </nav>

        <div className="border-t border-gray-200 px-4 py-3">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#62748E] transition-colors hover:bg-gray-50"
            >
              <LogoutIcon />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-[#F8FAFC]">
        <div className="mx-auto max-w-[911px] px-6 py-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172B]">Panel</h1>
              <p className="text-sm text-[#45556C]">
                {user.name}
              </p>
            </div>
            <Link
              href="/plannings"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#009966] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M8 3v10" />
                <path d="M3 8h10" />
              </svg>
              Nueva planificación
            </Link>
          </div>

          {/* Cards section */}
          <div className="mb-8 flex gap-6">
            {/* Green card */}
            <div className="flex-1 rounded-xl bg-[#009966] p-8 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              {activePlanning ? (
                <>
                  <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <rect x="1" y="2.5" width="12" height="10" rx="1.5" />
                      <path d="M1 5.5h12" />
                      <path d="M4 1v3" />
                      <path d="M10 1v3" />
                    </svg>
                    Planificación activa
                  </div>
                  <h2 className="mb-1 text-xl font-bold">
                    {activePlanning.name}
                  </h2>
                  <p className="mb-6 text-sm text-white/80">
                    {activePlanning.startdate
                      ? `${formatDate(activePlanning.startdate)}`
                      : 'Sin fecha de inicio'}
                    {' · '}
                    {activePlanning.weeks}{' '}
                    {activePlanning.weeks === 1 ? 'semana' : 'semanas'}
                  </p>

                  <div className="flex gap-8">
                    <Stat value={totalMeals} label="Comidas planificadas" />
                    <Stat value={totalCovers} label="Raciones" />
                    <Stat value={pantryCount} label="En despensa" />
                    <Stat value={shoppingPending} label="Por comprar" />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mb-2 text-xl font-bold">
                    ¡Bienvenido a PlanComidas!
                  </h2>
                  <p className="mb-6 text-sm text-white/80">
                    Crea tu primera planificación semanal para empezar a
                    organizar tus comidas.
                  </p>
                  <Link
                    href="/plannings"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/20 px-5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    Crear planificación
                  </Link>
                </>
              )}
            </div>

            {/* Secondary card */}
            <div className="w-[272px] shrink-0 rounded-xl bg-[#ECFDF5]/50 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="mb-1 text-sm font-medium text-[#0F172B]">
                Recetas
              </h3>
              <p className="mb-4 text-3xl font-bold text-[#009966]">
                {recipes.length}
              </p>
              <p className="mb-4 text-xs text-[#62748E]">
                {tags.length} etiquetas · {recipes.length} receta
                {recipes.length !== 1 ? 's' : ''}
              </p>
              <Link
                href="/recipes"
                className="text-xs font-medium text-[#009966] hover:underline"
              >
                Ver todas las recetas →
              </Link>
            </div>
          </div>

          {/* Today's meals */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0F172B]">
              {todayName ? `Para hoy (${todayName})` : 'Para hoy'}
            </h2>

            {todayMeals.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {todayMeals.map((meal, i) => (
                  <MealCard
                    key={i}
                    timeName={meal.timeName}
                    recipeName={meal.recipeName}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-sm text-[#62748E]">
                  {activePlanning
                    ? 'No hay comidas planificadas para hoy.'
                    : 'Crea una planificación para ver las comidas de hoy.'}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  );
}

function NavItem({
  href,
  label,
  children,
  active,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-[#ECFDF5] text-[#007A55]'
          : 'text-[#45556C] hover:bg-gray-50'
      }`}
    >
      {children}
      {label}
    </a>
  );
}

function MealCard({
  timeName,
  recipeName,
}: {
  timeName: string;
  recipeName: string | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#62748E]">
        {timeName}
      </p>
      {recipeName ? (
        <p className="text-sm font-medium text-[#0F172B]">{recipeName}</p>
      ) : (
        <p className="text-sm italic text-[#62748E]">Sin asignar</p>
      )}
    </div>
  );
}


