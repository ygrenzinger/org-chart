import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('Diagonal Functions', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#test-container')
      .data(mockHierarchicalData);
  });

  afterEach(() => {
    if (chart && typeof chart.clear === 'function') {
      chart.clear();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  test('should have diagonal functions accessible on chart instance', () => {
    expect(typeof chart.diagonal).toBe('function');
    expect(typeof chart.hdiagonal).toBe('function');
  });

  test('should generate valid diagonal path for top layout', () => {
    chart.layout('top').render();
    
    const source = { x: 100, y: 100 };
    const target = { x: 200, y: 200 };
    
    const path = chart.diagonal(source, target);
    
    expect(typeof path).toBe('string');
    expect(path.length).toBeGreaterThan(0);
    expect(path.trim()).toMatch(/^M/); // Should start with moveTo
    expect(path).toContain('L'); // Should contain lineTo commands
  });

  test('should generate valid horizontal diagonal path for left layout', () => {
    chart.layout('left').render();
    
    const source = { x: 100, y: 100 };
    const target = { x: 200, y: 200 };
    
    const path = chart.hdiagonal(source, target);
    
    expect(typeof path).toBe('string');
    expect(path.length).toBeGreaterThan(0);
    expect(path.trim()).toMatch(/^M/); // Should start with moveTo
    expect(path).toContain('L'); // Should contain lineTo commands
  });

  test('should use correct diagonal function for each layout', () => {
    const layouts = ['top', 'bottom', 'left', 'right'];
    
    layouts.forEach(layout => {
      chart.layout(layout).render();
      
      const state = chart.getChartState();
      const layoutBindings = state.layoutBindings[layout];
      
      expect(typeof layoutBindings.diagonal).toBe('function');
      
      // Test that diagonal function works
      const source = { x: 0, y: 0 };
      const target = { x: 100, y: 100 };
      const path = layoutBindings.diagonal(source, target);
      
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
    });
  });
});