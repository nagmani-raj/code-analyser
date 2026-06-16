import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@dsa-analyzer/shared': resolve(__dirname, '../../packages/shared/src'),
      '@dsa-analyzer/analyzer': resolve(__dirname, '../../packages/analyzer/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        panel: resolve(__dirname, 'src/panel/index.html'),
        content: resolve(__dirname, 'src/content/index.ts'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'content') return 'content/content.js';
          if (chunk.name === 'background') return 'background/service-worker.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Needed for content scripts to work without dynamic imports
    cssCodeSplit: false,
    minify: 'esbuild',
    sourcemap: false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});
