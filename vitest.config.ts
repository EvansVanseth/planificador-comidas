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