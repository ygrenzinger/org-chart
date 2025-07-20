import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
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
  }
})