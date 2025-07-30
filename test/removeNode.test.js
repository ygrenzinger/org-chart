import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('removeNode() method', () => {
  let chart, container;

  beforeEach(() => {
    // Clean up any existing container first
    const existingContainer = document.getElementById('test-container');
    if (existingContainer && existingContainer.parentNode) {
      document.body.removeChild(existingContainer);
    }
    
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    document.body.appendChild(container);
    
    // Create a fresh copy of the mock data for each test
    const freshData = mockHierarchicalData.map(node => ({ ...node }));
    
    chart = new OrgChart()
      .container('#test-container')
      .data(freshData);
  });

  afterEach(() => {
    if (chart && typeof chart.clear === 'function') {
      chart.clear();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    chart = null;
    container = null;
  });

  test('should remove node and descendants', () => {
    chart.render();
    
    const initialDataLength = chart.getChartState().data.length;
    
    // Remove node with ID 2 (CTO) which has children (4, 5)
    // This should also remove nodes 4, 5, 6, 7 (all descendants)
    chart.removeNode(2);
    
    const chartState = chart.getChartState();
    
    // Should remove CTO (2), Dev Manager (4), QA Manager (5), Senior Dev (6), Junior Dev (7)
    expect(chartState.data.length).toBeLessThan(initialDataLength);
    
    // Verify the removed nodes are no longer in data
    const removedNodeIds = [2, 4, 5, 6, 7];
    removedNodeIds.forEach(id => {
      const node = chartState.data.find(node => node.id === id);
      expect(node).toBeUndefined();
    });
    
    // Verify remaining nodes are still there
    const remainingNodeIds = [1, 3]; // CEO and CFO
    remainingNodeIds.forEach(id => {
      const node = chartState.data.find(node => node.id === id);
      expect(node).toBeTruthy();
    });
  });

  test('should handle non-existent node ID', () => {
    chart.render();
    
    const consoleSpy = vi.spyOn(console, 'log');
    const initialDataLength = chart.getChartState().data.length;
    
    // Try to remove a node that doesn't exist
    chart.removeNode(9999);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    expect(chart.getChartState().data).toHaveLength(initialDataLength);
  });

  test('should update chart after removal', () => {
    chart.render();
    
    // Remove a leaf node (no children)
    chart.removeNode(6); // Senior Dev
    
    // Chart should re-render without the removed node
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Verify the chart state no longer contains the removed node
    const chartState = chart.getChartState();
    const removedNode = chartState.data.find(node => node.id === 6);
    expect(removedNode).toBeUndefined();
  });

  test('should maintain correct structure after removal', () => {
    chart.render();
    
    // Remove QA Manager (5) - a leaf node
    chart.removeNode(5);
    
    const chartState = chart.getChartState();
    
    // Verify QA Manager is removed
    const qaManager = chartState.data.find(node => node.id === 5);
    expect(qaManager).toBeUndefined();
    
    // Verify other nodes still exist
    const ceo = chartState.data.find(node => node.id === 1);
    const cto = chartState.data.find(node => node.id === 2);
    const cfo = chartState.data.find(node => node.id === 3);
    expect(ceo).toBeTruthy();
    expect(cto).toBeTruthy();
    expect(cfo).toBeTruthy();
  });

  test('should return chart instance for method chaining', () => {
    chart.render();
    
    const result = chart.removeNode(6);
    expect(result).toBe(chart);
  });

  test('should handle removing root node', () => {
    chart.render();
    
    // Remove root node (CEO)
    chart.removeNode(1);
    
    const chartState = chart.getChartState();
    
    // All nodes should be removed since root was removed
    expect(chartState.data).toHaveLength(0);
  });

  test('should handle removing node with single child', () => {
    chart.render();
    
    // Remove Dev Manager (4) which has children (6, 7)
    chart.removeNode(4);
    
    const chartState = chart.getChartState();
    
    // Should remove Dev Manager and its children
    const removedNodeIds = [4, 6, 7];
    removedNodeIds.forEach(id => {
      const node = chartState.data.find(node => node.id === id);
      expect(node).toBeUndefined();
    });
    
    // Verify other key nodes still exist
    const ceo = chartState.data.find(node => node.id === 1);
    const cto = chartState.data.find(node => node.id === 2);
    expect(ceo).toBeTruthy();
    expect(cto).toBeTruthy();
  });
});