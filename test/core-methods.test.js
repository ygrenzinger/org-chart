import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('Core Methods', () => {
  describe('getChartState() method', () => {
    test('should return complete state object', () => {
      const chart = new OrgChart();
      const state = chart.getChartState();
      
      expect(state).toBeInstanceOf(Object);
      expect(state).toHaveProperty('svgWidth');
      expect(state).toHaveProperty('svgHeight');
      expect(state).toHaveProperty('data');
      expect(state).toHaveProperty('container');
    });

    test('should return live reference to state', () => {
      const chart = new OrgChart();
      const state1 = chart.getChartState();
      const state2 = chart.getChartState();
      
      expect(state1).toBe(state2); // Same reference
      
      chart.svgWidth(1000);
      expect(state1.svgWidth).toBe(1000);
    });
  });

  describe('initialZoom() method', () => {
    test('should set initial zoom level', () => {
      const chart = new OrgChart();
      const result = chart.initialZoom(0.5);
      
      expect(result).toBe(chart); // Method chaining
      expect(chart.getChartState().lastTransform.k).toBe(0.5);
    });

    test('should handle various zoom levels', () => {
      const chart = new OrgChart();
      
      chart.initialZoom(2.0);
      expect(chart.getChartState().lastTransform.k).toBe(2.0);
      
      chart.initialZoom(0.1);
      expect(chart.getChartState().lastTransform.k).toBe(0.1);
    });
  });

  describe('render() method', () => {
    let chart, container;

    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'test-container';
      document.body.appendChild(container);
      
      chart = new OrgChart()
        .container('#test-container')
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

    test('should handle empty data gracefully', () => {
      chart.data([]);
      const consoleSpy = vi.spyOn(console, 'log');
      
      chart.render();
      
      expect(consoleSpy).toHaveBeenCalledWith('ORG CHART - Data is empty');
      expect(container.querySelector('svg')).toBeFalsy();
    });

    test('should handle null data gracefully', () => {
      chart.data(null);
      const consoleSpy = vi.spyOn(console, 'log');
      
      chart.render();
      
      expect(consoleSpy).toHaveBeenCalledWith('ORG CHART - Data is empty');
    });

    test('should return chart instance for method chaining', () => {
      const result = chart.render();
      expect(result).toBe(chart);
    });

    test('should create SVG element when rendering with valid data', () => {
      chart.render();
      
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg.getAttribute('width')).toBe('800');
    });

    test('should update chart on re-render', () => {
      chart.render();
      const initialSvg = container.querySelector('svg');
      expect(initialSvg).toBeTruthy();
      
      // Change data and re-render
      chart.data([...mockHierarchicalData, { id: 999, parentId: 1, name: 'New Node' }]);
      chart.render();
      
      const updatedSvg = container.querySelector('svg');
      expect(updatedSvg).toBeTruthy();
    });
  });

  describe('clear() method', () => {
    test('should remove all SVG elements', () => {
      const container = document.createElement('div');
      container.id = 'clear-test-container';
      document.body.appendChild(container);
      
      const chart = new OrgChart()
        .container(container)
        .data(mockHierarchicalData)
        .render();
      
      expect(container.querySelector('svg')).toBeTruthy();
      
      chart.clear();
      
      expect(container.querySelector('svg')).toBeFalsy();
      
      document.body.removeChild(container);
    });

    test('should return chart instance for method chaining', () => {
      const chart = new OrgChart();
      const result = chart.clear();
      expect(result).toBe(chart);
    });

    test('should handle clearing when no chart is rendered', () => {
      const chart = new OrgChart();
      expect(() => chart.clear()).not.toThrow();
    });
  });
});