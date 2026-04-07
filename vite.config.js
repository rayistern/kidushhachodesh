import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/kh/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      // hebcal uses Node's events module; provide browser shim
      events: 'events',
    },
  },
  build: {
    outDir: 'dist',
  },
});
