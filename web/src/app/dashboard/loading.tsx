import { SpinnerIcon, CalendarSmallIcon, PlusIcon } from '@/components/icons';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Desktop view */}
      <div className="hidden min-h-0 flex-1 flex-col md:flex">
        {/* Header — static, no data dependency */}
        <div className="shrink-0 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172B]">Panel</h1>
              <p className="text-sm text-[#45556C]">
                <SpinnerIcon size={12} />
              </p>
            </div>
            <button
              disabled
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white opacity-60"
            >
              <PlusIcon />
              Nueva planificación
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Cards section — real shells with spinners */}
          <div className="mb-8 flex gap-6">
            <div className="flex flex-1 flex-col gap-6">
              {/* Planning card shell */}
              <div className="rounded-xl bg-[#007A55] p-8 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="mb-2 flex items-center gap-2 text-sm text-white/80">
                  <CalendarSmallIcon />
                  Planificación activa
                </div>
                <div className="mb-6 flex items-center justify-center py-4">
                  <SpinnerIcon size={24} />
                </div>
                <div className="flex gap-8">
                  <StatSkeleton />
                  <StatSkeleton />
                  <StatSkeleton />
                  <StatSkeleton />
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="h-9 w-28 rounded-lg bg-white/15" />
                  <div className="h-9 w-24 rounded-lg bg-white/15" />
                  <div className="h-9 w-32 rounded-lg bg-white/15" />
                </div>
              </div>
            </div>

            {/* Recipe card shell */}
            <div className="flex w-[272px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#ECFDF5]/50 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <SpinnerIcon size={20} />
            </div>
          </div>

          {/* Today's meals section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-[#0F172B]">
              <SpinnerIcon size={18} />
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <MealCardSkeleton />
              <MealCardSkeleton />
              <MealCardSkeleton />
              <MealCardSkeleton />
            </div>
          </div>

          {/* Tomorrow's meals section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-[#0F172B]">
              <SpinnerIcon size={18} />
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <MealCardSkeleton />
              <MealCardSkeleton />
              <MealCardSkeleton />
              <MealCardSkeleton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172B]">Panel</h1>
              <p className="text-sm text-[#45556C]">
                <SpinnerIcon size={12} />
              </p>
            </div>
            <button
              disabled
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white opacity-60"
            >
              <PlusIcon />
              Nueva planificación
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Mobile planning card shell */}
          <div className="mb-4 w-full rounded-xl bg-[#007A55] px-6 py-5 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="mb-1 flex items-center gap-2 text-sm text-white/80">
              <CalendarSmallIcon />
              Planificación activa
            </div>
            <div className="flex items-center justify-center py-4">
              <SpinnerIcon size={20} />
            </div>
            <div className="mb-4 flex">
              <StatSkeleton mobile />
              <StatSkeleton mobile />
              <StatSkeleton mobile />
              <StatSkeleton mobile />
            </div>
          </div>

          {/* Mobile recipe card shell */}
          <div className="mb-6 flex w-full items-center justify-center rounded-xl bg-[#ECFDF5]/50 px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <SpinnerIcon size={20} />
          </div>

          {/* Mobile today's meals */}
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-bold text-[#0F172B]">
              <SpinnerIcon size={18} />
            </h2>
            <div className="flex flex-col gap-2">
              <MobileMealSkeleton />
              <MobileMealSkeleton />
            </div>
          </div>

          {/* Mobile tomorrow's meals */}
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-bold text-[#0F172B]">
              <SpinnerIcon size={18} />
            </h2>
            <div className="flex flex-col gap-2">
              <MobileMealSkeleton />
              <MobileMealSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Skeleton sub-components ===== */

function StatSkeleton({ mobile }: { mobile?: boolean }) {
  return (
    <div className={mobile ? 'flex flex-1 flex-col items-center justify-center text-center' : ''}>
      <div className={`mx-auto ${mobile ? 'h-5 w-10' : 'h-8 w-14'} animate-pulse rounded bg-white/20`} />
      <div className={`mx-auto mt-1 ${mobile ? 'h-3 w-12' : 'h-3 w-16'} animate-pulse rounded bg-white/15`} />
    </div>
  );
}

function MealCardSkeleton() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <SpinnerIcon size={16} />
    </div>
  );
}

function MobileMealSkeleton() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <SpinnerIcon size={16} />
    </div>
  );
}
