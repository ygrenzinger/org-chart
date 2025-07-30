import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData, generateLargeHierarchicalData } from './fixtures/mockData.js'

describe('Initial Chart Centering', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#test-container')
      .svgWidth(800)
      .svgHeight(600)
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

  test('should automatically center chart on initial render', () => {
    // Spy on the fit method to verify it's called
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    // Render the chart
    chart.render();
    
    // Verify that fit was called during initial render
    expect(fitSpy).toHaveBeenCalledWith({
      animate: false,
      scale: true
    });
  });

  test('should not call fit on subsequent renders', () => {
    // First render
    chart.render();
    
    // Spy on fit method after first render
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    // Second render
    chart.render();
    
    // Verify fit was not called on subsequent render
    expect(fitSpy).not.toHaveBeenCalled();
  });

  test('should center chart with different data sizes', () => {
    const smallData = [
      { id: 1, parentId: null, name: 'Root' },
      { id: 2, parentId: 1, name: 'Child' }
    ];
    
    chart.data(smallData);
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    chart.render();
    
    expect(fitSpy).toHaveBeenCalledWith({
      animate: false,
      scale: true
    });
  });

  test('should center chart with different layout orientations', () => {
    chart.layout('left');
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    chart.render();
    
    expect(fitSpy).toHaveBeenCalledWith({
      animate: false,
      scale: true
    });
  });

  test('should handle centering when chart has no data', () => {
    chart.data([]);
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    chart.render();
    
    // Should not call fit when there's no data
    expect(fitSpy).not.toHaveBeenCalled();
  });

  test('should preserve existing centered node behavior', () => {
    // First render to initialize
    chart.render();
    
    // Set a node as centered
    chart.setCentered(2);
    
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    // Update should trigger centering for the specific node
    const attrs = chart.getChartState();
    chart.update(attrs.root);
    
    // Should call fit with specific nodes when a node is centered
    expect(fitSpy).toHaveBeenCalled();
  });

  test('should center chart with large datasets', () => {
    const largeData = generateLargeHierarchicalData(50);
    chart.data(largeData);
    
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    chart.render();
    
    expect(fitSpy).toHaveBeenCalledWith({
      animate: false,
      scale: true
    });
  });

  test('should center chart with compact layout enabled', () => {
    chart.compact(true);
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    chart.render();
    
    expect(fitSpy).toHaveBeenCalledWith({
      animate: false,
      scale: true
    });
  });

  test('should center chart with compact layout disabled', () => {
    chart.compact(false);
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    chart.render();
    
    expect(fitSpy).toHaveBeenCalledWith({
      animate: false,
      scale: true
    });
  });

  test('should center chart with custom node dimensions', () => {
    chart
      .nodeWidth(() => 300)
      .nodeHeight(() => 200);
    
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    chart.render();
    
    expect(fitSpy).toHaveBeenCalledWith({
      animate: false,
      scale: true
    });
  });

  test('should center chart after data update and re-render', () => {
    // First render
    chart.render();
    
    // Update data
    const newData = [
      ...mockHierarchicalData,
      { id: 8, parentId: 3, name: 'New Employee', position: 'New Position' }
    ];
    chart.data(newData);
    
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    // Re-render should not trigger auto-centering (only first render should)
    chart.render();
    
    expect(fitSpy).not.toHaveBeenCalled();
  });

  test('should handle centering with different initial expand levels', () => {
    chart.initialExpandLevel(2);
    const fitSpy = vi.spyOn(chart.zoomManager, 'fit');
    
    chart.render();
    
    expect(fitSpy).toHaveBeenCalledWith({
      animate: false,
      scale: true
    });
  });
});