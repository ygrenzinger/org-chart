import { describe, test, expect, beforeEach } from 'vitest';
import { ChartState } from '../../../src/core/ChartState.js';
import { DEFAULT_CONFIG } from '../../../src/utils/Constants.js';

describe('ChartState', () => {
  let chartState;

  beforeEach(() => {
    chartState = new ChartState();
  });

  test('should initialize with default configuration', () => {
    const state = chartState.getState();
    expect(state.svgWidth).toBe(DEFAULT_CONFIG.svgWidth);
    expect(state.layout).toBe(DEFAULT_CONFIG.layout);
  });

  test('should allow custom configuration', () => {
    const customConfig = { svgWidth: 1000, layout: 'left' };
    const customState = new ChartState(customConfig);
    const state = customState.getState();
    
    expect(state.svgWidth).toBe(1000);
    expect(state.layout).toBe('left');
  });

  test('should provide getter/setter methods', () => {
    expect(typeof chartState.svgWidth).toBe('function');
    expect(chartState.svgWidth()).toBe(DEFAULT_CONFIG.svgWidth);
    
    // Test that updateState works correctly
    chartState.updateState({ svgWidth: 1200 });
    expect(chartState.getState().svgWidth).toBe(1200);
    expect(chartState.svgWidth()).toBe(1200);
    
    // Test method chaining with updateState
    const result = chartState.updateState({ svgWidth: 1500, svgHeight: 900 });
    expect(result).toBe(chartState);
    expect(chartState.getState().svgWidth).toBe(1500);
    expect(chartState.getState().svgHeight).toBe(900);
  });

  test('should update state', () => {
    chartState.updateState({ svgWidth: 1500, layout: 'bottom' });
    const state = chartState.getState();
    
    expect(state.svgWidth).toBe(1500);
    expect(state.layout).toBe('bottom');
  });
});