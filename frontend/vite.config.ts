import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: true,
    strictPort: true,
    // Proxy API requests to backend to avoid CORS
    proxy: ['auth', 'api', 'quiz', 'admin'].reduce(
      (acc: Record<string, any>, path: string) => {
        acc[`/${path}`] = {
          target: 'http://localhost:8000',
          changeOrigin: true,
        };
        return acc;
      },
      {}
    ),
  },
});
