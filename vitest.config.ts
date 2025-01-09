/* v8 ignore start */
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    clearMocks: true,
    env: loadEnv('', process.cwd(), ''),
    exclude: ['**/node_modules/**', '**/dist/**', '.trunk/**'],
  },
});
