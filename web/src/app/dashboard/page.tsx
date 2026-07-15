import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import Link from 'next/link';
import { getTodayDayOrder, getTomorrowDayOrder, getDayName, formatDate } from './helpers';
import { PlusIcon, CalendarSmallIcon } from '@/components/icons';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('userId');
  const userId = cookie?.value ?? '';

  const c = getContainer();
  const users = c.listUsers.execute();
  const user = users.find((u) => u.id === userId);
  const recipes = c.listRecipes.execute(userId);
  const tags = c.listTags.execute(userId);
  const plannings = c.listPlannings.execute(userId);
  const activePlanning = plannings.length > 0 ? plannings[0].toPrimitives() : null;

  const tagsById = new Map(tags.map((t) => [t.id, t]));

  type MealInfo = { time: string; timeName: string; recipeName: string | null };

  let todayMeals: MealInfo[] = [];
  let todayName = '';
  let tomorrowMeals: MealInfo[] = [];
  let tomorrowName = '';
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

    const tomorrowDayOrder = getTomorrowDayOrder(
      activePlanning.startdate,
      activePlanning.weeks,
    );
    if (tomorrowDayOrder) {
      tomorrowName = getDayName(tomorrowDayOrder);
      const day = activePlanning.days.find((d) => d.order === tomorrowDayOrder);
      if (day) {
        tomorrowMeals = day.services.map((s) => {
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
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172B]">Panel</h1>
          <p className="text-sm text-[#45556C]">
            {user!.name}
          </p>
        </div>
        <Link
          href="/plannings"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
        >
          <PlusIcon />
          Nueva planificación
        </Link>
      </div>

      {/* Cards section */}
      <div className="mb-8 flex gap-6">
        {/* Green card */}
        <div className="flex-1 rounded-xl bg-[#007A55] p-8 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          {activePlanning ? (
            <>
              <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                <CalendarSmallIcon />
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

              <div className="flex gap-6">
                <Stat value={totalMeals} label="Comidas planificadas" />
                <Stat value={totalCovers} label="Raciones" />
                <Stat value={pantryCount} label="En despensa" />
                <Stat value={shoppingPending} label="Por comprar" />
              </div>

              <div className="mt-6 flex gap-2">
                <Link
                  href={`/dashboard/plannings/${activePlanning.id}/edit?tab=grid`}
                  className="rounded-lg bg-white/15 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/25"
                  title="Ver cuadrícula"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="6" height="6" rx="1" />
                    <rect x="12" y="2" width="6" height="6" rx="1" />
                    <rect x="2" y="12" width="6" height="6" rx="1" />
                    <rect x="12" y="12" width="6" height="6" rx="1" />
                  </svg>
                </Link>
                <Link
                  href={`/dashboard/plannings/${activePlanning.id}/edit?tab=pantry`}
                  className="rounded-lg bg-white/15 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/25"
                  title="Ver despensa"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10h18l-2 10H5L3 10z" />
                    <path d="M3 10l2-7h14l2 7" />
                    <path d="M8 14h8" />
                  </svg>
                </Link>
                <Link
                  href={`/dashboard/plannings/${activePlanning.id}/edit?tab=shopping`}
                  className="rounded-lg bg-white/15 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/25"
                  title="Ver lista de la compra"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h2l.5 2.5M7 13h10l3-7H5.5" />
                    <circle cx="7" cy="20" r="1.5" />
                    <circle cx="17" cy="20" r="1.5" />
                  </svg>
                </Link>
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
          <p className="mb-4 text-3xl font-bold text-[#007A55]">
            {recipes.length}
          </p>
          <p className="mb-4 text-xs text-[#4F617B]">
            {tags.length} etiquetas · {recipes.length} receta
            {recipes.length !== 1 ? 's' : ''}
          </p>
          <Link
            href="/dashboard/recipes"
            className="text-xs font-medium text-[#007A55] hover:underline"
          >
            Ver todas las recetas →
          </Link>
        </div>
      </div>

      {/* Today&apos;s meals */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-[#0F172B]">
          {todayName ? `Para hoy (${todayName})` : 'Para hoy'}
        </h2>

        {todayMeals.length > 0 ? (
          <div className="flex flex-col gap-3">
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
            <p className="text-sm text-[#4F617B]">
              {activePlanning
                ? 'No hay comidas planificadas para hoy.'
                : 'Crea una planificación para ver las comidas de hoy.'}
            </p>
          </div>
        )}
      </section>

      {/* Tomorrow&apos;s meals */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-[#0F172B]">
          {tomorrowName ? `Para mañana (${tomorrowName})` : 'Para mañana'}
        </h2>

        {tomorrowMeals.length > 0 ? (
          <div className="flex flex-col gap-3">
            {tomorrowMeals.map((meal, i) => (
              <MealCard
                key={i}
                timeName={meal.timeName}
                recipeName={meal.recipeName}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-[#4F617B]">
              {activePlanning
                ? 'No hay comidas planificadas para mañana.'
                : 'Crea una planificación para ver las comidas.'}
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
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
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#4F617B]">
        {timeName}
      </p>
      {recipeName ? (
        <p className="text-sm font-medium text-[#0F172B]">{recipeName}</p>
      ) : (
        <p className="text-sm italic text-[#4F617B]">Sin asignar</p>
      )}
    </div>
  );
}
