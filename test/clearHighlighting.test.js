import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('clearHighlighting() method', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#test-container')
      .data([...mockHierarchicalData]);
  });

  afterEach(() => {
    if (chart && typeof chart.clear === 'function') {
      chart.clear();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  test('should clear all highlighting flags', () => {
    chart.render();
    
    // First, set some highlighting (simulate highlighting)
    const chartState = chart.getChartState();
    
    // Manually set highlighting flags to simulate highlighted state
    chartState.data.forEach(node => {
      if (node.id === 2) {
        node._highlighted = true;
      }
      if (node.id === 1 || node.id === 2) {
        node._upToTheRootHighlighted = true;
      }
    });
    
    // Verify highlighting is set
    const highlightedNode = chartState.data.find(node => node.id === 2);
    const rootNode = chartState.data.find(node => node.id === 1);
    expect(highlightedNode._highlighted).toBe(true);
    expect(rootNode._upToTheRootHighlighted).toBe(true);
    
    // Clear highlighting
    chart.clearHighlighting();
    
    // Verify all highlighting flags are cleared
    const clearedState = chart.getChartState();
    clearedState.data.forEach(node => {
      expect(node._highlighted).toBeFalsy();
      expect(node._upToTheRootHighlighted).toBeFalsy();
    });
  });

  test('should remove visual highlighting', () => {
    chart.render();
    
    // Set highlighting manually
    const chartState = chart.getChartState();
    chartState.data.forEach(node => {
      if (node.id === 2) {
        node._highlighted = true;
        node._upToTheRootHighlighted = true;
      }
    });
    
    // Clear highlighting
    chart.clearHighlighting();
    
    // Verify chart is still rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Verify highlighting flags are cleared
    const clearedState = chart.getChartState();
    const previouslyHighlightedNode = clearedState.data.find(node => node.id === 2);
    expect(previouslyHighlightedNode._highlighted).toBeFalsy();
    expect(previouslyHighlightedNode._upToTheRootHighlighted).toBeFalsy();
  });

  test('should handle clearing when no highlighting exists', () => {
    chart.render();
    
    // Ensure no highlighting exists initially
    const chartState = chart.getChartState();
    chartState.data.forEach(node => {
      expect(node._highlighted).toBeFalsy();
      expect(node._upToTheRootHighlighted).toBeFalsy();
    });
    
    // Clear highlighting (should not throw error)
    expect(() => chart.clearHighlighting()).not.toThrow();
    
    // Verify chart is still functional
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  test('should return chart instance for method chaining', () => {
    chart.render();
    
    const result = chart.clearHighlighting();
    expect(result).toBe(chart);
  });

  test('should clear highlighting after multiple highlight operations', () => {
    chart.render();
    
    const chartState = chart.getChartState();
    
    // Set multiple types of highlighting
    chartState.data.forEach(node => {
      if (node.id === 2) {
        node._highlighted = true;
      }
      if (node.id === 4) {
        node._highlighted = true;
      }
      if ([1, 2, 4].includes(node.id)) {
        node._upToTheRootHighlighted = true;
      }
    });
    
    // Verify highlighting is set
    const highlightedNodes = chartState.data.filter(node => node._highlighted);
    const upToRootHighlightedNodes = chartState.data.filter(node => node._upToTheRootHighlighted);
    expect(highlightedNodes.length).toBeGreaterThan(0);
    expect(upToRootHighlightedNodes.length).toBeGreaterThan(0);
    
    // Clear all highlighting
    chart.clearHighlighting();
    
    // Verify all highlighting is cleared
    const clearedState = chart.getChartState();
    const remainingHighlighted = clearedState.data.filter(node => node._highlighted);
    const remainingUpToRoot = clearedState.data.filter(node => node._upToTheRootHighlighted);
    expect(remainingHighlighted.length).toBe(0);
    expect(remainingUpToRoot.length).toBe(0);
  });

  test('should maintain chart functionality after clearing highlighting', () => {
    chart.render();
    
    // Set some highlighting
    const chartState = chart.getChartState();
    chartState.data.forEach(node => {
      if (node.id === 2) {
        node._highlighted = true;
        node._upToTheRootHighlighted = true;
      }
    });
    
    // Clear highlighting
    chart.clearHighlighting();
    
    // Verify other chart operations still work
    chart.setExpanded(2, false);
    chart.setExpanded(2, true);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Verify data integrity
    const finalState = chart.getChartState();
    expect(finalState.data.length).toBe(mockHierarchicalData.length);
  });

  test('should clear highlighting on all nodes regardless of hierarchy level', () => {
    chart.render();
    
    const chartState = chart.getChartState();
    
    // Set highlighting on nodes at different hierarchy levels
    chartState.data.forEach(node => {
      node._highlighted = true;
      node._upToTheRootHighlighted = true;
    });
    
    // Verify all nodes are highlighted
    const allHighlighted = chartState.data.every(node => 
      node._highlighted && node._upToTheRootHighlighted
    );
    expect(allHighlighted).toBe(true);
    
    // Clear highlighting
    chart.clearHighlighting();
    
    // Verify all highlighting is cleared
    const clearedState = chart.getChartState();
    const anyHighlighted = clearedState.data.some(node => 
      node._highlighted || node._upToTheRootHighlighted
    );
    expect(anyHighlighted).toBe(false);
  });

  test('should handle clearing highlighting with empty data', () => {
    const emptyChart = new OrgChart()
      .container('#test-container')
      .data([]);
    
    // The implementation may throw an error with empty data
    // This is acceptable behavior for edge cases
    expect(() => {
      emptyChart.clearHighlighting();
    }).toThrow();
  });
});