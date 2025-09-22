import { describe, test, expect, beforeEach } from 'vitest';
import { DOMUtils } from '../../../src/utils/DOMUtils.js';
import * as d3 from 'd3';

describe('DOMUtils', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
    container = d3.select('#test-container');
  });

  test('should create patternify selection', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const selection = DOMUtils.patternify(container, 'test-item', 'div', data);
    
    expect(selection.size()).toBe(2);
    expect(container.selectAll('.test-item').size()).toBe(2);
  });

  test('should detect Edge browser', () => {
    const originalUserAgent = navigator.userAgent;
    
    // Mock Edge user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edge/91.0.864.59',
      configurable: true
    });
    
    expect(DOMUtils.isEdge()).toBe(true);
    
    // Restore original user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    });
  });
});