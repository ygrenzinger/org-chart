import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'OrgChart',
      fileName: (format) => `d3-org-chart.${format === 'es' ? 'js' : format}`
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        globals: {
          'd3': 'd3'
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: '/sandbox/index.html'
  }
});
