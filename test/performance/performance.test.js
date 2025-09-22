import { describe, test, expect } from 'vitest';
import { OrgChart } from '../../src/index.js';

describe('Performance Tests', () => {
  test('should render large dataset efficiently', () => {
    // Generate large dataset
    const largeData = [];
    for (let i = 0; i < 1000; i++) {
      largeData.push({
        id: `node-${i}`,
        parentId: i === 0 ? null : `node-${Math.floor(i / 10)}`,
        name: `Node ${i}`
      });
    }

    document.body.innerHTML = '<div id="perf-test"></div>';
    
    const chart = new OrgChart()
      .container('#perf-test')
      .data(largeData)
      .svgWidth(1200)
      .svgHeight(800);

    const start = performance.now();
    chart.render();
    const end = performance.now();

    const renderTime = end - start;
    console.log(`Large dataset render time: ${renderTime}ms`);
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(5000); // 5 seconds max
    
    // Verify nodes were created
    const nodes = document.querySelectorAll('.node');
    expect(nodes.length).toBeGreaterThan(0);
  });
});