import Link from 'next/link';

type Props = {
  planningId: string;
  activeTab: string;
};

const TABS = [
  { id: 'grid', label: 'Cuadrícula' },
  { id: 'pantry', label: 'Despensa' },
  { id: 'shopping', label: 'Lista de la compra' },
];

export default function TabNav({ planningId, activeTab }: Props) {
  return (
    <nav className="mb-6 flex gap-1 border-b border-[#E2E8F0]">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/dashboard/plannings/${planningId}/edit?tab=${tab.id}`}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-b-2 border-[#007A55] text-[#007A55]'
                : 'text-[#4F617B] hover:text-[#0F172B]'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
