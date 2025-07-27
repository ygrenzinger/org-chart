import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('data() method - Data Update Tests', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'data-test-container';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#data-test-container');
  });

  afterEach(() => {
    if (chart && typeof chart.clear === 'function') {
      chart.clear();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('data getter functionality', () => {
    test('should return null when no data is set', () => {
      const result = chart.data();
      expect(result).toBeNull();
    });

    test('should return the same data that was set', () => {
      const testData = [...mockHierarchicalData];
      chart.data(testData);
      
      const result = chart.data();
      expect(result).toBe(testData); // Same reference
      expect(result).toEqual(mockHierarchicalData);
    });

    test('should return live reference to data', () => {
      const testData = [...mockHierarchicalData];
      chart.data(testData);
      
      const data1 = chart.data();
      const data2 = chart.data();
      
      expect(data1).toBe(data2); // Same reference
    });
  });

  describe('data setter functionality', () => {
    test('should set data and return chart instance for method chaining', () => {
      const testData = [...mockHierarchicalData];
      const result = chart.data(testData);
      
      expect(result).toBe(chart); // Method chaining
      expect(chart.data()).toBe(testData);
    });

    test('should accept empty array', () => {
      const emptyData = [];
      const result = chart.data(emptyData);
      
      expect(result).toBe(chart);
      expect(chart.data()).toBe(emptyData);
      expect(chart.data()).toHaveLength(0);
    });

    test('should accept null data', () => {
      chart.data(mockHierarchicalData); // Set some data first
      const result = chart.data(null);
      
      expect(result).toBe(chart);
      expect(chart.data()).toBeNull();
    });

    test('should replace existing data', () => {
      const initialData = [...mockHierarchicalData];
      const newData = [
        { id: 100, parentId: null, name: 'New CEO' },
        { id: 101, parentId: 100, name: 'New CTO' }
      ];
      
      chart.data(initialData);
      expect(chart.data()).toBe(initialData);
      
      chart.data(newData);
      expect(chart.data()).toBe(newData);
      expect(chart.data()).not.toBe(initialData);
    });
  });

  describe('data update with rendering', () => {
    test('should handle data update and re-render successfully', () => {
      // Initial render with data
      chart.data(mockHierarchicalData).render();
      
      let svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      
      // Update data and re-render
      const newData = [
        { id: 200, parentId: null, name: 'Updated CEO' },
        { id: 201, parentId: 200, name: 'Updated CTO' },
        { id: 202, parentId: 200, name: 'Updated CFO' }
      ];
      
      chart.data(newData).render();
      
      svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(chart.data()).toBe(newData);
    });

    test('should handle empty data update gracefully', () => {
      // Start with data
      chart.data(mockHierarchicalData).render();
      expect(container.querySelector('svg')).toBeTruthy();
      
      // Update to empty data
      const consoleSpy = vi.spyOn(console, 'log');
      chart.data([]).render();
      
      expect(consoleSpy).toHaveBeenCalledWith('ORG CHART - Data is empty');
      expect(chart.data()).toEqual([]);
    });

    test('should handle null data update gracefully', () => {
      // Start with data
      chart.data(mockHierarchicalData).render();
      expect(container.querySelector('svg')).toBeTruthy();
      
      // Update to null data
      const consoleSpy = vi.spyOn(console, 'log');
      chart.data(null).render();
      
      expect(consoleSpy).toHaveBeenCalledWith('ORG CHART - Data is empty');
      expect(chart.data()).toBeNull();
    });
  });

  describe('data update with different data structures', () => {
    test('should handle single node data', () => {
      const singleNodeData = [{ id: 1, parentId: null, name: 'Single Node' }];
      
      const result = chart.data(singleNodeData);
      expect(result).toBe(chart);
      expect(chart.data()).toBe(singleNodeData);
      expect(chart.data()).toHaveLength(1);
    });

    test('should handle deep hierarchical data', () => {
      const deepData = [
        { id: 1, parentId: null, name: 'Level 1' },
        { id: 2, parentId: 1, name: 'Level 2' },
        { id: 3, parentId: 2, name: 'Level 3' },
        { id: 4, parentId: 3, name: 'Level 4' },
        { id: 5, parentId: 4, name: 'Level 5' }
      ];
      
      const result = chart.data(deepData);
      expect(result).toBe(chart);
      expect(chart.data()).toBe(deepData);
      expect(chart.data()).toHaveLength(5);
    });

    test('should handle data with custom properties', () => {
      const customData = [
        { id: 1, parentId: null, name: 'CEO', department: 'Executive', salary: 200000 },
        { id: 2, parentId: 1, name: 'CTO', department: 'Technology', salary: 150000 },
        { id: 3, parentId: 1, name: 'CFO', department: 'Finance', salary: 140000 }
      ];
      
      const result = chart.data(customData);
      expect(result).toBe(chart);
      expect(chart.data()).toBe(customData);
      expect(chart.data()[0]).toHaveProperty('department');
      expect(chart.data()[0]).toHaveProperty('salary');
    });

    test('should handle data with alternative id/parentId property names', () => {
      const altData = [
        { nodeId: 'a', parentNodeId: null, name: 'Root' },
        { nodeId: 'b', parentNodeId: 'a', name: 'Child 1' },
        { nodeId: 'c', parentNodeId: 'a', name: 'Child 2' }
      ];
      
      const result = chart.data(altData);
      expect(result).toBe(chart);
      expect(chart.data()).toBe(altData);
      expect(chart.data()).toHaveLength(3);
    });
  });

  describe('data update edge cases', () => {
    test('should handle data update multiple times in sequence', () => {
      const data1 = [{ id: 1, parentId: null, name: 'First' }];
      const data2 = [{ id: 2, parentId: null, name: 'Second' }];
      const data3 = [{ id: 3, parentId: null, name: 'Third' }];
      
      chart.data(data1).data(data2).data(data3);
      
      expect(chart.data()).toBe(data3);
      expect(chart.data()[0].name).toBe('Third');
    });

    test('should handle data update with method chaining', () => {
      const testData = [...mockHierarchicalData];
      
      const result = chart
        .data(testData)
        .svgWidth(1000)
        .svgHeight(600);
      
      expect(result).toBe(chart);
      expect(chart.data()).toBe(testData);
      expect(chart.svgWidth()).toBe(1000);
      expect(chart.svgHeight()).toBe(600);
    });

    test('should maintain data reference after other method calls', () => {
      const testData = [...mockHierarchicalData];
      
      chart.data(testData);
      chart.svgWidth(1200);
      chart.nodeWidth(300);
      
      expect(chart.data()).toBe(testData);
    });

    test('should handle data update after chart operations', () => {
      // Initial setup and render
      chart.data(mockHierarchicalData).render();
      
      // Perform some operations
      chart.expandAll();
      chart.initialZoom(0.8);
      
      // Update data
      const newData = [{ id: 999, parentId: null, name: 'New Root' }];
      chart.data(newData);
      
      expect(chart.data()).toBe(newData);
      expect(chart.data()).toHaveLength(1);
    });
  });

  describe('data state consistency', () => {
    test('should maintain data consistency with getChartState()', () => {
      const testData = [...mockHierarchicalData];
      chart.data(testData);
      
      const state = chart.getChartState();
      expect(state.data).toBe(testData);
      expect(state.data).toBe(chart.data());
    });

    test('should update state when data changes', () => {
      const initialData = [...mockHierarchicalData];
      const newData = [{ id: 100, parentId: null, name: 'New Data' }];
      
      chart.data(initialData);
      let state = chart.getChartState();
      expect(state.data).toBe(initialData);
      
      chart.data(newData);
      state = chart.getChartState();
      expect(state.data).toBe(newData);
      expect(state.data).not.toBe(initialData);
    });
  });
});