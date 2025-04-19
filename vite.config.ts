
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    sourcemap: true,
    target: 'es2020'
  },
  server: {
    port: 5173,
    host: '127.0.0.1', // Add this line to bind to localhost
    proxy: {
      '/api': {
        target: 'http://localhost:4043',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    allowedHosts: [
      '419a3031-3516-43dc-9ed4-ee551b9a4c71.lovableproject.com',
    ],
  },
  esbuild: {
    tsconfigRaw: JSON.stringify({
      compilerOptions: {
        target: 'es2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx'
      }
    })
  }
});
