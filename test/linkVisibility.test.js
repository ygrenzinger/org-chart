import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('Link Visibility', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    container.style.width = '800px';
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container('#test-container')
      .data(mockHierarchicalData)
      .initialExpandLevel(3); // Expand all levels to see all links
  });

  afterEach(() => {
    if (chart && typeof chart.clear === 'function') {
      chart.clear();
    }
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  test('should render visible links between parent and child nodes', () => {
    chart.render();
    
    // Get all link elements
    const links = container.querySelectorAll('path.link');
    
    // Should have links for all non-root nodes (6 links for 7 nodes)
    expect(links.length).toBeGreaterThan(0);
    expect(links.length).toBe(6);
    
    // Links should be visible by default (not display: none)
    links.forEach(link => {
      const display = link.style.display || link.getAttribute('display');
      expect(display).not.toBe('none');
    });
  });

  test('should render links with proper stroke styling', () => {
    chart.render();
    
    const links = container.querySelectorAll('path.link');
    expect(links.length).toBeGreaterThan(0);
    
    links.forEach(link => {
      // Should have stroke color (not 'none')
      const stroke = link.getAttribute('stroke');
      expect(stroke).toBeTruthy();
      expect(stroke).not.toBe('none');
      
      // Should have stroke width
      const strokeWidth = link.getAttribute('stroke-width');
      expect(strokeWidth).toBeTruthy();
      expect(parseInt(strokeWidth)).toBeGreaterThan(0);
      
      // Should have fill: none
      const fill = link.getAttribute('fill');
      expect(fill).toBe('none');
    });
  });

  test('should render links with valid path data', () => {
    chart.render();
    
    const links = container.querySelectorAll('path.link');
    expect(links.length).toBeGreaterThan(0);
    
    links.forEach(link => {
      const pathData = link.getAttribute('d');
      expect(pathData).toBeTruthy();
      expect(pathData.length).toBeGreaterThan(0);
      // Path should start with M (moveTo command)
      expect(pathData.trim()).toMatch(/^M/);
    });
  });
});