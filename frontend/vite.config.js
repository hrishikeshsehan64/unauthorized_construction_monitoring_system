import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/sites': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/surveys': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/reports': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/investigations': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
