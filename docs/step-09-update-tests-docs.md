# Step 9: Update Tests and Documentation

## Objective
Update all tests to work with the new modular architecture and update documentation to reflect the new structure while maintaining backward compatibility.

## Test Updates Required

### Unit Tests for New Modules

#### `test/unit/core/ChartState.test.js`
```javascript
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
    
    chartState.svgWidth(1200);
    expect(chartState.svgWidth()).toBe(1200);
  });

  test('should update state', () => {
    chartState.updateState({ svgWidth: 1500, layout: 'bottom' });
    const state = chartState.getState();
    
    expect(state.svgWidth).toBe(1500);
    expect(state.layout).toBe('bottom');
  });
});
```

#### `test/unit/utils/DOMUtils.test.js`
```javascript
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
```

#### `test/unit/data/DataProcessor.test.js`
```javascript
import { describe, test, expect, beforeEach } from 'vitest';
import { DataProcessor } from '../../../src/data/DataProcessor.js';

describe('DataProcessor', () => {
  let dataProcessor;
  let sampleData;

  beforeEach(() => {
    dataProcessor = new DataProcessor(d => d.id, d => d.parentId);
    sampleData = [
      { id: '1', parentId: null, name: 'Root' },
      { id: '2', parentId: '1', name: 'Child 1' },
      { id: '3', parentId: '1', name: 'Child 2' },
      { id: '4', parentId: '2', name: 'Grandchild' }
    ];
  });

  test('should generate root hierarchy', () => {
    const root = dataProcessor.generateRoot(sampleData);
    
    expect(root).toBeTruthy();
    expect(root.data.id).toBe('1');
    expect(root.children).toHaveLength(2);
  });

  test('should return null for empty data', () => {
    const root = dataProcessor.generateRoot([]);
    expect(root).toBeNull();
  });

  test('should collect node children', () => {
    const root = dataProcessor.generateRoot(sampleData);
    const nodeStore = [];
    
    dataProcessor.getNodeChildren(root, nodeStore);
    
    expect(nodeStore).toHaveLength(4);
    expect(nodeStore.map(d => d.id)).toEqual(['1', '2', '3', '4']);
  });
});
```

### Integration Tests

#### `test/integration/modular-integration.test.js`
```javascript
import { describe, test, expect, beforeEach } from 'vitest';
import { OrgChart } from '../../src/index.js';
import { mockData } from '../fixtures/mockData.js';

describe('Modular Integration', () => {
  let chart;
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="chart-container"></div>';
    container = '#chart-container';
    
    chart = new OrgChart()
      .container(container)
      .data(mockData)
      .svgWidth(800)
      .svgHeight(600);
  });

  test('should maintain backward compatibility', () => {
    // Test that all original methods still exist and work
    expect(typeof chart.render).toBe('function');
    expect(typeof chart.addNode).toBe('function');
    expect(typeof chart.removeNode).toBe('function');
    expect(typeof chart.setExpanded).toBe('function');
    expect(typeof chart.exportImg).toBe('function');
    
    // Test method chaining
    const result = chart.svgWidth(1000).svgHeight(800);
    expect(result).toBe(chart);
  });

  test('should render chart with modular architecture', () => {
    chart.render();
    
    const svg = document.querySelector('#chart-container svg');
    expect(svg).toBeTruthy();
    
    const nodes = document.querySelectorAll('.node');
    expect(nodes.length).toBeGreaterThan(0);
  });

  test('should handle node operations', () => {
    chart.render();
    
    const initialNodeCount = chart.getChartState().data.length;
    
    // Add node
    chart.addNode({ id: 'new-node', parentId: mockData[0].id, name: 'New Node' });
    expect(chart.getChartState().data.length).toBe(initialNodeCount + 1);
    
    // Remove node
    chart.removeNode('new-node');
    expect(chart.getChartState().data.length).toBe(initialNodeCount);
  });

  test('should handle zoom operations', () => {
    chart.render();
    
    // Test zoom methods don't throw errors
    expect(() => chart.zoomIn()).not.toThrow();
    expect(() => chart.zoomOut()).not.toThrow();
    expect(() => chart.fit()).not.toThrow();
  });
});
```

### Update Existing Tests

#### Update `test/constructor.test.js`
```javascript
// Add imports for new modules
import { OrgChart } from '../src/index.js';

// Update tests to work with new structure
describe('Constructor', () => {
  test('should create chart with modular architecture', () => {
    const chart = new OrgChart();
    
    // Test that internal modules are initialized
    expect(chart.state).toBeTruthy();
    expect(chart.dataProcessor).toBeTruthy();
    expect(chart.layoutManager).toBeTruthy();
    expect(chart.renderer).toBeTruthy();
    
    // Test that public API is preserved
    expect(typeof chart.render).toBe('function');
    expect(typeof chart.data).toBe('function');
  });
});
```

## Documentation Updates

### Update `docs/API_DOCUMENTATION.md`

Add section about modular architecture:

```markdown
## Modular Architecture

The d3-org-chart library now uses a modular architecture for better maintainability and extensibility. While the public API remains unchanged, the internal structure has been reorganized into focused modules:

### Core Modules
- **ChartState**: Manages configuration and state
- **OrgChart**: Main orchestrator class

### Data Management
- **DataProcessor**: Handles data transformation and hierarchy creation
- **NodeManager**: Manages node operations (add, remove, update)

### Layout Management
- **LayoutManager**: Coordinates layout operations
- **LayoutBindings**: Layout-specific positioning functions
- **CompactLayout**: Compact layout calculations

### Rendering
- **Renderer**: Main rendering orchestrator
- **NodeRenderer**: Node rendering logic
- **LinkRenderer**: Link rendering logic
- **ConnectionRenderer**: Connection rendering logic

### Interaction
- **ZoomManager**: Zoom and pan functionality
- **NavigationManager**: Node navigation (expand/collapse)
- **EventManager**: Event handling
- **FullscreenManager**: Fullscreen functionality

### Export
- **ExportManager**: High-level export interface
- **ImageExporter**: PNG/SVG export functionality
- **PrintManager**: Print functionality

### Advanced Usage

For advanced use cases, you can import and use individual modules:

```javascript
import { 
  OrgChart, 
  DataProcessor, 
  LayoutManager, 
  ExportManager 
} from 'd3-org-chart';

// Use individual modules for custom implementations
const dataProcessor = new DataProcessor(d => d.id, d => d.parentId);
const exportManager = new ExportManager(chartState);
```
```

### Update `README.md`

Add section about the new architecture:

```markdown
## Architecture

This library uses a modular architecture that separates concerns into focused modules:

- **Maintainable**: Each module has a single responsibility
- **Testable**: Modules can be unit tested independently  
- **Extensible**: Easy to extend or replace individual modules
- **Backward Compatible**: Public API remains unchanged

The modular design makes it easier to:
- Add new layout types
- Implement custom rendering logic
- Extend export functionality
- Add new interaction patterns

For most use cases, you'll only need to import the main `OrgChart` class. Advanced users can import individual modules for custom implementations.
```

### Create `docs/MIGRATION_GUIDE.md`

```markdown
# Migration Guide

## From Monolithic to Modular Architecture

The d3-org-chart library has been refactored to use a modular architecture. This guide helps you understand the changes and migrate if needed.

## What Changed

### Internal Structure
- Single file split into focused modules
- Better separation of concerns
- Improved testability and maintainability

### What Stayed the Same
- **Public API**: All existing methods work exactly the same
- **Method Chaining**: Fluent API is preserved
- **Configuration**: All options work as before
- **Backward Compatibility**: Existing code continues to work

## No Migration Required

If you're using the standard public API, no changes are needed:

```javascript
// This continues to work exactly as before
const chart = new OrgChart()
  .container('#chart')
  .data(data)
  .svgWidth(800)
  .render();
```

## Advanced Usage

If you want to leverage the new modular architecture:

```javascript
// Import individual modules
import { 
  OrgChart, 
  ExportManager, 
  LayoutManager 
} from 'd3-org-chart';

// Create custom implementations
const customExporter = new ExportManager(chartState);
```

## Benefits

- **Better Performance**: Potential for tree-shaking unused modules
- **Easier Testing**: Each module can be tested independently
- **Extensibility**: Easier to add new features or customize behavior
- **Maintainability**: Cleaner, more organized codebase
```

## Test Configuration Updates

### Update `vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'docs/',
        'sandbox/',
        '**/*.config.js'
      ],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90
      }
    }
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
});
```

## Implementation Steps

1. **Create Unit Tests for New Modules**
   - Test each module independently
   - Ensure proper functionality
   - Achieve required coverage

2. **Update Integration Tests**
   - Test module interactions
   - Verify backward compatibility
   - Test complete workflows

3. **Update Existing Tests**
   - Modify imports to use new entry point
   - Update test assertions if needed
   - Ensure all tests pass

4. **Update Documentation**
   - Add modular architecture documentation
   - Update API documentation
   - Create migration guide

5. **Update Build Configuration**
   - Update test configurations
   - Ensure coverage requirements are met
   - Test build process

## Validation Criteria

- [ ] All new modules have unit tests with >90% coverage
- [ ] Integration tests verify module interactions
- [ ] All existing tests pass without modification
- [ ] Documentation accurately reflects new architecture
- [ ] Migration guide is clear and helpful
- [ ] Build process works correctly
- [ ] No breaking changes to public API

## Files Modified
- New: `test/unit/` directory with module tests
- New: `test/integration/modular-integration.test.js`
- Update: All existing test files to use new imports
- Update: `docs/API_DOCUMENTATION.md`
- Update: `README.md`
- New: `docs/MIGRATION_GUIDE.md`
- Update: `vitest.config.js`

## Next Step
After completion, proceed to Step 10: Final Integration and Cleanup