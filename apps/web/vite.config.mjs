import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const localServer = {
  host: '127.0.0.1',
  strictPort: true,
  proxy: {
    '/health': { target: 'http://127.0.0.1:8787' },
  },
};

export default defineConfig({
  plugins: [react()],
  server: { ...localServer, port: 5173 },
  preview: { ...localServer, port: 4173 },
  // Keep composite TypeScript declarations/build metadata in dist/ intact.
  build: { outDir: 'build' },
});
