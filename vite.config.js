import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // The site is served behind a path-prefix proxy at
  // https://shluchimexchange.ai/kh. The proxy only forwards /kh*, so the
  // browser must request assets under that prefix too. base='/kh/' makes
  // index.html reference assets as /kh/assets/..., and netlify.toml
  // rewrites those back to the real /assets/* files in dist/.
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
