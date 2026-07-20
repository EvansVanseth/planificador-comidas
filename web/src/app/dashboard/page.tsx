import { getAuthProvider } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import Link from 'next/link';
import { getTodayDayOrder, getTomorrowDayOrder, getDayName, formatDate } from './helpers';
import { PlusIcon, CalendarSmallIcon } from '@/components/icons';
import { MealCardClient } from './meal-card.client';
import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import type { RecipePrimitives } from '@/domain/recipes/aggregates/recipe.aggregate';
import type { IngredientPrimitives } from '@/domain/ingredients/aggregates/ingredient.aggregate';

type MealInfo = {
  time: string;
  timeName: string;
  recipeName: string | null;
  recipeId: string | null;
  covers: number;
  baseServings: number | null;
  prepTime: number | null;
  preparation: string | null;
  ingredients: { name: string; quantityNote: string | null }[];
};

type ActivePlanningData = {
  primitives: PlanningPrimitives;
  totalMeals: number;
  totalCovers: number;
  pantryCount: number;
  shoppingPending: number;
  todayName: string;
  todayMeals: MealInfo[];
  tomorrowName: string;
  tomorrowMeals: MealInfo[];
};

export default async function DashboardPage() {
  const sessionUser = await getAuthProvider().getUser();
  const userId = sessionUser?.id ?? '';
  const userName = sessionUser?.name ?? '';

  const c = getContainer();
  const recipes = await c.listRecipes.execute(userId);
  const tags = await c.listTags.execute(userId);
  const ingredients = await c.listIngredients.execute(userId);
  const plannings = await c.listPlannings.execute(userId);

  const tagsById = new Map(tags.map((t) => [t.id, t]));
  const recipesById = new Map(recipes.map((r) => [r.id, r]));
  const ingredientsById = new Map(ingredients.map((i) => [i.id, i]));

  const activePlanningsData: ActivePlanningData[] = plannings
    .map((p) => p.toPrimitives())
    .filter((p) => getTodayDayOrder(p.startdate, p.weeks) !== null)
    .map((p) => buildPlanningData(p, tagsById, recipesById, ingredientsById));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ===== DESKTOP VIEW ===== */}
      <div className="hidden min-h-0 flex-1 flex-col md:flex">
        <div className="shrink-0 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172B]">Panel</h1>
              <p className="text-sm text-[#45556C]">
                {userName}
              </p>
            </div>
            <Link
              href="/dashboard/plannings/new"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
            >
              <PlusIcon />
              Nueva planificación
            </Link>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {activePlanningsData.length > 0 ? (
            <>
              {/* Cards section */}
              <div className="mb-8 flex gap-6">
                <div className="flex flex-1 flex-col gap-6">
                  {activePlanningsData.map((pd) => (
                    <DesktopPlanningCard key={pd.primitives.id} pd={pd} />
                  ))}
                </div>

                {/* Recipe card */}
                <DesktopRecipeCard recipesCount={recipes.length} tagsCount={tags.length} />
              </div>

              {/* Today&apos;s meals */}
              <DesktopMealsSection
                title={
                  activePlanningsData.length === 1
                    ? `Para hoy (${activePlanningsData[0].todayName})`
                    : 'Para hoy'
                }
                planningsData={activePlanningsData}
                getMeals={(pd) => pd.todayMeals}
                emptyMsg="No hay comidas planificadas para hoy."
              />

              {/* Tomorrow&apos;s meals */}
              <DesktopMealsSection
                title={
                  activePlanningsData.length === 1
                    ? `Para mañana (${activePlanningsData[0].tomorrowName})`
                    : 'Para mañana'
                }
                planningsData={activePlanningsData}
                getMeals={(pd) => pd.tomorrowMeals}
                emptyMsg="No hay comidas planificadas para mañana."
              />
            </>
          ) : (
            /* Welcome card */
            <div className="flex gap-6">
              <div className="flex-1 rounded-xl bg-[#007A55] p-8 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h2 className="mb-2 text-xl font-bold">
                  ¡Bienvenido a PlanComidas!
                </h2>
                <p className="mb-6 text-sm text-white/80">
                  Crea tu primera planificación semanal para empezar a
                  organizar tus comidas.
                </p>
                <Link
                  href="/dashboard/plannings"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/20 px-5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  Crear planificación
                </Link>
              </div>
              <DesktopRecipeCard recipesCount={recipes.length} tagsCount={tags.length} />
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE VIEW ===== */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="shrink-0 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172B]">Panel</h1>
              <p className="text-sm text-[#45556C]">
                {userName}
              </p>
            </div>
            <Link
              href="/dashboards/plannings"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
            >
              <PlusIcon />
              Nueva planificación
            </Link>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {activePlanningsData.length > 0 ? (
            <>
              {activePlanningsData.map((pd) => (
                <MobilePlanningCard key={pd.primitives.id} pd={pd} />
              ))}

              {/* Recipe card */}
              <MobileRecipeCard recipesCount={recipes.length} tagsCount={tags.length} />

              {/* Today&apos;s meals */}
              <MobileMealsSection
                title={activePlanningsData.length === 1 ? `Para hoy (${activePlanningsData[0].todayName})` : 'Para hoy'}
                planningsData={activePlanningsData}
                getMeals={(pd) => pd.todayMeals}
                emptyMsg="No hay comidas planificadas para hoy."
              />

              {/* Tomorrow&apos;s meals */}
              <MobileMealsSection
                title={activePlanningsData.length === 1 ? `Para mañana (${activePlanningsData[0].tomorrowName})` : 'Para mañana'}
                planningsData={activePlanningsData}
                getMeals={(pd) => pd.tomorrowMeals}
                emptyMsg="No hay comidas planificadas para mañana."
              />
            </>
          ) : (
            <>
              <div className="mb-4 w-full rounded-xl bg-[#007A55] px-6 py-5 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <h2 className="mb-2 text-xl font-bold">
                  ¡Bienvenido a PlanComidas!
                </h2>
                <p className="mb-6 text-sm text-white/80">
                  Crea tu primera planificación semanal para empezar a
                  organizar tus comidas.
                </p>
                <Link
                  href="/dashboard/plannings"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/20 px-5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  Crear planificación
                </Link>
              </div>
              <MobileRecipeCard recipesCount={recipes.length} tagsCount={tags.length} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== DESKTOP SUB-COMPONENTS ===== */

function DesktopPlanningCard({ pd }: { pd: ActivePlanningData }) {
  return (
    <div className="rounded-xl bg-[#007A55] p-8 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
        <CalendarSmallIcon />
        Planificación activa
      </div>
      <h2 className="mb-1 text-xl font-bold">
        {pd.primitives.name}
      </h2>
      <p className="mb-6 text-sm text-white/80">
        {pd.primitives.startdate
          ? `${formatDate(pd.primitives.startdate)}`
          : 'Sin fecha de inicio'}
        {' · '}
        {pd.primitives.weeks}{' '}
        {pd.primitives.weeks === 1 ? 'semana' : 'semanas'}
      </p>

      <div className="flex gap-8">
        <StatDesktop value={pd.totalMeals} label="Servicios" />
        <StatDesktop value={pd.totalCovers} label="Raciones" />
        <StatDesktop value={pd.pantryCount} label="En despensa" />
        <StatDesktop value={pd.shoppingPending} label="Por comprar" />
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/dashboard/plannings/${pd.primitives.id}/edit?tab=grid`}
          className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Cuadrícula
        </Link>
        <Link
          href={`/dashboard/plannings/${pd.primitives.id}/edit?tab=pantry`}
          className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Despensa
        </Link>
        <Link
          href={`/dashboard/plannings/${pd.primitives.id}/edit?tab=shopping`}
          className="rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          Lista de la compra
        </Link>
      </div>
    </div>
  );
}

function DesktopRecipeCard({ recipesCount, tagsCount }: { recipesCount: number; tagsCount: number }) {
  return (
    <div className="w-[272px] shrink-0 rounded-xl bg-[#ECFDF5]/50 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <h3 className="mb-1 text-sm font-medium text-[#0F172B]">
        Recetas
      </h3>
      <p className="mb-4 text-3xl font-bold text-[#007A55]">
        {recipesCount}
      </p>
      <p className="mb-4 text-xs text-[#4F617B]">
        {tagsCount} etiquetas · {recipesCount} receta
        {recipesCount !== 1 ? 's' : ''}
      </p>
      <Link
        href="/dashboard/recipes"
        className="text-xs font-medium text-[#007A55] hover:underline"
      >
        Ver todas las recetas →
      </Link>
    </div>
  );
}

function DesktopMealsSection({
  title,
  planningsData,
  getMeals,
  emptyMsg,
}: {
  title: string;
  planningsData: ActivePlanningData[];
  getMeals: (pd: ActivePlanningData) => MealInfo[];
  emptyMsg: string;
}) {
  const allEmpty = planningsData.every((pd) => getMeals(pd).length === 0);

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-bold text-[#0F172B]">{title}</h2>

      {!allEmpty ? (
        planningsData.map((pd) => {
          const meals = getMeals(pd);
          if (meals.length === 0) return null;
          return (
            <div key={pd.primitives.id} className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-[#0F172B]">
                {pd.primitives.name}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {meals.map((meal, i) => (
                  <MealCardDesktop
                    key={i}
                    timeName={meal.timeName}
                    recipeName={meal.recipeName}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-[#4F617B]">{emptyMsg}</p>
        </div>
      )}
    </section>
  );
}

/* ===== MOBILE SUB-COMPONENTS ===== */

function MobilePlanningCard({ pd }: { pd: ActivePlanningData }) {
  return (
    <div className="mb-4 w-full rounded-xl bg-[#007A55] px-6 py-5 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="mb-1 flex items-center gap-2 text-sm text-white/80">
        <CalendarSmallIcon />
        Planificación activa
      </div>
      <h2 className="mb-1 text-xl font-bold">
        {pd.primitives.name}
      </h2>
      <p className="mb-4 text-sm text-white/80">
        {pd.primitives.startdate
          ? `${formatDate(pd.primitives.startdate)}`
          : 'Sin fecha de inicio'}
        {' · '}
        {pd.primitives.weeks}{' '}
        {pd.primitives.weeks === 1 ? 'semana' : 'semanas'}
      </p>

      <div className="mb-4 flex">
        <StatMobile value={pd.totalMeals} label="Servicios" />
        <StatMobile value={pd.totalCovers} label="Raciones" />
        <StatMobile value={pd.pantryCount} label="En despensa" />
        <StatMobile value={pd.shoppingPending} label="Por comprar" />
      </div>

      <div className="flex justify-around gap-2">
        <Link
          href={`/dashboard/plannings/${pd.primitives.id}/edit?tab=grid`}
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
          href={`/dashboard/plannings/${pd.primitives.id}/edit?tab=pantry`}
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
          href={`/dashboard/plannings/${pd.primitives.id}/edit?tab=shopping`}
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
    </div>
  );
}

function MobileRecipeCard({ recipesCount, tagsCount }: { recipesCount: number; tagsCount: number }) {
  return (
    <div className="mb-6 w-full rounded-xl bg-[#ECFDF5]/50 px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#0F172B]">Recetas</h3>
          <p className="mt-0.5 text-xs text-[#4F617B]">
            {recipesCount} receta{recipesCount !== 1 ? 's' : ''} · {tagsCount} etiqueta{tagsCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#007A55]">{recipesCount}</p>
          <Link
            href="/dashboard/recipes"
            className="text-xs font-medium text-[#007A55] hover:underline"
          >
            Ver todas →
          </Link>
        </div>
      </div>
    </div>
  );
}

function MobileMealsSection({
  title,
  planningsData,
  getMeals,
  emptyMsg,
}: {
  title: string;
  planningsData: ActivePlanningData[];
  getMeals: (pd: ActivePlanningData) => MealInfo[];
  emptyMsg: string;
}) {
  const allEmpty = planningsData.every((pd) => getMeals(pd).length === 0);

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-xl font-bold text-[#0F172B]">{title}</h2>

      {!allEmpty ? (
        planningsData.map((pd) => {
          const meals = getMeals(pd);
          if (meals.length === 0) return null;
          return (
            <div key={pd.primitives.id} className="mb-4">
              <h3 className="mb-2 text-sm font-semibold text-[#0F172B]">
                {pd.primitives.name}
              </h3>
              <div className="flex flex-col gap-2">
                {meals.map((meal, i) => (
                  <MealCardClient
                    key={i}
                    timeName={meal.timeName}
                    recipeName={meal.recipeName}
                    covers={meal.covers}
                    baseServings={meal.baseServings}
                    prepTime={meal.prepTime}
                    preparation={meal.preparation}
                    ingredients={meal.ingredients}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-[#4F617B]">{emptyMsg}</p>
        </div>
      )}
    </section>
  );
}

/* ===== SHARED HELPERS ===== */

function StatDesktop({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  );
}

function StatMobile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  );
}

function MealCardDesktop({
  timeName,
  recipeName,
}: {
  timeName: string;
  recipeName: string | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
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

function sortServicesByTagOrder(
  services: { time: string; recipeId: string | null; covers: number }[],
  tagsById: Map<string, { name: string; order?: number }>,
) {
  return [...services].sort((a, b) => {
    const orderA = tagsById.get(a.time)?.order ?? 999;
    const orderB = tagsById.get(b.time)?.order ?? 999;
    return orderA - orderB;
  });
}

function buildPlanningData(
  p: PlanningPrimitives,
  tagsById: Map<string, { name: string; order?: number }>,
  recipesById: Map<string, RecipePrimitives>,
  ingredientsById: Map<string, IngredientPrimitives>,
): ActivePlanningData {
  const todayDayOrder = getTodayDayOrder(p.startdate, p.weeks);
  const tomorrowDayOrder = getTomorrowDayOrder(p.startdate, p.weeks);

  const todayDay = todayDayOrder ? p.days.find((d) => d.order === todayDayOrder) : null;
  const tomorrowDay = tomorrowDayOrder ? p.days.find((d) => d.order === tomorrowDayOrder) : null;

  const recipeIngredientIds = new Set<string>();
  for (const day of p.days) {
    for (const sv of day.services) {
      if (!sv.recipeId) continue;
      const recipe = recipesById.get(sv.recipeId);
      if (!recipe) continue;
      recipe.ingredients.forEach((ing) => recipeIngredientIds.add(ing.ingredientId));
    }
  }

  const pantryMap = new Map(p.pantryItems.map((item) => [item.ingredientId, item]));
  const shoppingMap = new Map(p.shoppingItems.map((s) => [s.ingredientId, s]));
  const pantryCount = [...recipeIngredientIds].filter(
    (id) => pantryMap.get(id)?.available,
  ).length;
  const shoppingPending = [...recipeIngredientIds].filter(
    (id) => !pantryMap.get(id)?.available && !shoppingMap.get(id)?.completed,
  ).length;

  return {
    primitives: p,
    totalMeals: p.days.reduce(
      (sum, d) => sum + d.services.filter((s) => s.recipeId).length, 0,
    ),
    totalCovers: p.days.reduce(
      (sum, d) => sum + d.services.reduce((s, sv) => s + sv.covers, 0), 0,
    ),
    pantryCount,
    shoppingPending,
    todayName: todayDayOrder ? getDayName(todayDayOrder) : '',
    todayMeals: todayDay
      ? sortServicesByTagOrder(todayDay.services, tagsById).map((s) => buildMealInfo(s, tagsById, recipesById, ingredientsById))
      : [],
    tomorrowName: tomorrowDayOrder ? getDayName(tomorrowDayOrder) : '',
    tomorrowMeals: tomorrowDay
      ? sortServicesByTagOrder(tomorrowDay.services, tagsById).map((s) => buildMealInfo(s, tagsById, recipesById, ingredientsById))
      : [],
  };
}

function buildMealInfo(
  s: { time: string; recipeId: string | null; covers: number },
  tagsById: Map<string, { name: string; order?: number }>,
  recipesById: Map<string, RecipePrimitives>,
  ingredientsById: Map<string, IngredientPrimitives>,
): MealInfo {
  const timeTag = tagsById.get(s.time);
  const recipe = s.recipeId ? recipesById.get(s.recipeId) : null;
  return {
    time: s.time,
    timeName: timeTag?.name ?? s.time,
    recipeName: recipe?.name ?? null,
    recipeId: s.recipeId,
    covers: s.covers,
    baseServings: recipe?.baseServings ?? null,
    prepTime: recipe?.prepTime ?? null,
    preparation: recipe?.preparation ?? null,
    ingredients: recipe
      ? recipe.ingredients.map((ing) => ({
          name: ingredientsById.get(ing.ingredientId)?.name ?? ing.ingredientId,
          quantityNote: ing.quantityNote,
        }))
      : [],
  };
}
