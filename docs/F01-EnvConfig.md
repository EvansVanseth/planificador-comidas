# Configuración del entorno de trabajo inicial (orientada a DDD)

## Inicializar carpeta y Git
``` bash
mkdir planificador-comidas
cd planificador-comidas
git init

// solo si no se ha hecho todavía
git config --global user.name "EvansVanseth"  
git config --global user.email "evansvanseth@gmail.com"  
```

## Archivo de configuración (package.json)
``` bash
npm init -y
```

## Instalar TypeScript y Vitest (-D: solo desarrollo)
``` bash
npm install -D typescript vitest
```

## Inicializar TypeScript (tsconfig.json)
``` bash
npx tsc --init
```
*Configuración inicial de **tsconfig.json***
``` json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

## Cosas de desarrollo o Privadas
El archivo `.gitignore` en la raiz del proyecto evita subir cosas de desarrollo y privadas a GitHub. 
``` plaintext
node_modules/
.DS_Store
Thumbs.db
```

## Estructura de carpetas
``` plaintext
planificador-comidas/
├── node_modules/       (las tripas de TS y Vitest, no se tocan)
├── src/
│   └── domain/
│       └── recipes/    <-- Empezaremos por aquí (En nuestro caso particular - RECETAS)
├── .gitignore
├── package.json
└── tsconfig.json
```

## Añadir archivo de configuración de vitest
Lo usaremos para disponer de rutas absolutas en lugar de dinámicas (@/)
Lo añadimos al nivel del package.json

``` typescript
import { defineConfig } from 'vitest/config';
import path from 'path'; // Asegúrate de tener este import

export default defineConfig({
  test: {
    // ... tus otras configs
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
``` 

## Necesitamos indicarle a ts que path existe
``` bash
npm install -D @types/node
```

## Actualizar tsconfig
``` json
{
  "compilerOptions": {
    // ... tu configuración actual
    "types": ["node"]
  }
}
```

## Instalar dependencias para menus de CLI
``` bash
npm install prompts (<- la instalación en sí)
npm i --save-dev @types/prompts (<- los tipos para TS)
```

## corrección de rutas absolutas con @ para ts-node
``` bash
npm install --save-dev tsconfig-paths
```
Modificar el script de inicio para que compile las rutas antes de iniciar
``` json
"scripts": {
  "cli": "ts-node -r tsconfig-paths/register src/cli.ts"
}
```

## instalamos picocolors
``` bash
npm install picocolors
```

## instalamos tsx para ejecución de la terminal
``` bash
npm install -D tsx (local)
```

---

# Configuración de Next.js (Fase 18 — Web Desktop)

## Prerrequisito: Node.js 18.17+ (ya lo tenemos: v24.17.0)

## Paso 1: Crear proyecto Next.js en /web
``` bash
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Qué significa cada flag:
- `web` — nombre de la carpeta donde se crea el proyecto
- `--typescript` — usa TypeScript en lugar de JavaScript
- `--tailwind` — configura Tailwind CSS automáticamente
- `--eslint` — incluye configuración de ESLint
- `--app` — usa App Router (la nueva forma de rutas de Next.js 14+)
- `--src-dir` — coloca el código dentro de `src/` (como nuestro proyecto existente)
- `--import-alias "@/*"` — alias para imports absolutos (ej: `@/components/Button`)
- `--use-npm` — usa npm en lugar de yarn/pnpm

## Paso 2: Verificar que el proyecto se creó correctamente
``` bash
ls web
```

## Paso 3: Probar que arranca el servidor de desarrollo
``` bash
npm run dev
```
(Ejecutamos dentro de /web)
```
