import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('setUpToTheRootHighlighted() method', () => {
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

  test('should set node as upToTheRootHighlighted', () => {
    chart.render();
    
    // Set node as upToTheRootHighlighted
    chart.setUpToTheRootHighlighted(4); // Dev Manager node
    
    const chartState = chart.getChartState();
    const targetNode = chartState.data.find(node => node.id === 4);
    expect(targetNode._upToTheRootHighlighted).toBe(true);
  });

  test('should set node as expanded when upToTheRootHighlighted', () => {
    chart.render();
    
    // First collapse the node
    chart.setExpanded(4, false);
    
    let chartState = chart.getChartState();
    let devManagerNode = chartState.data.find(node => node.id === 4);
    expect(devManagerNode._expanded).toBe(false);
    
    // Set node as upToTheRootHighlighted
    chart.setUpToTheRootHighlighted(4); // Dev Manager node
    
    chartState = chart.getChartState();
    devManagerNode = chartState.data.find(node => node.id === 4);
    expect(devManagerNode._expanded).toBe(true);
  });

  test('should set all ancestors as upToTheRootHighlighted', () => {
    chart.render();
    
    // Set deep node as upToTheRootHighlighted
    chart.setUpToTheRootHighlighted(6); // Senior Dev (child of Dev Manager, grandchild of CTO)
    
    const chartState = chart.getChartState();
    const ceoNode = chartState.data.find(node => node.id === 1);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const seniorDevNode = chartState.data.find(node => node.id === 6);
    
    // Target node and all ancestors should be upToTheRootHighlighted
    expect(seniorDevNode._upToTheRootHighlighted).toBe(true);
    expect(devManagerNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
  });

  test('should expand all ancestors of upToTheRootHighlighted node', () => {
    chart.render();
    
    // First collapse some nodes to test expansion
    chart.setExpanded(2, false); // Collapse CTO
    chart.setExpanded(4, false); // Collapse Dev Manager
    
    // Set deep node as upToTheRootHighlighted
    chart.setUpToTheRootHighlighted(7); // Junior Dev (child of Dev Manager, grandchild of CTO)
    
    const chartState = chart.getChartState();
    const ceoNode = chartState.data.find(node => node.id === 1);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const juniorDevNode = chartState.data.find(node => node.id === 7);
    
    // All ancestors should be expanded
    expect(ceoNode._expanded).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(devManagerNode._expanded).toBe(true);
    expect(juniorDevNode._expanded).toBe(true);
    
    // All ancestors should be upToTheRootHighlighted
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(devManagerNode._upToTheRootHighlighted).toBe(true);
    expect(juniorDevNode._upToTheRootHighlighted).toBe(true);
  });

  test('should handle invalid node ID', () => {
    chart.render();
    
    const consoleSpy = vi.spyOn(console, 'log');
    
    // Try to highlight a non-existent node
    chart.setUpToTheRootHighlighted(9999);
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('HIGHLIGHTROOT - Node with id (9999) not found in the tree'));
  });

  test('should handle string node ID', () => {
    chart.render();
    
    // Set node as upToTheRootHighlighted using string ID
    chart.setUpToTheRootHighlighted('4');
    
    const chartState = chart.getChartState();
    const targetNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const ceoNode = chartState.data.find(node => node.id === 1);
    
    expect(targetNode._upToTheRootHighlighted).toBe(true);
    expect(targetNode._expanded).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._expanded).toBe(true);
  });

  test('should return chart instance for method chaining', () => {
    chart.render();
    
    const result = chart.setUpToTheRootHighlighted(2);
    expect(result).toBe(chart);
  });

  test('should handle upToTheRootHighlighting root node', () => {
    chart.render();
    
    // Highlight the root node
    chart.setUpToTheRootHighlighted(1); // CEO node
    
    const chartState = chart.getChartState();
    const rootNode = chartState.data.find(node => node.id === 1);
    expect(rootNode._upToTheRootHighlighted).toBe(true);
    expect(rootNode._expanded).toBe(true);
  });

  test('should handle upToTheRootHighlighting leaf node', () => {
    chart.render();
    
    // Highlight a leaf node (no children)
    chart.setUpToTheRootHighlighted(6); // Senior Dev has no children
    
    const chartState = chart.getChartState();
    const leafNode = chartState.data.find(node => node.id === 6);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const ceoNode = chartState.data.find(node => node.id === 1);
    
    expect(leafNode._upToTheRootHighlighted).toBe(true);
    expect(leafNode._expanded).toBe(true);
    
    // Verify ancestors are upToTheRootHighlighted and expanded
    expect(devManagerNode._upToTheRootHighlighted).toBe(true);
    expect(devManagerNode._expanded).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._expanded).toBe(true);
  });

  test('should allow multiple nodes to be upToTheRootHighlighted (implementation behavior)', () => {
    chart.render();
    
    // Set multiple nodes as upToTheRootHighlighted sequentially
    chart.setUpToTheRootHighlighted(6); // Senior Dev
    chart.setUpToTheRootHighlighted(7); // Junior Dev
    
    const chartState = chart.getChartState();
    const seniorDevNode = chartState.data.find(node => node.id === 6);
    const juniorDevNode = chartState.data.find(node => node.id === 7);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const ceoNode = chartState.data.find(node => node.id === 1);
    
    // Both target nodes should be upToTheRootHighlighted
    expect(seniorDevNode._upToTheRootHighlighted).toBe(true);
    expect(juniorDevNode._upToTheRootHighlighted).toBe(true);
    
    // Common ancestors should be upToTheRootHighlighted
    expect(devManagerNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    
    // All should be expanded
    expect(seniorDevNode._expanded).toBe(true);
    expect(juniorDevNode._expanded).toBe(true);
    expect(devManagerNode._expanded).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(ceoNode._expanded).toBe(true);
  });

  test('should handle upToTheRootHighlighting with collapsed ancestors', () => {
    chart.render();
    
    // Collapse all nodes first
    chart.collapseAll();
    
    // Highlight a deep node
    chart.setUpToTheRootHighlighted(7); // Junior Dev
    
    const chartState = chart.getChartState();
    const juniorDevNode = chartState.data.find(node => node.id === 7);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const ceoNode = chartState.data.find(node => node.id === 1);
    
    // Target node should be upToTheRootHighlighted and expanded
    expect(juniorDevNode._upToTheRootHighlighted).toBe(true);
    expect(juniorDevNode._expanded).toBe(true);
    
    // All ancestors should be upToTheRootHighlighted and expanded
    expect(devManagerNode._upToTheRootHighlighted).toBe(true);
    expect(devManagerNode._expanded).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._expanded).toBe(true);
  });

  test('should maintain state consistency after upToTheRootHighlighting', () => {
    chart.render();
    
    const initialState = chart.getChartState();
    const initialDataLength = initialState.data.length;
    
    // Perform upToTheRootHighlighting operation
    chart.setUpToTheRootHighlighted(4);
    
    const finalState = chart.getChartState();
    
    // Data length should remain the same
    expect(finalState.data.length).toBe(initialDataLength);
    
    // All nodes should still be present
    initialState.data.forEach(originalNode => {
      const finalNode = finalState.data.find(node => node.id === originalNode.id);
      expect(finalNode).toBeTruthy();
    });
  });

  test('should handle upToTheRootHighlighting after other operations', () => {
    chart.render();
    
    // Perform various operations first
    chart.setExpanded(2, false);
    chart.setExpanded(3, false);
    chart.setCentered(5);
    
    // Then upToTheRootHighlight a node
    chart.setUpToTheRootHighlighted(6);
    
    const chartState = chart.getChartState();
    const targetNode = chartState.data.find(node => node.id === 6);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const ceoNode = chartState.data.find(node => node.id === 1);
    
    expect(targetNode._upToTheRootHighlighted).toBe(true);
    expect(targetNode._expanded).toBe(true);
    expect(devManagerNode._upToTheRootHighlighted).toBe(true);
    expect(devManagerNode._expanded).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._expanded).toBe(true);
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
    customChart.setUpToTheRootHighlighted('C');
    
    const chartState = customChart.getChartState();
    const targetNode = chartState.data.find(node => node.customId === 'C');
    const parentNode = chartState.data.find(node => node.customId === 'B');
    const rootNode = chartState.data.find(node => node.customId === 'A');
    
    expect(targetNode._upToTheRootHighlighted).toBe(true);
    expect(targetNode._expanded).toBe(true);
    expect(parentNode._upToTheRootHighlighted).toBe(true);
    expect(parentNode._expanded).toBe(true);
    expect(rootNode._upToTheRootHighlighted).toBe(true);
    expect(rootNode._expanded).toBe(true);
    
    customChart.clear();
  });

  test('should work with clearHighlighting method', () => {
    chart.render();
    
    // Highlight multiple nodes with upToTheRootHighlighted
    chart.setUpToTheRootHighlighted(6);
    chart.setUpToTheRootHighlighted(7);
    
    let chartState = chart.getChartState();
    let upToTheRootHighlightedNodes = chartState.data.filter(node => node._upToTheRootHighlighted);
    expect(upToTheRootHighlightedNodes.length).toBeGreaterThan(0);
    
    // Clear highlighting
    chart.clearHighlighting();
    
    chartState = chart.getChartState();
    upToTheRootHighlightedNodes = chartState.data.filter(node => node._upToTheRootHighlighted);
    expect(upToTheRootHighlightedNodes.length).toBe(0);
    
    // Verify no nodes have highlighting flags
    chartState.data.forEach(node => {
      expect(node._highlighted).toBeFalsy();
      expect(node._upToTheRootHighlighted).toBeFalsy();
    });
  });

  test('should handle upToTheRootHighlighting same node multiple times', () => {
    chart.render();
    
    // Highlight the same node multiple times
    chart.setUpToTheRootHighlighted(3);
    chart.setUpToTheRootHighlighted(3);
    chart.setUpToTheRootHighlighted(3);
    
    const chartState = chart.getChartState();
    const targetNode = chartState.data.find(node => node.id === 3);
    const ceoNode = chartState.data.find(node => node.id === 1);
    
    // Should still be upToTheRootHighlighted and expanded
    expect(targetNode._upToTheRootHighlighted).toBe(true);
    expect(targetNode._expanded).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._expanded).toBe(true);
  });

  test('should handle upToTheRootHighlighting nodes at different hierarchy levels', () => {
    chart.render();
    
    // Highlight nodes at different levels
    chart.setUpToTheRootHighlighted(1); // Root level
    chart.setUpToTheRootHighlighted(2); // Level 1
    chart.setUpToTheRootHighlighted(4); // Level 2
    chart.setUpToTheRootHighlighted(6); // Level 3 (leaf)
    
    const chartState = chart.getChartState();
    const upToTheRootHighlightedNodes = chartState.data.filter(node => node._upToTheRootHighlighted);
    
    // All nodes in the path should be upToTheRootHighlighted
    expect(upToTheRootHighlightedNodes.length).toBeGreaterThanOrEqual(4);
    
    // Specific nodes should be upToTheRootHighlighted
    const rootNode = chartState.data.find(node => node.id === 1);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const seniorDevNode = chartState.data.find(node => node.id === 6);
    
    expect(rootNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(devManagerNode._upToTheRootHighlighted).toBe(true);
    expect(seniorDevNode._upToTheRootHighlighted).toBe(true);
    
    // All should be expanded
    expect(rootNode._expanded).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(devManagerNode._expanded).toBe(true);
    expect(seniorDevNode._expanded).toBe(true);
  });

  test('should maintain upToTheRootHighlighting after chart updates', () => {
    chart.render();
    
    // Highlight a node
    chart.setUpToTheRootHighlighted(4);
    
    let chartState = chart.getChartState();
    let targetNode = chartState.data.find(node => node.id === 4);
    let ctoNode = chartState.data.find(node => node.id === 2);
    let ceoNode = chartState.data.find(node => node.id === 1);
    
    expect(targetNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    
    // Perform other operations that might trigger updates
    chart.setExpanded(2, false);
    chart.setExpanded(2, true);
    
    // upToTheRootHighlighting should persist
    chartState = chart.getChartState();
    targetNode = chartState.data.find(node => node.id === 4);
    ctoNode = chartState.data.find(node => node.id === 2);
    ceoNode = chartState.data.find(node => node.id === 1);
    
    expect(targetNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._expanded).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._expanded).toBe(true);
  });

  test('should not affect siblings when upToTheRootHighlighting', () => {
    chart.render();
    
    // Highlight a node that has siblings
    chart.setUpToTheRootHighlighted(6); // Senior Dev (sibling of Junior Dev)
    
    const chartState = chart.getChartState();
    const targetNode = chartState.data.find(node => node.id === 6);
    const siblingNode = chartState.data.find(node => node.id === 7); // Junior Dev
    const qaManagerNode = chartState.data.find(node => node.id === 5); // QA Manager (sibling of Dev Manager)
    
    // Target node and its ancestors should be upToTheRootHighlighted
    expect(targetNode._upToTheRootHighlighted).toBe(true);
    
    // Siblings should not be upToTheRootHighlighted
    expect(siblingNode._upToTheRootHighlighted).toBeFalsy();
    expect(qaManagerNode._upToTheRootHighlighted).toBeFalsy();
  });

  test('should handle mixed highlighting states', () => {
    chart.render();
    
    // Set upToTheRootHighlighting on one node first
    chart.setUpToTheRootHighlighted(6); // Senior Dev
    
    // Set regular highlighting on another node
    chart.setHighlighted(3); // CFO
    
    const chartState = chart.getChartState();
    const cfoNode = chartState.data.find(node => node.id === 3);
    const seniorDevNode = chartState.data.find(node => node.id === 6);
    const devManagerNode = chartState.data.find(node => node.id === 4);
    const ctoNode = chartState.data.find(node => node.id === 2);
    const ceoNode = chartState.data.find(node => node.id === 1);
    
    // CFO should be highlighted (regular highlighting) and also upToTheRootHighlighted (due to implementation behavior)
    expect(cfoNode._highlighted).toBe(true);
    expect(cfoNode._upToTheRootHighlighted).toBe(true);
    
    // Senior Dev path should be upToTheRootHighlighted
    expect(seniorDevNode._upToTheRootHighlighted).toBe(true);
    expect(devManagerNode._upToTheRootHighlighted).toBe(true);
    expect(ctoNode._upToTheRootHighlighted).toBe(true);
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
    
    // CEO should have upToTheRootHighlighted state (from Senior Dev upToTheRootHighlighting)
    // but not _highlighted (since setHighlighted only sets _highlighted on the target node)
    expect(ceoNode._highlighted).toBeFalsy();
    expect(ceoNode._upToTheRootHighlighted).toBe(true);
  });
});