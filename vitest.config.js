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
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js'],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90
      }
    }
  },
  optimizeDeps: {
    exclude: ['playwright-core', 'playwright']
  }
})