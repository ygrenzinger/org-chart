# D3 Org Chart - Comprehensive Test Plan

This document outlines a comprehensive test plan for all public functions and methods of the D3 Org Chart library. The test plan is organized by functionality areas and includes unit tests, integration tests, and end-to-end tests.

## Table of Contents

1. [Test Strategy](#test-strategy)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [End-to-End Tests](#end-to-end-tests)
6. [Performance Tests](#performance-tests)
7. [Visual Regression Tests](#visual-regression-tests)
8. [Browser Compatibility Tests](#browser-compatibility-tests)
9. [Test Data](#test-data)
10. [Test Implementation Guidelines](#test-implementation-guidelines)

---

## Test Strategy

### Testing Framework
- **Unit Tests**: Vitest
- **DOM Testing**: happy-dom (recommended for Vitest) or jsdom
- **E2E Tests**: Playwright or Cypress
- **Visual Testing**: Percy or Chromatic
- **Performance**: Lighthouse CI

### Coverage Goals
- **Unit Test Coverage**: 90%+
- **Integration Test Coverage**: 80%+
- **Critical Path Coverage**: 100%

### Test Categories
1. **Unit Tests**: Individual method testing
2. **Integration Tests**: Component interaction testing
3. **End-to-End Tests**: Full workflow testing
4. **Performance Tests**: Load and rendering performance
5. **Visual Tests**: UI consistency and regression

---

## Test Environment Setup

### Prerequisites
```bash
npm install --save-dev vitest happy-dom @testing-library/dom
npm install --save-dev playwright @playwright/test
npm install --save-dev @percy/cli @percy/playwright
```

### Test Configuration
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.js'],
    coverage: {
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js'],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90
      }
    }
  }
})
```

---

## Unit Tests

### 1. Constructor Tests

#### Test Suite: `OrgChart Constructor`

```javascript
import { vi } from 'vitest'

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
});
```

### 2. Core Methods Tests

#### Test Suite: `render()`

```javascript
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
    chart.clear();
    document.body.removeChild(container);
  });

  test('should render chart with valid data', () => {
    const result = chart.render();
    
    expect(result).toBe(chart); // Method chaining
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('.node')).toHaveLength(mockHierarchicalData.length);
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

  test('should update chart on re-render', () => {
    chart.render();
    const initialNodes = container.querySelectorAll('.node').length;
    
    chart.data([...mockHierarchicalData, { id: 999, parentId: 1, name: 'New Node' }]);
    chart.render();
    
    expect(container.querySelectorAll('.node').length).toBe(initialNodes + 1);
  });
});
```

#### Test Suite: `getChartState()`

```javascript
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
```

#### Test Suite: `initialZoom()`

```javascript
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
```

#### Test Suite: `clear()`

```javascript
describe('clear() method', () => {
  test('should remove all SVG elements', () => {
    const container = document.createElement('div');
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

  test('should clean up event listeners', () => {
    const chart = new OrgChart();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    chart.clear();
    
    // Verify cleanup (implementation-specific)
    expect(removeEventListenerSpy).toHaveBeenCalled();
  });
});
```

### 3. Configuration Methods Tests

#### Test Suite: `Getter/Setter Pattern`

```javascript
describe('Configuration Methods', () => {
  let chart;

  beforeEach(() => {
    chart = new OrgChart();
  });

  describe('container()', () => {
    test('should get default container', () => {
      expect(chart.container()).toBe('body');
    });

    test('should set container with CSS selector', () => {
      const result = chart.container('#my-chart');
      
      expect(result).toBe(chart); // Method chaining
      expect(chart.container()).toBe('#my-chart');
    });

    test('should set container with DOM element', () => {
      const element = document.createElement('div');
      chart.container(element);
      
      expect(chart.container()).toBe(element);
    });
  });

  describe('data()', () => {
    test('should get default data', () => {
      expect(chart.data()).toBeNull();
    });

    test('should set hierarchical data', () => {
      const result = chart.data(mockHierarchicalData);
      
      expect(result).toBe(chart);
      expect(chart.data()).toEqual(mockHierarchicalData);
    });

    test('should handle empty array', () => {
      chart.data([]);
      expect(chart.data()).toEqual([]);
    });
  });

  describe('svgWidth() / svgHeight()', () => {
    test('should get default dimensions', () => {
      expect(chart.svgWidth()).toBe(800);
      expect(typeof chart.svgHeight()).toBe('number');
    });

    test('should set dimensions', () => {
      chart.svgWidth(1200).svgHeight(600);
      
      expect(chart.svgWidth()).toBe(1200);
      expect(chart.svgHeight()).toBe(600);
    });

    test('should handle numeric strings', () => {
      chart.svgWidth('1000');
      expect(chart.svgWidth()).toBe('1000');
    });
  });

  describe('nodeWidth() / nodeHeight()', () => {
    test('should get default node dimensions', () => {
      expect(typeof chart.nodeWidth()).toBe('function');
      expect(typeof chart.nodeHeight()).toBe('function');
    });

    test('should set static dimensions', () => {
      chart.nodeWidth(300).nodeHeight(200);
      
      expect(chart.nodeWidth()).toBe(300);
      expect(chart.nodeHeight()).toBe(200);
    });

    test('should set dynamic dimensions', () => {
      const widthFn = d => d.data.isManager ? 350 : 250;
      chart.nodeWidth(widthFn);
      
      expect(chart.nodeWidth()).toBe(widthFn);
    });
  });

  describe('layout()', () => {
    test('should get default layout', () => {
      expect(chart.layout()).toBe('top');
    });

    test('should set valid layouts', () => {
      const layouts = ['top', 'bottom', 'left', 'right'];
      
      layouts.forEach(layout => {
        chart.layout(layout);
        expect(chart.layout()).toBe(layout);
      });
    });
  });

  describe('duration()', () => {
    test('should get default duration', () => {
      expect(chart.duration()).toBe(400);
    });

    test('should set animation duration', () => {
      chart.duration(1000);
      expect(chart.duration()).toBe(1000);
    });
  });
});
```

### 4. Event Handling Tests

#### Test Suite: `Event Callbacks`

```javascript
describe('Event Handling', () => {
  let chart;

  beforeEach(() => {
    chart = new OrgChart();
  });

  describe('onNodeClick()', () => {
    test('should set node click callback', () => {
      const callback = vi.fn();
      chart.onNodeClick(callback);
      
      expect(chart.onNodeClick()).toBe(callback);
    });

    test('should trigger callback on node click', async () => {
      const callback = vi.fn();
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      chart
        .container(container)
        .data(mockHierarchicalData)
        .onNodeClick(callback)
        .render();
      
      const node = container.querySelector('.node');
      node.click();
      
      expect(callback).toHaveBeenCalled();
      
      document.body.removeChild(container);
    });
  });

  describe('onExpandOrCollapse()', () => {
    test('should set expand/collapse callback', () => {
      const callback = vi.fn();
      chart.onExpandOrCollapse(callback);
      
      expect(chart.onExpandOrCollapse()).toBe(callback);
    });
  });

  describe('onZoom() / onZoomStart() / onZoomEnd()', () => {
    test('should set zoom callbacks', () => {
      const zoomCallback = vi.fn();
      const startCallback = vi.fn();
      const endCallback = vi.fn();
      
      chart
        .onZoom(zoomCallback)
        .onZoomStart(startCallback)
        .onZoomEnd(endCallback);
      
      expect(chart.onZoom()).toBe(zoomCallback);
      expect(chart.onZoomStart()).toBe(startCallback);
      expect(chart.onZoomEnd()).toBe(endCallback);
    });
  });
});
```

### 5. User Interaction Tests

#### Test Suite: `User Interaction Methods`

```javascript
describe('User Interaction', () => {
  let chart, container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    chart = new OrgChart()
      .container(container)
      .data(mockHierarchicalData);
  });

  afterEach(() => {
    chart.clear();
    document.body.removeChild(container);
  });

  describe('expandAll()', () => {
    test('should expand all nodes', () => {
      const result = chart.expandAll();
      
      expect(result).toBe(chart); // Method chaining
      
      const state = chart.getChartState();
      state.data.forEach(node => {
        expect(node._expanded).toBe(true);
      });
    });
  });

  describe('collapseAll()', () => {
    test('should collapse all nodes', () => {
      chart.expandAll(); // First expand
      const result = chart.collapseAll();
      
      expect(result).toBe(chart);
      
      const state = chart.getChartState();
      if (state.allNodes) {
        state.allNodes.forEach(node => {
          expect(node.data._expanded).toBe(false);
        });
      }
    });
  });

  describe('clearHighlighting()', () => {
    test('should clear node highlighting', () => {
      const result = chart.clearHighlighting();
      
      expect(result).toBe(chart);
      // Additional assertions would depend on implementation
    });
  });

  describe('zoomIn() / zoomOut()', () => {
    test('should zoom in and out programmatically', () => {
      chart.render();
      
      // These methods don't return values, just test they don't throw
      expect(() => chart.zoomIn()).not.toThrow();
      expect(() => chart.zoomOut()).not.toThrow();
    });
  });
});
```

### 6. Export and Utility Tests

#### Test Suite: `Export Methods`

```javascript
describe('Export and Utilities', () => {
  let chart;

  beforeEach(() => {
    chart = new OrgChart();
  });

  describe('getTextWidth()', () => {
    test('should calculate text width', () => {
      const width = chart.getTextWidth('Hello World', {
        fontSize: 14,
        fontWeight: 400,
        defaultFont: 'Arial'
      });
      
      expect(typeof width).toBe('number');
      expect(width).toBeGreaterThan(0);
    });

    test('should handle different font sizes', () => {
      const width12 = chart.getTextWidth('Test', { fontSize: 12 });
      const width24 = chart.getTextWidth('Test', { fontSize: 24 });
      
      expect(width24).toBeGreaterThan(width12);
    });

    test('should handle empty text', () => {
      const width = chart.getTextWidth('');
      expect(width).toBe(0);
    });
  });

  describe('exportSvg()', () => {
    test('should not throw when called', () => {
      expect(() => chart.exportSvg()).not.toThrow();
    });
  });

  describe('downloadImage()', () => {
    test('should handle download options', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      
      const options = {
        node: mockSvg,
        scale: 2,
        imageName: 'test-chart',
        isSvg: true,
        save: false
      };
      
      expect(() => chart.downloadImage(options)).not.toThrow();
    });
  });
});
```

### 7. Advanced Methods Tests

#### Test Suite: `Advanced Internal Methods`

```javascript
describe('Advanced Methods', () => {
  let chart;

  beforeEach(() => {
    chart = new OrgChart();
  });

  describe('getNodeChildren()', () => {
    test('should collect all node children', () => {
      const mockNode = {
        data: { id: 1, name: 'Parent' },
        children: [
          { data: { id: 2, name: 'Child 1' } },
          { data: { id: 3, name: 'Child 2' } }
        ]
      };
      
      const nodeStore = [];
      const result = chart.getNodeChildren(mockNode, nodeStore);
      
      expect(result).toEqual(nodeStore);
      expect(nodeStore).toHaveLength(3); // Parent + 2 children
    });

    test('should handle nodes without children', () => {
      const mockNode = {
        data: { id: 1, name: 'Leaf' }
      };
      
      const nodeStore = [];
      chart.getNodeChildren(mockNode, nodeStore);
      
      expect(nodeStore).toHaveLength(1);
      expect(nodeStore[0]).toEqual(mockNode.data);
    });
  });

  describe('isEdge()', () => {
    test('should detect browser type', () => {
      const result = chart.isEdge();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('initializeEnterExitUpdatePattern()', () => {
    test('should add patternify method to d3 selection', () => {
      chart.initializeEnterExitUpdatePattern();
      
      // Check if patternify method is added to d3 selection prototype
      expect(typeof d3.selection.prototype.patternify).toBe('function');
    });
  });
});
```

---

## Integration Tests

### Test Suite: `Chart Lifecycle Integration`

```javascript
describe('Chart Lifecycle Integration', () => {
  test('should handle complete chart creation workflow', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const chart = new OrgChart()
      .container(container)
      .data(mockHierarchicalData)
      .svgWidth(800)
      .svgHeight(600)
      .nodeWidth(250)
      .nodeHeight(150)
      .duration(300)
      .render();
    
    // Verify chart is rendered
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelectorAll('.node')).toHaveLength(mockHierarchicalData.length);
    
    // Test interactions
    chart.expandAll();
    chart.collapseAll();
    chart.zoomIn();
    chart.zoomOut();
    
    // Cleanup
    chart.clear();
    document.body.removeChild(container);
  });

  test('should handle data updates', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const chart = new OrgChart()
      .container(container)
      .data(mockHierarchicalData)
      .render();
    
    const initialNodeCount = container.querySelectorAll('.node').length;
    
    // Update data
    const newData = [...mockHierarchicalData, { id: 999, parentId: 1, name: 'New Node' }];
    chart.data(newData).render();
    
    expect(container.querySelectorAll('.node').length).toBe(initialNodeCount + 1);
    
    chart.clear();
    document.body.removeChild(container);
  });
});
```

### Test Suite: `Configuration Integration`

```javascript
describe('Configuration Integration', () => {
  test('should apply multiple configuration changes', () => {
    const chart = new OrgChart()
      .svgWidth(1000)
      .svgHeight(700)
      .layout('left')
      .compact(false)
      .duration(500);
    
    const state = chart.getChartState();
    
    expect(state.svgWidth).toBe(1000);
    expect(state.svgHeight).toBe(700);
    expect(state.layout).toBe('left');
    expect(state.compact).toBe(false);
    expect(state.duration).toBe(500);
  });

  test('should handle method chaining', () => {
    const result = new OrgChart()
      .container('#test')
      .data([])
      .svgWidth(800)
      .svgHeight(600)
      .layout('top')
      .duration(400);
    
    expect(result).toBeInstanceOf(OrgChart);
  });
});
```

---

## End-to-End Tests

### Test Suite: `Complete User Workflows`

```javascript
// Using Playwright
describe('E2E User Workflows', () => {
  test('should render chart and handle user interactions', async ({ page }) => {
    await page.goto('/test/index.html');
    
    // Wait for chart to render
    await page.waitForSelector('svg');
    
    // Verify nodes are present
    const nodes = await page.locator('.node').count();
    expect(nodes).toBeGreaterThan(0);
    
    // Test node click
    await page.locator('.node').first().click();
    
    // Test expand/collapse
    const expandButton = page.locator('.expand-button').first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }
    
    // Test zoom
    await page.mouse.wheel(0, -100); // Zoom in
    await page.mouse.wheel(0, 100);  // Zoom out
    
    // Test pan
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(450, 350);
    await page.mouse.up();
  });

  test('should handle different layouts', async ({ page }) => {
    await page.goto('/test/index.html');
    
    const layouts = ['top', 'bottom', 'left', 'right'];
    
    for (const layout of layouts) {
      await page.evaluate((layout) => {
        window.chart.layout(layout).render();
      }, layout);
      
      await page.waitForTimeout(500); // Wait for animation
      
      // Verify layout change
      const svg = await page.locator('svg').first();
      expect(await svg.isVisible()).toBe(true);
    }
  });
});
```

---

## Performance Tests

### Test Suite: `Performance Benchmarks`

```javascript
describe('Performance Tests', () => {
  test('should render large datasets efficiently', () => {
    const largeDataset = generateLargeHierarchicalData(1000); // 1000 nodes
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const startTime = performance.now();
    
    const chart = new OrgChart()
      .container(container)
      .data(largeDataset)
      .render();
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(5000); // Should render in under 5 seconds
    expect(container.querySelectorAll('.node')).toHaveLength(largeDataset.length);
    
    chart.clear();
    document.body.removeChild(container);
  });

  test('should handle frequent updates efficiently', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const chart = new OrgChart()
      .container(container)
      .data(mockHierarchicalData);
    
    const startTime = performance.now();
    
    // Perform multiple renders
    for (let i = 0; i < 10; i++) {
      chart.render();
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(2000); // Should complete in under 2 seconds
    
    chart.clear();
    document.body.removeChild(container);
  });
});
```

---

## Visual Regression Tests

### Test Suite: `Visual Consistency`

```javascript
// Using Percy or similar visual testing tool
describe('Visual Regression Tests', () => {
  test('should maintain visual consistency - default layout', async ({ page }) => {
    await page.goto('/test/visual-test.html');
    await page.waitForSelector('svg');
    
    // Take screenshot for visual comparison
    await percySnapshot(page, 'Default Layout');
  });

  test('should maintain visual consistency - different layouts', async ({ page }) => {
    const layouts = ['top', 'bottom', 'left', 'right'];
    
    for (const layout of layouts) {
      await page.goto(`/test/visual-test.html?layout=${layout}`);
      await page.waitForSelector('svg');
      await percySnapshot(page, `Layout - ${layout}`);
    }
  });

  test('should maintain visual consistency - compact vs expanded', async ({ page }) => {
    await page.goto('/test/visual-test.html');
    await page.waitForSelector('svg');
    
    // Compact mode
    await page.evaluate(() => window.chart.compact(true).render());
    await percySnapshot(page, 'Compact Mode');
    
    // Expanded mode
    await page.evaluate(() => window.chart.compact(false).render());
    await percySnapshot(page, 'Expanded Mode');
  });
});
```

---

## Browser Compatibility Tests

### Test Suite: `Cross-Browser Compatibility`

```javascript
describe('Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test(`should work in ${browserName}`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto('/test/index.html');
      await page.waitForSelector('svg');
      
      // Basic functionality test
      const nodes = await page.locator('.node').count();
      expect(nodes).toBeGreaterThan(0);
      
      // Test interactions
      await page.locator('.node').first().click();
      
      await context.close();
    });
  });
});
```

---

## Test Data

### Mock Data Definitions

```javascript
// test/fixtures/mockData.js
export const mockHierarchicalData = [
  { id: 1, parentId: null, name: 'CEO', position: 'Chief Executive Officer' },
  { id: 2, parentId: 1, name: 'CTO', position: 'Chief Technology Officer' },
  { id: 3, parentId: 1, name: 'CFO', position: 'Chief Financial Officer' },
  { id: 4, parentId: 2, name: 'Dev Manager', position: 'Development Manager' },
  { id: 5, parentId: 2, name: 'QA Manager', position: 'Quality Assurance Manager' },
  { id: 6, parentId: 4, name: 'Senior Dev', position: 'Senior Developer' },
  { id: 7, parentId: 4, name: 'Junior Dev', position: 'Junior Developer' }
];

export const mockConnectionsData = [
  { from: '3', to: '2', label: 'Budget Approval' },
  { from: '5', to: '6', label: 'Code Review' }
];

export function generateLargeHierarchicalData(nodeCount) {
  const data = [{ id: 1, parentId: null, name: 'Root', position: 'Root Node' }];
  
  for (let i = 2; i <= nodeCount; i++) {
    const parentId = Math.floor(Math.random() * (i - 1)) + 1;
    data.push({
      id: i,
      parentId: parentId,
      name: `Node ${i}`,
      position: `Position ${i}`
    });
  }
  
  return data;
}

export const mockCustomNodeContent = (d) => `
  <div style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
    <h3>${d.data.name}</h3>
    <p>${d.data.position}</p>
  </div>
`;
```

---

## Test Implementation Guidelines

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Setup and Teardown
- Clean up DOM elements after each test
- Reset chart state between tests
- Use beforeEach/afterEach for common setup

### 3. Mocking and Stubbing
- Mock external dependencies (D3, DOM APIs)
- Stub time-dependent functions for consistent testing
- Use vi.fn() for callback testing

### 4. Assertions
- Test both positive and negative cases
- Verify method chaining returns
- Check side effects and state changes

### 5. Test Data
- Use realistic but minimal test data
- Create reusable fixtures
- Test edge cases (empty data, large datasets)

### 6. Async Testing
- Use proper async/await patterns
- Wait for animations and transitions
- Handle timing-dependent operations

### 7. Error Handling
- Test error conditions
- Verify graceful degradation
- Check console output for warnings

---

## Test Execution Commands

```bash
# Run all tests
npx vitest run

# Run tests with coverage
npx vitest run --coverage

# Run specific test suite
npx vitest run --reporter=verbose --grep="Constructor"

# Run tests in watch mode
npx vitest

# Run tests in UI mode
npx vitest --ui

# Run E2E tests
npm run test:e2e

# Run visual regression tests
npm run test:visual

# Run performance tests
npm run test:performance
```

---

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - run: npm ci
    - run: npx vitest run --coverage
    - run: npm run test:e2e
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
```

---

This comprehensive test plan covers all public functions and methods of the D3 Org Chart library, ensuring robust testing across different scenarios, browsers, and use cases. The plan should be implemented incrementally, starting with unit tests for core functionality and expanding to integration and E2E tests.