import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { seoPlugin } from './build/seoPlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const publicOrigin = env.VITE_SITE_URL || env.URL || '';
  return {
  define: { 'import.meta.env.VITE_SITE_URL': JSON.stringify(publicOrigin) },
  plugins: [react(), tailwindcss(), seoPlugin(env)],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  };
});
