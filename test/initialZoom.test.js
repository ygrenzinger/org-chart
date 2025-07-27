import { describe, test, expect } from 'vitest'
import { OrgChart } from '../src/d3-org-chart.js'

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