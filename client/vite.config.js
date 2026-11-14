import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Geliştirmede /api isteklerini backend'e (4000) yönlendir
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Plesk'te alt klasörde de çalışsın diye göreli yollar
    assetsDir: 'assets',
  },
});
