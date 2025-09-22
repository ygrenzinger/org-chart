import { describe, test, expect, beforeEach } from 'vitest';
import { OrgChart } from '../../src/index.js';
import { mockHierarchicalData } from '../fixtures/mockData.js';

describe('Full Workflow Integration', () => {
  let chart;
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="workflow-test"></div>';
    container = '#workflow-test';
    
    chart = new OrgChart()
      .container(container)
      .data(mockHierarchicalData)
      .svgWidth(800)
      .svgHeight(600);
  });

  test('complete workflow: render -> interact -> export', async () => {
    // 1. Initial render
    chart.render();
    expect(document.querySelector('#workflow-test svg')).toBeTruthy();

    // 2. Add node
    const newNode = { id: 'workflow-node', parentId: mockHierarchicalData[0].id, name: 'Workflow Node' };
    chart.addNode(newNode);
    expect(chart.getChartState().data).toContainEqual(newNode);

    // 3. Expand/collapse operations
    chart.setExpanded(mockHierarchicalData[0].id, false);
    chart.setExpanded(mockHierarchicalData[0].id, true);

    // 4. Highlighting
    chart.setHighlighted(mockHierarchicalData[0].id);
    chart.clearHighlighting();

    // 5. Zoom operations
    chart.zoomIn();
    chart.zoomOut();
    chart.fit();

    // 6. Layout changes
    chart.layout('left').render();
    chart.layout('top').render();

    // 7. Export (mock)
    const exportPromise = new Promise(resolve => {
      chart.exportImg({ 
        save: false, 
        onLoad: (dataURL) => {
          expect(dataURL).toMatch(/^data:image\/png/);
          resolve();
        }
      });
    });

    await exportPromise;

    // 8. Cleanup
    chart.clear();
    expect(document.querySelector('#workflow-test svg')).toBeFalsy();
  });
});