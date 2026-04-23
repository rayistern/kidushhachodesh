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
    // Build into dist/kh so the published files actually live at the URL
    // path /kh/* on Netlify. Combined with base='/kh/', the references in
    // index.html resolve to real files on disk — no Netlify rewrites needed.
    outDir: 'dist/kh',
    emptyOutDir: true,
    // Split heavy vendor libs into their own chunks so the main
    // AppShell bundle doesn't balloon past the warn limit. three.js +
    // r3f is the biggest offender.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          hebcal: ['hebcal'],
        },
      },
    },
    chunkSizeWarningLimit: 1100,
  },
});
