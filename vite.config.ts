import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

const defaultProductionBase = '/';
const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const envBase = env.VITE_BASE_PATH || process.env.VITE_BASE_PATH;
  const fallbackBase = mode === 'production' ? defaultProductionBase : '/';
  const baseFromEnv = envBase ?? fallbackBase;

  return {
    base: ensureTrailingSlash(baseFromEnv),
    plugins: [react()],
    server: {
      port: 5173,
    },
    build: {
      rollupOptions: {
        // index.html stays the live homepage; the 3D vault terminal is a
        // side route you can preview at /vault.html until you swap them.
        input: {
          main: resolve(__dirname, 'index.html'),
          vault: resolve(__dirname, 'vault.html'),
        },
      },
    },
  };
});
