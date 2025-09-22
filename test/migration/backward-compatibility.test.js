import { describe, test, expect } from 'vitest';
import { OrgChart } from '../../src/index.js';

describe('Backward Compatibility', () => {
  test('should maintain exact same API as v2.x', () => {
    const chart = new OrgChart();
    
    // Test all public methods exist
    const publicMethods = [
      'render', 'data', 'container', 'svgWidth', 'svgHeight',
      'addNode', 'removeNode', 'setExpanded', 'setCentered',
      'setHighlighted', 'clearHighlighting', 'expandAll', 'collapseAll',
      'zoomIn', 'zoomOut', 'fit', 'exportImg', 'exportSvg',
      'fullscreen', 'clear', 'getChartState'
    ];
    
    publicMethods.forEach(method => {
      expect(typeof chart[method]).toBe('function');
    });
  });

  test('should support method chaining', () => {
    const chart = new OrgChart();
    
    const result = chart
      .svgWidth(800)
      .svgHeight(600)
      .layout('top')
      .compact(true);
    
    expect(result).toBe(chart);
  });

  test('should work with v2.x configuration', () => {
    // Test with typical v2.x configuration
    document.body.innerHTML = '<div id="test-container"></div>';
    
    const chart = new OrgChart()
      .container('#test-container')
      .data([
        { id: 1, parentId: null, name: 'Root' },
        { id: 2, parentId: 1, name: 'Child' }
      ])
      .svgWidth(800)
      .svgHeight(600)
      .nodeWidth(() => 250)
      .nodeHeight(() => 150)
      .layout('top')
      .compact(true);
    
    expect(() => chart.render()).not.toThrow();
  });
});