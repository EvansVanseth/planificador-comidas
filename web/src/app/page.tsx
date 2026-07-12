import Image from "next/image";
import Link from "next/link";
import { LogoIcon, CheckIcon, CalendarFilledIcon, CartIcon } from '@/components/icons';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex h-20 max-w-[1024px] items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <LogoIcon />
          <span className="text-xl font-bold text-[#0a0a0a]">PlanComidas</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-medium text-[#45556C] transition-colors hover:text-gray-900"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login"
            className="rounded-[10px] bg-[#009966] px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-[#008055]"
          >
            Pruébalo gratis
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[1024px] px-6 pb-24 pt-16">
        <div className="flex flex-col items-start gap-20 lg:flex-row">
          <div className="w-full shrink-0 lg:w-[464px]">
            <h1 className="text-[60px] font-bold leading-[1.1] text-[#0F172B] max-lg:text-5xl max-sm:text-4xl">
              Deja de pensar
              <br />
              <span className="text-[#009966]">qué comer hoy.</span>
            </h1>

            <p className="mt-8 text-xl leading-relaxed text-[#45556C]">
              Organiza tus recetas, genera tu menú semanal automáticamente y
              obtén la lista de compras exacta con lo que falta en tu despensa.
            </p>

            <Link
              href="/login"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-[10px] bg-[#009966] px-7 text-lg font-medium text-white transition-colors hover:bg-[#008055]"
            >
              Empieza a planificar
            </Link>

            <div className="mt-14 space-y-5">
              <FeatureItem>
                Generación automática de menús sin repetir platos
              </FeatureItem>
              <FeatureItem>
                Lista de compras inteligente basada en tu despensa
              </FeatureItem>
              <FeatureItem>
                Filtra por tiempo, calorías o tipo de comida
              </FeatureItem>
            </div>
          </div>

          <div className="relative w-full shrink-0 pt-10 lg:w-[464px]">
            <div className="relative w-full overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] aspect-[2816/1536]">
              <Image
                src="/landing-companion.png"
                alt="PlanComidas dashboard preview"
                fill
                sizes="(max-width: 1024px) 100vw, 464px"
                className="object-cover"
                priority
              />
            </div>

            <FloatingCard
              className="-right-4 -top-5 w-[223px]"
              iconBg="bg-[#D0FAE5]"
              icon={<CalendarFilledIcon />}
              title="Menú de la semana"
              subtitle="14 comidas planificadas"
            />

            <FloatingCard
              className="-bottom-16 -left-8 w-[206px]"
              iconBg="bg-[#FEF3C6]"
              icon={<CartIcon />}
              title="Lista de compras"
              subtitle="Faltan 8 ingredientes"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <CheckIcon />
      <span className="text-base text-[#314158]">{children}</span>
    </div>
  );
}

function FloatingCard({
  className,
  iconBg,
  icon,
  title,
  subtitle,
}: {
  className: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={`absolute flex h-20 items-center gap-3 rounded-xl bg-white px-4 shadow-[0_4px_10px_rgba(0,0,0,0.08)] ${className}`}
    >
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-[#0F172B]">{title}</p>
        <p className="text-xs text-[#62748E]">{subtitle}</p>
      </div>
    </div>
  );
}


