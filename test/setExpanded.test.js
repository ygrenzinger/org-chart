import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('setExpanded() method', () => {
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

  test('should expand collapsed node', () => {
    chart.render();
    
    // First collapse a node
    chart.setExpanded(2, false); // Collapse CTO node
    
    const chartState = chart.getChartState();
    const ctoNode = chartState.data.find(node => node.id === 2);
    expect(ctoNode._expanded).toBe(false);
    
    // Now expand it
    chart.setExpanded(2, true);
    
    const updatedState = chart.getChartState();
    const expandedCtoNode = updatedState.data.find(node => node.id === 2);
    expect(expandedCtoNode._expanded).toBe(true);
  });

  test('should collapse expanded node', () => {
    chart.render();
    
    // Ensure node is initially expanded
    chart.setExpanded(2, true);
    
    let chartState = chart.getChartState();
    let ctoNode = chartState.data.find(node => node.id === 2);
    expect(ctoNode._expanded).toBe(true);
    
    // Now collapse it
    chart.setExpanded(2, false);
    
    chartState = chart.getChartState();
    ctoNode = chartState.data.find(node => node.id === 2);
    expect(ctoNode._expanded).toBe(false);
  });

  test('should handle invalid node ID', () => {
    chart.render();
    
    const consoleSpy = vi.spyOn(console, 'log');
    
    // Try to expand a non-existent node
    chart.setExpanded(9999, true);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  test('should default to true when expandedFlag not provided', () => {
    chart.render();
    
    // First collapse the node
    chart.setExpanded(2, false);
    
    let chartState = chart.getChartState();
    let ctoNode = chartState.data.find(node => node.id === 2);
    expect(ctoNode._expanded).toBe(false);
    
    // Call setExpanded without second parameter (should default to true)
    chart.setExpanded(2);
    
    chartState = chart.getChartState();
    ctoNode = chartState.data.find(node => node.id === 2);
    expect(ctoNode._expanded).toBe(true);
  });

  test('should return chart instance for method chaining', () => {
    chart.render();
    
    const result = chart.setExpanded(2, true);
    expect(result).toBe(chart);
  });

  test('should update visual representation after expansion', () => {
    chart.render();
    
    // Collapse a node first
    chart.setExpanded(2, false);
    
    // Expand it and verify chart updates
    chart.setExpanded(2, true);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Verify the node's expanded state in data
    const chartState = chart.getChartState();
    const expandedNode = chartState.data.find(node => node.id === 2);
    expect(expandedNode._expanded).toBe(true);
  });

  test('should handle expansion of leaf nodes', () => {
    chart.render();
    
    // Try to expand a leaf node (no children)
    chart.setExpanded(6, true); // Senior Dev has no children
    
    const chartState = chart.getChartState();
    const leafNode = chartState.data.find(node => node.id === 6);
    
    // Should still set the _expanded property even for leaf nodes
    expect(leafNode._expanded).toBe(true);
  });

  test('should handle multiple expand/collapse operations', () => {
    chart.render();
    
    // Perform multiple operations
    chart.setExpanded(2, false); // Collapse CTO
    chart.setExpanded(4, false); // Collapse Dev Manager
    chart.setExpanded(2, true);  // Expand CTO again
    
    const chartState = chart.getChartState();
    const ctoNode = chartState.data.find(node => node.id === 2);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    
    expect(ctoNode._expanded).toBe(true);
    expect(devManagerNode._expanded).toBe(false);
  });

  test('should maintain state consistency after expand/collapse', () => {
    chart.render();
    
    const initialState = chart.getChartState();
    const initialDataLength = initialState.data.length;
    
    // Perform expand/collapse operations
    chart.setExpanded(2, false);
    chart.setExpanded(2, true);
    
    const finalState = chart.getChartState();
    
    // Data length should remain the same
    expect(finalState.data.length).toBe(initialDataLength);
    
    // All nodes should still be present
    initialState.data.forEach(originalNode => {
      const finalNode = finalState.data.find(node => node.id === originalNode.id);
      expect(finalNode).toBeTruthy();
    });
  });
});