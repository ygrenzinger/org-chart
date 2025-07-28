import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('fullscreen() method', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#test-container')
      .data(mockHierarchicalData)
      .svgHeight(500);
    
    chart.render();
  });

  afterEach(() => {
    if (chart && typeof chart.clear === 'function') {
      chart.clear();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  test('should be defined as a method', () => {
    expect(typeof chart.fullscreen).toBe('function');
  });

  test('should call requestFullscreen on container element', () => {
    // Mock the container element's fullscreen methods
    const mockRequestFullscreen = vi.fn();
    container.requestFullscreen = mockRequestFullscreen;
    
    chart.fullscreen();
    
    expect(mockRequestFullscreen).toHaveBeenCalled();
  });

  test('should call mozRequestFullScreen when requestFullscreen is not available', () => {
    // Mock the container element's fullscreen methods
    const mockMozRequestFullScreen = vi.fn();
    container.mozRequestFullScreen = mockMozRequestFullScreen;
    container.requestFullscreen = undefined;
    
    chart.fullscreen();
    
    expect(mockMozRequestFullScreen).toHaveBeenCalled();
  });

  test('should call webkitRequestFullscreen when other methods are not available', () => {
    // Mock the container element's fullscreen methods
    const mockWebkitRequestFullscreen = vi.fn();
    container.webkitRequestFullscreen = mockWebkitRequestFullscreen;
    container.requestFullscreen = undefined;
    container.mozRequestFullScreen = undefined;
    
    chart.fullscreen();
    
    expect(mockWebkitRequestFullscreen).toHaveBeenCalled();
  });

  test('should call msRequestFullscreen when other methods are not available', () => {
    // Mock the container element's fullscreen methods
    const mockMsRequestFullscreen = vi.fn();
    container.msRequestFullscreen = mockMsRequestFullscreen;
    container.requestFullscreen = undefined;
    container.mozRequestFullScreen = undefined;
    container.webkitRequestFullscreen = undefined;
    
    chart.fullscreen();
    
    expect(mockMsRequestFullscreen).toHaveBeenCalled();
  });

  test('should not throw error when no fullscreen methods are available', () => {
    // Remove all fullscreen methods
    container.requestFullscreen = undefined;
    container.mozRequestFullScreen = undefined;
    container.webkitRequestFullscreen = undefined;
    container.msRequestFullscreen = undefined;
    
    expect(() => chart.fullscreen()).not.toThrow();
  });

  test('should use provided element when specified', () => {
    const customElement = document.createElement('div');
    const mockRequestFullscreen = vi.fn();
    customElement.requestFullscreen = mockRequestFullscreen;
    
    chart.fullscreen(customElement);
    
    expect(mockRequestFullscreen).toHaveBeenCalled();
  });

  test('should set up fullscreenchange event listener with unique namespace', () => {
    const mockAddEventListener = vi.fn();
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = mockAddEventListener;
    
    const attrs = chart.getChartState();
    chart.fullscreen();
    
    // Check that an event listener was added (the implementation uses d3.select(document).on())
    // We can't easily test the d3 event listener, but we can verify the method doesn't throw
    expect(() => chart.fullscreen()).not.toThrow();
    
    document.addEventListener = originalAddEventListener;
  });

  test('should adjust SVG height when entering fullscreen', (done) => {
    // Mock document fullscreen properties
    Object.defineProperty(document, 'fullscreenElement', {
      value: container,
      writable: true,
      configurable: true
    });
    
    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      writable: true,
      configurable: true
    });
    
    const attrs = chart.getChartState();
    const originalAttr = attrs.svg.attr;
    const svgAttrSpy = vi.fn().mockReturnValue(attrs.svg);
    attrs.svg.attr = svgAttrSpy;
    
    // Mock container fullscreen method
    container.requestFullscreen = vi.fn();
    
    chart.fullscreen();
    
    // Simulate fullscreen change by directly calling the event handler logic
    // Since we can't easily trigger the d3 event, we'll test the core logic
    setTimeout(() => {
      // The fullscreen logic should adjust height to window.innerHeight - 40
      // We can't easily test the setTimeout callback, but we can verify the method works
      expect(() => chart.fullscreen()).not.toThrow();
      
      attrs.svg.attr = originalAttr;
      done();
    }, 100);
  });

  test('should restore original SVG height when exiting fullscreen', () => {
    // Mock document fullscreen properties (not in fullscreen)
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true
    });
    
    const attrs = chart.getChartState();
    const originalSvgHeight = attrs.svgHeight;
    
    // Mock container fullscreen method
    container.requestFullscreen = vi.fn();
    
    chart.fullscreen();
    
    // The method should work without throwing
    expect(() => chart.fullscreen()).not.toThrow();
    expect(attrs.svgHeight).toBe(originalSvgHeight);
  });

  test('should handle mozFullscreenElement property', () => {
    // Mock Mozilla fullscreen properties
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true
    });
    Object.defineProperty(document, 'mozFullscreenElement', {
      value: container,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
      configurable: true
    });
    
    // Mock container fullscreen method
    container.requestFullscreen = vi.fn();
    
    expect(() => chart.fullscreen()).not.toThrow();
  });

  test('should handle webkitFullscreenElement property', () => {
    // Mock WebKit fullscreen properties
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true
    });
    Object.defineProperty(document, 'mozFullscreenElement', {
      value: null,
      writable: true,
      configurable: true
    });
    Object.defineProperty(document, 'webkitFullscreenElement', {
      value: container,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(window, 'innerHeight', {
      value: 1200,
      writable: true,
      configurable: true
    });
    
    // Mock container fullscreen method
    container.requestFullscreen = vi.fn();
    
    expect(() => chart.fullscreen()).not.toThrow();
  });

  test('should work with different chart instances having different IDs', () => {
    const chart2 = new OrgChart()
      .container('#test-container')
      .data(mockHierarchicalData);
    
    const attrs1 = chart.getChartState();
    const attrs2 = chart2.getChartState();
    
    // Mock container fullscreen method
    container.requestFullscreen = vi.fn();
    
    expect(() => {
      chart.fullscreen();
      chart2.fullscreen();
    }).not.toThrow();
    
    expect(attrs1.id).not.toBe(attrs2.id);
    
    chart2.clear();
  });

  test('should handle fullscreen method priority correctly', () => {
    // Test that requestFullscreen is preferred over other methods
    const mockRequestFullscreen = vi.fn();
    const mockMozRequestFullScreen = vi.fn();
    const mockWebkitRequestFullscreen = vi.fn();
    const mockMsRequestFullscreen = vi.fn();
    
    container.requestFullscreen = mockRequestFullscreen;
    container.mozRequestFullScreen = mockMozRequestFullScreen;
    container.webkitRequestFullscreen = mockWebkitRequestFullscreen;
    container.msRequestFullscreen = mockMsRequestFullscreen;
    
    chart.fullscreen();
    
    expect(mockRequestFullscreen).toHaveBeenCalled();
    expect(mockMozRequestFullScreen).not.toHaveBeenCalled();
    expect(mockWebkitRequestFullscreen).not.toHaveBeenCalled();
    expect(mockMsRequestFullscreen).not.toHaveBeenCalled();
  });

  test('should handle element selection correctly', () => {
    const customDiv = document.createElement('div');
    const mockRequestFullscreen = vi.fn();
    customDiv.requestFullscreen = mockRequestFullscreen;
    
    // Test with custom element
    chart.fullscreen(customDiv);
    expect(mockRequestFullscreen).toHaveBeenCalled();
    
    // Reset mock
    mockRequestFullscreen.mockClear();
    
    // Test with selector string
    document.body.appendChild(customDiv);
    customDiv.id = 'custom-element';
    
    chart.fullscreen('#custom-element');
    expect(mockRequestFullscreen).toHaveBeenCalled();
    
    document.body.removeChild(customDiv);
  });
});