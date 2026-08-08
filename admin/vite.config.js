import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/admin/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/gallery': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
      // Root-level static assets (profile photo, logo, etc.)
      '^/[^/]+\\.(png|jpg|jpeg|webp|gif|svg)$': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
