import { describe, test, expect } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'

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