import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Geliştirmede /api isteklerini PHP backend'e (8080) yönlendir
    // (php -S localhost:8080 php/api/index.php ile çalıştırın)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
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
