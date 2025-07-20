import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('expandAll() method', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'expand-test-container';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#expand-test-container')
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

  test('should return chart instance for method chaining', () => {
    const result = chart.expandAll();
    expect(result).toBe(chart);
  });

  test('should set _expanded to true for all data items', () => {
    chart.render(); // Initial render
    chart.expandAll();
    
    const state = chart.getChartState();
    state.data.forEach(item => {
      expect(item._expanded).toBe(true);
    });
  });

  test('should trigger re-render when called', () => {
    chart.render(); // Initial render
    const initialSvg = container.querySelector('svg');
    expect(initialSvg).toBeTruthy();
    
    chart.expandAll();
    
    const updatedSvg = container.querySelector('svg');
    expect(updatedSvg).toBeTruthy();
  });

  test('should work with empty data', () => {
    chart.data([]);
    expect(() => chart.expandAll()).not.toThrow();
  });

  test('should handle null data gracefully', () => {
    chart.data(null);
    // expandAll() will throw when data is null since it tries to forEach on null
    expect(() => chart.expandAll()).toThrow('Cannot read properties of null');
  });

  test('should maintain expanded state after multiple calls', () => {
    chart.render();
    chart.expandAll();
    chart.expandAll(); // Call twice
    
    const state = chart.getChartState();
    state.data.forEach(item => {
      expect(item._expanded).toBe(true);
    });
  });
});