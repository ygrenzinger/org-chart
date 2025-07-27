import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('render() method', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
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

  test('should handle empty data gracefully', () => {
    chart.data([]);
    const consoleSpy = vi.spyOn(console, 'log');
    
    chart.render();
    
    expect(consoleSpy).toHaveBeenCalledWith('ORG CHART - Data is empty');
    expect(container.querySelector('svg')).toBeFalsy();
  });

  test('should handle null data gracefully', () => {
    chart.data(null);
    const consoleSpy = vi.spyOn(console, 'log');
    
    chart.render();
    
    expect(consoleSpy).toHaveBeenCalledWith('ORG CHART - Data is empty');
  });

  test('should return chart instance for method chaining', () => {
    const result = chart.render();
    expect(result).toBe(chart);
  });

  test('should create SVG element when rendering with valid data', () => {
    chart.render();
    
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).toBe('800');
  });

  test('should update chart on re-render', () => {
    chart.render();
    const initialSvg = container.querySelector('svg');
    expect(initialSvg).toBeTruthy();
    
    // Change data and re-render
    chart.data([...mockHierarchicalData, { id: 999, parentId: 1, name: 'New Node' }]);
    chart.render();
    
    const updatedSvg = container.querySelector('svg');
    expect(updatedSvg).toBeTruthy();
  });
});