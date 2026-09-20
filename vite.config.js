import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const basePath = process.env.VITE_BASE_PATH || '/platform/';
const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

export default defineConfig({
  base: cleanBase,
  plugins: [
    react(),
    {
      name: 'dev-base-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const baseNoSlash = cleanBase.replace(/\/$/, '');
          const url = req.url || '';
          if (
            baseNoSlash &&
            !url.startsWith(cleanBase) &&
            !url.startsWith(baseNoSlash) &&
            !url.startsWith('/@') &&
            !url.startsWith('/src') &&
            !url.startsWith('/node_modules')
          ) {
            const dest = `${baseNoSlash}${url.startsWith('/') ? url : '/' + url}`;
            res.writeHead(302, { Location: dest });
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    open: false
  },
  build: {
    rollupOptions: {
      output: {
        // Pin vendor libraries into stable named chunks.
        // Without this Vite hashes chunk names by content, so every redeploy
        // produces a new hash (e.g. Container-Bv9PAxVU.js → Container-AbCdEfGh.js).
        // Cached browser tabs then 404 on the old filename.
        manualChunks(id) {
          if (id.includes('node_modules/react-bootstrap') || id.includes('node_modules/bootstrap')) {
            return 'vendor-bootstrap';
          }
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/@emailjs')) {
            return 'vendor-emailjs';
          }
          if (id.includes('node_modules/react-router') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }
        }
      }
    }
  }
});
