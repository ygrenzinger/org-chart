// Test setup file for Vitest
import { vi, afterEach } from 'vitest'

// Mock console methods if needed
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Setup DOM globals
global.window = window
global.document = document
global.navigator = navigator

// Mock performance API if not available
if (!global.performance) {
  global.performance = {
    now: vi.fn(() => Date.now())
  }
}

// Polyfill SVG transform.baseVal for jsdom compatibility with D3
// This fixes the "Cannot read properties of undefined (reading 'baseVal')" error
if (typeof window !== 'undefined' && window.SVGElement) {
  // Mock SVGTransformList and SVGTransform for jsdom
  if (!window.SVGTransformList) {
    window.SVGTransformList = function() {
      this.numberOfItems = 0;
    };
    window.SVGTransformList.prototype.consolidate = function() {
      return null; // D3 handles null return gracefully
    };
  }

  // Polyfill the transform.baseVal property on SVG elements
  const originalCreateElementNS = document.createElementNS;
  document.createElementNS = function(namespaceURI, qualifiedName) {
    const element = originalCreateElementNS.call(this, namespaceURI, qualifiedName);

    if (namespaceURI === 'http://www.w3.org/2000/svg' && element.tagName) {
      // Add transform property with baseVal for SVG elements that support transforms
      const transformableElements = ['g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text', 'image', 'use'];
      if (transformableElements.includes(element.tagName.toLowerCase())) {
        if (!element.transform) {
          Object.defineProperty(element, 'transform', {
            value: {
              baseVal: new window.SVGTransformList()
            },
            writable: false,
            configurable: true
          });
        }
      }
    }

    return element;
  };
}

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks()
  
  // Clean up DOM
  document.body.innerHTML = ''
})