// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://crmbackend-production-911d.up.railway.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
