// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
 
  plugins: [react()],
     base: '/',
  server: {
      historyApiFallback:true,

    proxy: {
      '/api': {
        target: 'https://crmbackend-production-911d.up.railway.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
