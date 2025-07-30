import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { OrgChart } from '../src/index.js'
import { mockHierarchicalData } from './fixtures/mockData.js'

describe('Link Integration', () => {
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

  test('should render complete link structure with proper hierarchy', () => {
    chart.render();
    
    // Check SVG structure
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // Check links wrapper exists
    const linksWrapper = svg.querySelector('g.links-wrapper');
    expect(linksWrapper).toBeTruthy();
    
    // Check links are inside the wrapper
    const links = linksWrapper.querySelectorAll('path.link');
    expect(links.length).toBe(6); // 7 nodes - 1 root = 6 links
  });

  test('should maintain link visibility during expand/collapse operations', () => {
    chart.render();
    
    // Initial state - all links should be visible
    let links = container.querySelectorAll('path.link');
    const initialVisibleLinks = Array.from(links).filter(link => {
      const display = link.style.display || link.getAttribute('display');
      return display !== 'none';
    });
    
    expect(initialVisibleLinks.length).toBeGreaterThan(0);
    
    // Collapse all and check that some links are still visible
    chart.collapseAll();
    
    links = container.querySelectorAll('path.link');
    const collapsedVisibleLinks = Array.from(links).filter(link => {
      const display = link.style.display || link.getAttribute('display');
      return display !== 'none';
    });
    
    // Should still have at least root level links visible
    expect(collapsedVisibleLinks.length).toBeGreaterThan(0);
  });

  test('should highlight links when nodes are highlighted', () => {
    chart.render();
    
    // Highlight a node
    chart.setUpToTheRootHighlighted(6); // Senior Dev node
    chart.updateNodesState(); // Trigger update to apply highlighting
    
    const links = container.querySelectorAll('path.link');
    const highlightedLinks = Array.from(links).filter(link => {
      const stroke = link.getAttribute('stroke');
      const strokeWidth = link.getAttribute('stroke-width');
      return stroke === '#E27396' && parseInt(strokeWidth) > 1;
    });
    
    expect(highlightedLinks.length).toBeGreaterThan(0);
  });
});