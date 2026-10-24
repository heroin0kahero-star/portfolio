import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), glsl()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      sourcemap: false,
      // Three.js is lazy-loaded into its own chunk and is naturally large; the
      // default 500 kB warning would fire for a chunk that never blocks the hero.
      chunkSizeWarningLimit: 900,
      esbuild: {
        drop: ['console', 'debugger'],
      },
    },
    optimizeDeps: {
      exclude: ['threejs-components'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
