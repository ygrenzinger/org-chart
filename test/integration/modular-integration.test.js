import { describe, test, expect, beforeEach } from 'vitest';
import { OrgChart } from '../../src/index.js';
import { mockHierarchicalData } from '../fixtures/mockData.js';

describe('Modular Integration', () => {
  let chart;
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="chart-container"></div>';
    container = '#chart-container';
    
    chart = new OrgChart()
      .container(container)
      .data(mockHierarchicalData)
      .svgWidth(800)
      .svgHeight(600);
  });

  test('should maintain backward compatibility', () => {
    // Test that all original methods still exist and work
    expect(typeof chart.render).toBe('function');
    expect(typeof chart.addNode).toBe('function');
    expect(typeof chart.removeNode).toBe('function');
    expect(typeof chart.setExpanded).toBe('function');
    expect(typeof chart.exportImg).toBe('function');
    
    // Test method chaining
    const result = chart.svgWidth(1000).svgHeight(800);
    expect(result).toBe(chart);
  });

  test('should render chart with modular architecture', () => {
    chart.render();
    
    const svg = document.querySelector('#chart-container svg');
    expect(svg).toBeTruthy();
    
    const nodes = document.querySelectorAll('.node');
    expect(nodes.length).toBeGreaterThan(0);
  });

  test('should handle node operations', () => {
    chart.render();
    
    const initialNodeCount = chart.getChartState().data.length;
    
    // Add node
    chart.addNode({ id: 'new-node', parentId: mockHierarchicalData[0].id, name: 'New Node' });
    expect(chart.getChartState().data.length).toBe(initialNodeCount + 1);
    
    // Remove node
    chart.removeNode('new-node');
    expect(chart.getChartState().data.length).toBe(initialNodeCount);
  });

  test('should handle zoom operations', () => {
    chart.render();
    
    // Test zoom methods don't throw errors
    expect(() => chart.zoomIn()).not.toThrow();
    expect(() => chart.zoomOut()).not.toThrow();
    expect(() => chart.fit()).not.toThrow();
  });
});