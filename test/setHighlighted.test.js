import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('setHighlighted() method', () => {
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

  test('should set node as highlighted', () => {
    chart.render();
    
    // Set node as highlighted
    chart.setHighlighted(2); // CTO node
    
    const chartState = chart.getChartState();
    const highlightedNode = chartState.data.find(node => node.id === 2);
    expect(highlightedNode._highlighted).toBe(true);
  });

  test('should set node as centered when highlighted', () => {
    chart.render();
    
    // Set node as highlighted
    chart.setHighlighted(2); // CTO node
    
    const chartState = chart.getChartState();
    const highlightedNode = chartState.data.find(node => node.id === 2);
    expect(highlightedNode._centered).toBe(true);
  });

  test('should set node as expanded when highlighted', () => {
    chart.render();
    
    // First collapse the node
    chart.setExpanded(2, false);
    
    let chartState = chart.getChartState();
    let ctoNode = chartState.data.find(node => node.id === 2);
    expect(ctoNode._expanded).toBe(false);
    
    // Set node as highlighted
    chart.setHighlighted(2); // CTO node
    
    chartState = chart.getChartState();
    ctoNode = chartState.data.find(node => node.id === 2);
    expect(ctoNode._expanded).toBe(true);
  });

  test('should expand ancestors of highlighted node', () => {
    chart.render();
    
    // First collapse some nodes to test expansion
    chart.setExpanded(2, false); // Collapse CTO
    chart.setExpanded(4, false); // Collapse Dev Manager
    
    // Set deep node as highlighted
    chart.setHighlighted(6); // Senior Dev (child of Dev Manager, grandchild of CTO)
    
    const chartState = chart.getChartState();
    const ctoNode = chartState.data.find(node => node.id === 2);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const seniorDevNode = chartState.data.find(node => node.id === 6);
    
    // All ancestors should be expanded
    expect(ctoNode._expanded).toBe(true);
    expect(devManagerNode._expanded).toBe(true);
    expect(seniorDevNode._highlighted).toBe(true);
    expect(seniorDevNode._expanded).toBe(true);
    expect(seniorDevNode._centered).toBe(true);
  });

  test('should handle invalid node ID', () => {
    chart.render();
    
    const consoleSpy = vi.spyOn(console, 'log');
    
    // Try to highlight a non-existent node
    chart.setHighlighted(9999);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  test('should handle string node ID', () => {
    chart.render();
    
    // Set node as highlighted using string ID
    chart.setHighlighted('2');
    
    const chartState = chart.getChartState();
    const highlightedNode = chartState.data.find(node => node.id === 2);
    expect(highlightedNode._highlighted).toBe(true);
    expect(highlightedNode._centered).toBe(true);
    expect(highlightedNode._expanded).toBe(true);
  });

  test('should return chart instance for method chaining', () => {
    chart.render();
    
    const result = chart.setHighlighted(2);
    expect(result).toBe(chart);
  });

  test('should update visual representation after highlighting', () => {
    chart.render();
    
    // Highlight a node
    chart.setHighlighted(2);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Verify the node's highlighted state in data
    const chartState = chart.getChartState();
    const highlightedNode = chartState.data.find(node => node.id === 2);
    expect(highlightedNode._highlighted).toBe(true);
    expect(highlightedNode._centered).toBe(true);
    expect(highlightedNode._expanded).toBe(true);
  });

  test('should handle highlighting root node', () => {
    chart.render();
    
    // Highlight the root node
    chart.setHighlighted(1); // CEO node
    
    const chartState = chart.getChartState();
    const rootNode = chartState.data.find(node => node.id === 1);
    expect(rootNode._highlighted).toBe(true);
    expect(rootNode._centered).toBe(true);
    expect(rootNode._expanded).toBe(true);
  });

  test('should handle highlighting leaf node', () => {
    chart.render();
    
    // Highlight a leaf node (no children)
    chart.setHighlighted(6); // Senior Dev has no children
    
    const chartState = chart.getChartState();
    const leafNode = chartState.data.find(node => node.id === 6);
    expect(leafNode._highlighted).toBe(true);
    expect(leafNode._centered).toBe(true);
    expect(leafNode._expanded).toBe(true);
    
    // Verify ancestors are expanded
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    expect(devManagerNode._expanded).toBe(true);
    expect(ctoNode._expanded).toBe(true);
  });

  test('should allow multiple nodes to be highlighted (implementation behavior)', () => {
    chart.render();
    
    // Set multiple nodes as highlighted sequentially
    chart.setHighlighted(2); // CTO
    chart.setHighlighted(3); // CFO
    chart.setHighlighted(4); // Dev Manager
    
    const chartState = chart.getChartState();
    const highlightedNodes = chartState.data.filter(node => node._highlighted);
    
    // Should have at least the 3 nodes we explicitly highlighted
    expect(highlightedNodes.length).toBeGreaterThanOrEqual(3);
    
    // The explicitly highlighted nodes should be present
    const explicitlyHighlighted = highlightedNodes.filter(n => [2, 3, 4].includes(n.id));
    expect(explicitlyHighlighted.length).toBe(3);
    
    // All explicitly highlighted should also be centered and expanded
    explicitlyHighlighted.forEach(node => {
      expect(node._centered).toBe(true);
      expect(node._expanded).toBe(true);
    });
  });

  test('should handle highlighting with collapsed ancestors', () => {
    chart.render();
    
    // Collapse all nodes first
    chart.collapseAll();
    
    // Highlight a deep node
    chart.setHighlighted(7); // Junior Dev
    
    const chartState = chart.getChartState();
    const juniorDevNode = chartState.data.find(node => node.id === 7);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const ceoNode = chartState.data.find(node => node.id === 1);
    
    // Highlighted node should be marked as highlighted, centered, and expanded
    expect(juniorDevNode._highlighted).toBe(true);
    expect(juniorDevNode._centered).toBe(true);
    expect(juniorDevNode._expanded).toBe(true);
    
    // All ancestors should be expanded
    expect(devManagerNode._expanded).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(ceoNode._expanded).toBe(true);
  });

  test('should maintain state consistency after highlighting', () => {
    chart.render();
    
    const initialState = chart.getChartState();
    const initialDataLength = initialState.data.length;
    
    // Perform highlighting operation
    chart.setHighlighted(4);
    
    const finalState = chart.getChartState();
    
    // Data length should remain the same
    expect(finalState.data.length).toBe(initialDataLength);
    
    // All nodes should still be present
    initialState.data.forEach(originalNode => {
      const finalNode = finalState.data.find(node => node.id === originalNode.id);
      expect(finalNode).toBeTruthy();
    });
  });

  test('should handle highlighting after other operations', () => {
    chart.render();
    
    // Perform various operations first
    chart.setExpanded(2, false);
    chart.setExpanded(3, false);
    chart.setCentered(5);
    
    // Then highlight a node
    chart.setHighlighted(6);
    
    const chartState = chart.getChartState();
    const highlightedNode = chartState.data.find(node => node.id === 6);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    
    expect(highlightedNode._highlighted).toBe(true);
    expect(highlightedNode._centered).toBe(true);
    expect(highlightedNode._expanded).toBe(true);
    expect(devManagerNode._expanded).toBe(true);
    expect(ctoNode._expanded).toBe(true);
  });

  test('should work with custom node ID accessors', () => {
    // Create chart with custom nodeId accessor
    const customChart = new OrgChart()
      .container('#test-container')
      .nodeId(d => d.customId)
      .data([
        { customId: 'A', parentId: null, name: 'Root' },
        { customId: 'B', parentId: 'A', name: 'Child' },
        { customId: 'C', parentId: 'B', name: 'Grandchild' }
      ]);
    
    customChart.render();
    
    // Highlight node using custom ID
    customChart.setHighlighted('C');
    
    const chartState = customChart.getChartState();
    const highlightedNode = chartState.data.find(node => node.customId === 'C');
    const parentNode = chartState.data.find(node => node.customId === 'B');
    const rootNode = chartState.data.find(node => node.customId === 'A');
    
    expect(highlightedNode._highlighted).toBe(true);
    expect(highlightedNode._centered).toBe(true);
    expect(highlightedNode._expanded).toBe(true);
    expect(parentNode._expanded).toBe(true);
    expect(rootNode._expanded).toBe(true);
    
    customChart.clear();
  });

  test('should work with clearHighlighting method', () => {
    chart.render();
    
    // Highlight multiple nodes
    chart.setHighlighted(2);
    chart.setHighlighted(4);
    chart.setHighlighted(6);
    
    let chartState = chart.getChartState();
    let highlightedNodes = chartState.data.filter(node => node._highlighted);
    
    // Should have at least the 3 nodes we explicitly highlighted
    expect(highlightedNodes.length).toBeGreaterThanOrEqual(3);
    
    // Verify the specific nodes we highlighted are present
    const explicitlyHighlighted = highlightedNodes.filter(n => [2, 4, 6].includes(n.id));
    expect(explicitlyHighlighted.length).toBe(3);
    
    // Clear highlighting
    chart.clearHighlighting();
    
    chartState = chart.getChartState();
    highlightedNodes = chartState.data.filter(node => node._highlighted);
    expect(highlightedNodes.length).toBe(0);
    
    // Verify no nodes have highlighting flags
    chartState.data.forEach(node => {
      expect(node._highlighted).toBeFalsy();
      expect(node._upToTheRootHighlighted).toBeFalsy();
    });
  });

  test('should handle highlighting same node multiple times', () => {
    chart.render();
    
    // Highlight the same node multiple times
    chart.setHighlighted(3);
    chart.setHighlighted(3);
    chart.setHighlighted(3);
    
    const chartState = chart.getChartState();
    const highlightedNode = chartState.data.find(node => node.id === 3);
    
    // Should still be highlighted, centered, and expanded
    expect(highlightedNode._highlighted).toBe(true);
    expect(highlightedNode._centered).toBe(true);
    expect(highlightedNode._expanded).toBe(true);
    
    // Should only have one highlighted node with this ID
    const allHighlightedNodes = chartState.data.filter(node => node._highlighted);
    const sameNodeHighlighted = allHighlightedNodes.filter(node => node.id === 3);
    expect(sameNodeHighlighted.length).toBe(1);
  });

  test('should handle highlighting nodes at different hierarchy levels', () => {
    chart.render();
    
    // Highlight nodes at different levels
    chart.setHighlighted(1); // Root level
    chart.setHighlighted(2); // Level 1
    chart.setHighlighted(4); // Level 2
    chart.setHighlighted(6); // Level 3 (leaf)
    
    const chartState = chart.getChartState();
    const highlightedNodes = chartState.data.filter(node => node._highlighted);
    
    // Should have at least the 4 nodes we explicitly highlighted
    expect(highlightedNodes.length).toBeGreaterThanOrEqual(4);
    
    // Verify the specific nodes we highlighted are present
    const explicitlyHighlighted = highlightedNodes.filter(n => [1, 2, 4, 6].includes(n.id));
    expect(explicitlyHighlighted.length).toBe(4);
    
    // All explicitly highlighted should be centered and expanded
    explicitlyHighlighted.forEach(node => {
      expect(node._centered).toBe(true);
      expect(node._expanded).toBe(true);
    });
  });

  test('should maintain highlighting after chart updates', () => {
    chart.render();
    
    // Highlight a node
    chart.setHighlighted(4);
    
    let chartState = chart.getChartState();
    let highlightedNode = chartState.data.find(node => node.id === 4);
    expect(highlightedNode._highlighted).toBe(true);
    expect(highlightedNode._centered).toBe(true);
    expect(highlightedNode._expanded).toBe(true);
    
    // Perform other operations that might trigger updates
    chart.setExpanded(2, false);
    chart.setExpanded(2, true);
    
    // Highlighting should persist
    chartState = chart.getChartState();
    highlightedNode = chartState.data.find(node => node.id === 4);
    expect(highlightedNode._highlighted).toBe(true);
    expect(highlightedNode._centered).toBe(true);
    // Note: _expanded might be affected by the setExpanded operations, so we don't test it here
  });
});