// Test setup file for Vitest browser mode
import { vi, afterEach } from 'vitest'

// Mock console methods if needed (in browser mode, console is already available)
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
}

console.log = vi.fn()
console.warn = vi.fn()
console.error = vi.fn()

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks()
  
  // Clean up DOM
  document.body.innerHTML = ''
})