const s = 'animate-pulse rounded bg-gradient-to-r from-[#007A55]/25 to-[#007A55]/10';

export function GridLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className={`${s} h-9 w-24`} />
          <div className={`${s} h-9 w-28`} />
          <div className={`${s} h-9 w-28`} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-sm">
        {/* Table header */}
        <div className="flex border-b-2 border-[#CBD5E1] bg-[#F1F5F9]">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex-1 px-2 py-3">
              <div className={`${s} mx-auto h-3 w-16`} />
            </div>
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 4 }, (_, row) => (
          <div key={row} className="flex border-b border-[#CBD5E1] last:border-0">
            <div className="flex-1 border-r border-[#E2E8F0] px-2 py-3">
              <div className={`${s} h-3 w-12`} />
            </div>
            {Array.from({ length: 7 }, (_, col) => (
              <div key={col} className="flex-1 border-r border-[#E2E8F0] px-2 py-3 last:border-r-0">
                <div className={`${s} h-12 w-full`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PantryLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#CBD5E1] bg-white shadow-sm">
      <div className="shrink-0 border-b border-[#E2E8F0] px-6 py-4">
        <div className={`${s} mb-1 h-5 w-24`} />
        <div className={`${s} h-3 w-72`} />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {/* Desktop table header */}
        <div className="hidden border-b border-[#E2E8F0] bg-[#F8FAFC] md:flex">
          {['Ingrediente', 'Cubres', 'Necesitas', 'Tengo de todo', 'Recetas'].map((h) => (
            <div key={h} className="flex-1 px-4 py-3">
              <div className={`${s} h-3 w-16`} />
            </div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex border-b border-[#E2E8F0] last:border-0">
            <div className="flex flex-1 items-center gap-4 px-4 py-3">
              <div className="hidden md:block md:flex-1">
                <div className={`${s} h-4 w-28`} />
              </div>
              <div className={`${s} h-8 w-16 md:w-24`} />
              <div className={`${s} h-4 w-8`} />
              <div className={`${s} h-8 w-12`} />
              <div className="hidden md:block md:flex-1">
                <div className={`${s} h-4 w-36`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShoppingLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#CBD5E1] bg-white shadow-sm">
      <div className="shrink-0 border-b border-[#E2E8F0] px-6 py-4">
        <div className={`${s} mb-1 h-5 w-36`} />
        <div className={`${s} h-3 w-64`} />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
            <div className={`${s} h-5 w-5 rounded`} />
            <div className="flex-1">
              <div className={`${s} h-4 w-32`} />
              <div className={`${s} mt-1 h-3 w-48`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
