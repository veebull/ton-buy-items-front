import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [react(), nodePolyfills(), mkcert()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@ton/ton'],
  },
  build: {
    commonjsOptions: {
      include: [/@ton\/ton/, /node_modules/],
    },
  },
  server: {
    https: {},
  },
});
