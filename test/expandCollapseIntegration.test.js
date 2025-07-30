import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('expandAll() and collapseAll() integration', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'integration-test-container';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#integration-test-container')
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

  test('should support method chaining between expand and collapse', () => {
    chart.render();
    const result = chart.expandAll().collapseAll().expandAll();
    expect(result).toBe(chart);
  });

  test('should toggle states correctly when called in sequence', () => {
    chart.render();
    
    // First expand all
    chart.expandAll();
    const stateAfterExpand = chart.getChartState();
    stateAfterExpand.data.forEach(item => {
      expect(item._expanded).toBe(true);
    });
    
    // Then collapse all
    chart.collapseAll();
    const stateAfterCollapse = chart.getChartState();
    if (stateAfterCollapse.allNodes && stateAfterCollapse.allNodes.length > 0) {
      stateAfterCollapse.allNodes.forEach(node => {
        expect(node.data._expanded).toBe(false);
      });
    }
  });

  test('should work with complex hierarchical data', () => {
    // Use the mock data which has multiple levels: CEO -> CTO/CFO -> Dev Manager/QA Manager -> Senior/Junior Dev
    chart.render();
    
    expect(() => {
      chart.expandAll().collapseAll().expandAll();
    }).not.toThrow();
    
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});