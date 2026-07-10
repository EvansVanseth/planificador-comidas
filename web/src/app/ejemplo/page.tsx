export default function Ejemplo() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">

      {/* 1. TIPOGRAFÍA */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Tipografía</h2>
        <p className="text-xs">text-xs (12px)</p>
        <p className="text-sm">text-sm (14px)</p>
        <p className="text-base">text-base (16px) — valor por defecto</p>
        <p className="text-lg">text-lg (18px)</p>
        <p className="text-xl">text-xl (20px)</p>
        <p className="text-2xl">text-2xl (24px)</p>
        <p className="font-light">font-light (300)</p>
        <p className="font-bold">font-bold (700)</p>
      </section>

      {/* 2. COLORES */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Colores</h2>
        <div className="flex gap-2">
          <div className="bg-red-500 text-white px-4 py-2 rounded">red-500</div>
          <div className="bg-blue-500 text-white px-4 py-2 rounded">blue-500</div>
          <div className="bg-green-500 text-white px-4 py-2 rounded">green-500</div>
          <div className="bg-yellow-400 text-black px-4 py-2 rounded">yellow-400</div>
          <div className="bg-purple-500 text-white px-4 py-2 rounded">purple-500</div>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded">blue-100 bg / blue-900 text</div>
          <div className="bg-blue-200 text-blue-800 px-4 py-2 rounded">blue-200 bg / blue-800 text</div>
          <div className="bg-blue-700 text-white px-4 py-2 rounded">blue-700 bg</div>
        </div>
      </section>

      {/* 3. SPACING (márgenes y paddings) */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Spacing</h2>
        <p className="mb-2">Cada unidad = 4px</p>
        <div className="space-y-2">
          <div className="bg-gray-200 p-1">p-1 (4px)</div>
          <div className="bg-gray-200 p-2">p-2 (8px)</div>
          <div className="bg-gray-200 p-4">p-4 (16px)</div>
          <div className="bg-gray-200 p-8">p-8 (32px)</div>
        </div>
        <p className="mt-4">
          <span className="mr-2 bg-blue-200 px-2">mr-2 (margin-right)</span>
          <span className="ml-4 bg-green-200 px-2">ml-4 (margin-left)</span>
        </p>
      </section>

      {/* 4. FLEXBOX */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Flexbox</h2>
        <div className="flex items-center justify-between bg-gray-100 p-4 rounded">
          <span className="bg-blue-300 px-3 py-1 rounded">Izquierda</span>
          <span className="bg-green-300 px-3 py-1 rounded">Centro</span>
          <span className="bg-red-300 px-3 py-1 rounded">Derecha</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          flex + items-center + justify-between = 3 elementos separados
        </p>
      </section>

      {/* 5. GRID */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Grid</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-indigo-200 p-4 rounded text-center">1</div>
          <div className="bg-indigo-300 p-4 rounded text-center">2</div>
          <div className="bg-indigo-400 p-4 rounded text-center text-white">3</div>
          <div className="bg-indigo-200 p-4 rounded text-center">4</div>
          <div className="bg-indigo-300 p-4 rounded text-center">5</div>
          <div className="bg-indigo-400 p-4 rounded text-center text-white">6</div>
        </div>
      </section>

      {/* 6. BORDES Y SOMBRAS */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Bordes y sombras</h2>
        <div className="flex gap-4">
          <div className="border border-gray-300 p-4 rounded">border + rounded</div>
          <div className="border-2 border-blue-500 p-4 rounded-lg">border-2 + rounded-lg</div>
          <div className="shadow p-4 rounded">shadow</div>
          <div className="shadow-lg p-4 rounded">shadow-lg</div>
        </div>
      </section>

      {/* 7. HOVER Y ESTADOS */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Hover y estados</h2>
        <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
          hover:bg-blue-700
        </button>
        <button className="ml-4 bg-gray-200 px-6 py-2 rounded active:bg-gray-400">
          active:bg-gray-400 (al hacer clic)
        </button>
      </section>

      {/* 8. RESPONSIVE */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Responsive</h2>
        <div className="bg-green-200 p-4 rounded text-center text-sm sm:text-base md:text-lg lg:text-xl">
          Redimensioná la ventana — el texto cambia de tamaño
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <div className="bg-purple-200 p-4 rounded">1 col en mobile, 2 en tablet, 4 en desktop</div>
          <div className="bg-purple-300 p-4 rounded">Cada breakpoint cambia el grid</div>
          <div className="bg-purple-200 p-4 rounded">sm ≥ 640px</div>
          <div className="bg-purple-300 p-4 rounded">md ≥ 768px</div>
        </div>
      </section>

      {/* 9. EJEMPLO COMPUESTO: UNA TARJETA */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Ejemplo real: tarjeta de receta</h2>
        <div className="border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-2">Pollo al horno</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>⏱ 45 min</span>
            <span>🍽 4 comensales</span>
          </div>
          <p className="text-gray-700 mb-4">
            Pollo jugoso al horno con patatas y verduras asadas.
          </p>
          <div className="flex gap-2">
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">CALIENTE</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">CENA</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">PRINCIPAL</span>
          </div>
        </div>
      </section>

    </div>
  );
}
