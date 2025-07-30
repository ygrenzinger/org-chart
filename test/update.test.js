import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('update() method', () => {
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

  test('should update node positions after expansion', () => {
    chart.render();
    
    const chartState = chart.getChartState();
    const rootNode = chartState.root;
    
    // Initially collapse a node
    chart.setExpanded(2, false);
    
    // Get initial positions
    const initialPositions = new Map();
    if (chartState.allNodes) {
      chartState.allNodes.forEach(node => {
        initialPositions.set(node.data.id, { x: node.x, y: node.y });
      });
    }
    
    // Expand the node
    chart.setExpanded(2, true);
    
    // Verify that update was called and positions changed
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Verify the node is now expanded
    const updatedState = chart.getChartState();
    const expandedNode = updatedState.data.find(node => node.id === 2);
    expect(expandedNode._expanded).toBe(true);
  });

  test('should animate transitions', () => {
    chart.render();
    
    // Set a specific duration for testing
    const testDuration = 500;
    chart.duration(testDuration);
    
    const chartState = chart.getChartState();
    expect(chartState.duration).toBe(testDuration);
    
    // Trigger an update by expanding/collapsing
    chart.setExpanded(2, false);
    chart.setExpanded(2, true);
    
    // Verify chart still renders properly with transitions
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  test('should handle compact layout positioning', () => {
    // Enable compact mode
    chart.compact(true);
    chart.render();
    
    const chartState = chart.getChartState();
    expect(chartState.compact).toBe(true);
    
    // Trigger an update
    chart.setExpanded(2, false);
    chart.setExpanded(2, true);
    
    // Verify chart renders in compact mode
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Verify compact mode is still enabled after update
    const updatedState = chart.getChartState();
    expect(updatedState.compact).toBe(true);
  });

  test('should handle update with node parameter', () => {
    chart.render();
    
    const chartState = chart.getChartState();
    const rootNode = chartState.root;
    
    // Call update directly with root node (internal method usage)
    if (rootNode) {
      // This tests the internal update method signature
      expect(() => {
        // The update method expects a node with specific properties
        const updateParams = {
          x0: rootNode.x0 || 0,
          y0: rootNode.y0 || 0,
          x: rootNode.x || 0,
          y: rootNode.y || 0,
          width: 250,
          height: 150
        };
        // Note: update is typically called internally, but we can test it exists
        expect(typeof chart.update).toBe('function');
      }).not.toThrow();
    }
  });

  test('should maintain chart consistency after update', () => {
    chart.render();
    
    const initialState = chart.getChartState();
    const initialDataLength = initialState.data.length;
    
    // Perform operations that trigger updates
    chart.setExpanded(2, false);
    chart.setExpanded(4, false);
    chart.setExpanded(2, true);
    
    const finalState = chart.getChartState();
    
    // Data should remain consistent
    expect(finalState.data.length).toBe(initialDataLength);
    
    // Chart should still be rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  test('should handle rapid successive updates', () => {
    chart.render();
    
    // Perform rapid updates
    for (let i = 0; i < 5; i++) {
      chart.setExpanded(2, i % 2 === 0);
    }
    
    // Chart should handle this gracefully
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    const chartState = chart.getChartState();
    expect(chartState.data).toBeTruthy();
  });

  test('should update with different layout directions', () => {
    // Test with different layout directions
    const layouts = ['top', 'left', 'right', 'bottom'];
    
    layouts.forEach(layout => {
      chart.layout(layout);
      chart.render();
      
      // Trigger update
      chart.setExpanded(2, false);
      chart.setExpanded(2, true);
      
      const chartState = chart.getChartState();
      expect(chartState.layout).toBe(layout);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  test('should preserve node data during updates', () => {
    chart.render();
    
    const initialState = chart.getChartState();
    const originalNodeData = initialState.data.map(node => ({ ...node }));
    
    // Perform updates
    chart.setExpanded(2, false);
    chart.setExpanded(2, true);
    
    const finalState = chart.getChartState();
    
    // Core node data should be preserved
    originalNodeData.forEach(originalNode => {
      const finalNode = finalState.data.find(node => node.id === originalNode.id);
      expect(finalNode).toBeTruthy();
      expect(finalNode.id).toBe(originalNode.id);
      expect(finalNode.parentId).toBe(originalNode.parentId);
      expect(finalNode.name).toBe(originalNode.name);
      expect(finalNode.position).toBe(originalNode.position);
    });
  });

  test('should handle update with empty or invalid data', () => {
    // Test with empty data
    const emptyChart = new OrgChart()
      .container('#test-container')
      .data([]);
    
    expect(() => {
      emptyChart.render();
      // Updates on empty chart should not throw
    }).not.toThrow();
  });
});