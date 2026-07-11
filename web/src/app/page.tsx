import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="text-xl font-bold text-indigo-900">Planificador de Comidas</h1>
        <nav className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Registrarse
          </Link>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center px-8 pt-20 pb-32 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6 max-w-2xl">
          Planificá tus comidas
          <span className="text-indigo-600"> sin pensar</span>
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-xl">
          Organizá el menú semanal, gestioná tu despensa, generá la lista de la compra
          y deja que la app autoplanifique por vos.
        </p>

        <Link
          href="/login"
          className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all"
        >
          Comenzar gratis
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl">
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Planificación semanal</h3>
            <p className="text-gray-500 text-sm">
              Armá el menú de la semana con pocos clics. Asigná recetas a cada día y momento.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Autoplanificación</h3>
            <p className="text-gray-500 text-sm">
              El motor inteligente asigna recetas según tus preferencias, exclusiones y balance frío/caliente.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lista de la compra</h3>
            <p className="text-gray-500 text-sm">
              Calculá lo que falta comprar según tu despensa y llevalo al supermercado.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400 text-sm">
        Planificador de Comidas — TFM
      </footer>
    </div>
  );
}
