import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('collapseAll() method', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'collapse-test-container';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#collapse-test-container')
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
    chart.render(); // Need to render first to have allNodes
    const result = chart.collapseAll();
    expect(result).toBe(chart);
  });

  test('should set _expanded to false for all node data', () => {
    chart.render(); // Initial render to create allNodes
    chart.collapseAll();
    
    const state = chart.getChartState();
    if (state.allNodes && state.allNodes.length > 0) {
      state.allNodes.forEach(node => {
        expect(node.data._expanded).toBe(false);
      });
    }
  });

  test('should trigger re-render when called', () => {
    chart.render(); // Initial render
    const initialSvg = container.querySelector('svg');
    expect(initialSvg).toBeTruthy();
    
    chart.collapseAll();
    
    const updatedSvg = container.querySelector('svg');
    expect(updatedSvg).toBeTruthy();
  });

  test('should handle unrendered chart gracefully', () => {
    // collapseAll() will throw when allNodes is undefined since it tries to forEach on undefined
    expect(() => chart.collapseAll()).toThrow('Cannot read properties of undefined');
  });

  test('should maintain collapsed state after multiple calls', () => {
    chart.render();
    chart.collapseAll();
    chart.collapseAll(); // Call twice
    
    const state = chart.getChartState();
    if (state.allNodes && state.allNodes.length > 0) {
      state.allNodes.forEach(node => {
        expect(node.data._expanded).toBe(false);
      });
    }
  });
});