import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'chromium', headless: true }
      ]
    },
    include: ['test/**/*.{test,spec}.js'],
    exclude: ['e2e/**/*'],
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'node_modules/',
        'test/',
        'docs/',
        'sandbox/',
        '**/*.config.js',
        'src/**/*.test.js'
      ],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90
      }
    }
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  optimizeDeps: {
    exclude: ['playwright-core', 'playwright']
  }
})