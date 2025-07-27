import { describe, test, expect } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('clear() method', () => {
  test('should remove all SVG elements', () => {
    const container = document.createElement('div');
    container.id = 'clear-test-container';
    document.body.appendChild(container);
    
    const chart = new OrgChart()
      .container(container)
      .data(mockHierarchicalData)
      .render();
    
    expect(container.querySelector('svg')).toBeTruthy();
    
    chart.clear();
    
    expect(container.querySelector('svg')).toBeFalsy();
    
    document.body.removeChild(container);
  });

  test('should return chart instance for method chaining', () => {
    const chart = new OrgChart();
    const result = chart.clear();
    expect(result).toBe(chart);
  });

  test('should handle clearing when no chart is rendered', () => {
    const chart = new OrgChart();
    expect(() => chart.clear()).not.toThrow();
  });
});