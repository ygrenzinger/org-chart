import { describe, test, expect, beforeEach } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'

describe('OrgChart Constructor', () => {
  test('should create new instance with default configuration', () => {
    const chart = new OrgChart();
    expect(chart).toBeInstanceOf(OrgChart);
    expect(chart.getChartState()).toBeDefined();
  });

  test('should initialize all default properties', () => {
    const chart = new OrgChart();
    const state = chart.getChartState();
    
    expect(state.svgWidth).toBe(800);
    expect(state.svgHeight).toBeDefined();
    expect(state.container).toBe("body");
    expect(state.data).toBeNull();
    expect(state.duration).toBe(400);
    expect(state.layout).toBe("top");
    expect(state.compact).toBe(true);
  });

  test('should create dynamic getter/setter methods', () => {
    const chart = new OrgChart();
    
    expect(typeof chart.svgWidth).toBe('function');
    expect(typeof chart.svgHeight).toBe('function');
    expect(typeof chart.container).toBe('function');
    expect(typeof chart.data).toBe('function');
  });

  test('should have proper method chaining', () => {
    const chart = new OrgChart();
    const result = chart.svgWidth(1000).svgHeight(600).container('#test');
    
    expect(result).toBe(chart);
    expect(chart.svgWidth()).toBe(1000);
    expect(chart.svgHeight()).toBe(600);
    expect(chart.container()).toBe('#test');
  });

  test('should initialize with unique ID', () => {
    const chart1 = new OrgChart();
    const chart2 = new OrgChart();
    
    const state1 = chart1.getChartState();
    const state2 = chart2.getChartState();
    
    expect(state1.id).toBeDefined();
    expect(state2.id).toBeDefined();
    expect(state1.id).not.toBe(state2.id);
  });

  test('should initialize lastTransform with default values', () => {
    const chart = new OrgChart();
    const state = chart.getChartState();
    
    expect(state.lastTransform).toBeDefined();
    expect(state.lastTransform.x).toBe(0);
    expect(state.lastTransform.y).toBe(0);
    expect(state.lastTransform.k).toBe(1);
  });

  test('should initialize with proper default callbacks', () => {
    const chart = new OrgChart();
    const state = chart.getChartState();
    
    expect(typeof state.onNodeClick).toBe('function');
    expect(typeof state.onExpandOrCollapse).toBe('function');
    expect(typeof state.onZoom).toBe('function');
    expect(typeof state.onZoomStart).toBe('function');
    expect(typeof state.onZoomEnd).toBe('function');
  });
});