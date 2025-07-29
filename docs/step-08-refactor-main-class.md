# Step 8: Refactor Main OrgChart Class

## Objective
Refactor the main OrgChart class to act as an orchestrator that coordinates all the extracted modules, maintaining the same public API while using the modular architecture internally.

## Files to Create/Modify

### `src/core/OrgChart.js`
```javascript
import * as d3 from 'd3';
import { ChartState } from './ChartState.js';
import { DataProcessor } from '../data/DataProcessor.js';
import { NodeManager } from '../data/NodeManager.js';
import { LayoutManager } from '../layout/LayoutManager.js';
import { Renderer } from '../rendering/Renderer.js';
import { ZoomManager } from '../interaction/ZoomManager.js';
import { NavigationManager } from '../interaction/NavigationManager.js';
import { EventManager } from '../interaction/EventManager.js';
import { FullscreenManager } from '../interaction/FullscreenManager.js';
import { ExportManager } from '../export/ExportManager.js';
import { PrintManager } from '../export/PrintManager.js';

export class OrgChart {
  constructor(initialConfig = {}) {
    // Initialize state management
    this.state = new ChartState(initialConfig);
    
    // Initialize modules
    this.initializeModules();
    
    // Set up public API methods
    this.setupPublicAPI();
    
    // Initialize the chart
    this.initialize();
  }

  initializeModules() {
    // Data management
    this.dataProcessor = new DataProcessor(
      this.state.getState().nodeId,
      this.state.getState().parentNodeId
    );
    this.nodeManager = new NodeManager(this.dataProcessor, this.state);
    
    // Layout management
    this.layoutManager = new LayoutManager(this.state);
    
    // Rendering
    this.renderer = new Renderer(this.state);
    
    // Interaction management
    this.zoomManager = new ZoomManager(this.state);
    this.navigationManager = new NavigationManager(
      this.state, 
      this.nodeManager, 
      this.update.bind(this)
    );
    this.eventManager = new EventManager(
      this.state, 
      this.navigationManager, 
      this.nodeManager
    );
    this.fullscreenManager = new FullscreenManager(this.state);
    
    // Export management
    this.exportManager = new ExportManager(this.state);
    this.printManager = new PrintManager(this.state, this.exportManager);
  }

  setupPublicAPI() {
    const attrs = this.state.getState();
    
    // Create getter/setter methods for all configuration properties
    Object.keys(attrs).forEach((key) => {
      this[key] = (value) => {
        if (!arguments.length) return this.state.getState()[key];
        this.state.updateState({ [key]: value });
        return this;
      };
    });

    // Expose state getter
    this.getChartState = () => this.state.getState();
  }

  initialize() {
    const attrs = this.state.getState();
    
    // Set up layout bindings with diagonal functions
    const layoutBindings = this.layoutManager.getLayoutBindings();
    layoutBindings.setDiagonal('top', this.diagonal.bind(this));
    layoutBindings.setDiagonal('bottom', this.diagonal.bind(this));
    layoutBindings.setDiagonal('left', this.hdiagonal.bind(this));
    layoutBindings.setDiagonal('right', this.hdiagonal.bind(this));
    
    // Store layout bindings in state
    this.state.updateState({ layoutBindings: layoutBindings.bindings });
    
    // Initialize zoom behavior
    const zoomBehavior = this.zoomManager.initializeZoom();
    this.state.updateState({ zoomBehavior });
  }

  // Main render method
  render() {
    const attrs = this.state.getState();
    
    // Check if data is available
    if (!attrs.data || attrs.data.length === 0) {
      console.log('ORG CHART - Data is empty');
      this.clearChart();
      return this;
    }

    // Initialize SVG if first draw
    if (attrs.firstDraw) {
      this.renderer.initializeSVG();
      this.renderer.setupWindowResize();
      this.state.updateState({ firstDraw: false });
    }

    // Set up layouts
    this.setLayouts({ expandNodesFirst: false });
    
    // Display tree contents
    this.update(attrs.root);
    
    return this;
  }

  clearChart() {
    const attrs = this.state.getState();
    const container = d3.select(attrs.container);
    
    container.select('.nodes-wrapper').remove();
    container.select('.links-wrapper').remove();
    container.select('.connections-wrapper').remove();
  }

  setLayouts({ expandNodesFirst = true }) {
    const attrs = this.state.getState();
    
    // Generate root from data
    attrs.root = this.dataProcessor.generateRoot(attrs.data);
    if (!attrs.root) return;

    // Process hierarchy data
    attrs.root = this.dataProcessor.processHierarchyData(attrs.root, attrs);
    
    // Initialize flex tree layout
    this.layoutManager.initializeFlexTreeLayout();
    
    // Store all nodes
    attrs.allNodes = attrs.root.descendants();
    
    // Handle node expansion
    if (expandNodesFirst) {
      // Expand all nodes first
      attrs.root.children?.forEach(this.navigationManager.expand.bind(this.navigationManager));
      
      // Then collapse them all
      attrs.root.children?.forEach(this.navigationManager.collapse.bind(this.navigationManager));
      
      // Collapse root if level is 0
      if (attrs.initialExpandLevel === 0) {
        this.navigationManager.collapse(attrs.root);
      }
      
      // Then only expand nodes which have expanded property set to true
      [attrs.root].forEach(ch => this.navigationManager.expandSomeNodes(ch));
    }
    
    this.state.updateState(attrs);
  }

  update({ x0, y0, x = 0, y = 0, width, height }) {
    const attrs = this.state.getState();
    
    // Apply layout
    const { nodes, links } = this.layoutManager.applyLayout(attrs.root);
    
    // Process connections
    const { visibleConnections } = this.processConnections(nodes);
    
    // Render everything
    this.renderer.render(nodes, links, visibleConnections, { x0, y0, x, y, width, height });
    
    // Store old positions for transition
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    
    // Handle centering
    this.handleCentering();
    
    return this;
  }

  processConnections(nodes) {
    const attrs = this.state.getState();
    const connections = attrs.connections || [];
    
    // Create node maps
    const allNodesMap = {};
    const visibleNodesMap = {};
    
    attrs.allNodes.forEach(d => allNodesMap[attrs.nodeId(d.data)] = d);
    nodes.forEach(d => visibleNodesMap[attrs.nodeId(d.data)] = d);
    
    // Process connections
    connections.forEach(connection => {
      connection._source = allNodesMap[connection.from];
      connection._target = allNodesMap[connection.to];
    });
    
    const visibleConnections = connections.filter(d => 
      visibleNodesMap[d.from] && visibleNodesMap[d.to]
    );
    
    return { visibleConnections };
  }

  handleCentering() {
    const attrs = this.state.getState();
    
    if (!attrs.setActiveNodeCentered) return;
    
    const centeredNode = attrs.allNodes.filter(d => d.data._centered)[0];
    if (!centeredNode) return;
    
    let centeredNodes;
    if (centeredNode.data._centeredWithDescendants) {
      centeredNodes = centeredNode.descendants().filter((d, i) => i < 7);
    } else {
      centeredNodes = centeredNode.descendants().filter((d, i, arr) => {
        const h = Math.round(arr.length / 2);
        return i <= h;
      });
    }
    
    this.zoomManager.fit({
      animate: true,
      nodes: centeredNodes
    });
  }

  // Diagonal generation methods
  hdiagonal(s, t, m, offsets) {
    const state = this.state.getState();
    return state.hdiagonal(s, t, m, offsets);
  }

  diagonal(s, t, m, offsets) {
    const state = this.state.getState();
    return state.diagonal(s, t, m, offsets);
  }

  // Public API methods that delegate to modules
  addNode(obj) {
    const success = this.nodeManager.addNode(obj);
    if (success) {
      this.updateNodesState();
    }
    return this;
  }

  removeNode(nodeId) {
    const success = this.nodeManager.removeNode(nodeId);
    if (success) {
      this.render();
    }
    return this;
  }

  setExpanded(id, expandedFlag = true) {
    const success = this.nodeManager.setExpanded(id, expandedFlag);
    if (success) {
      this.updateNodesState();
    }
    return this;
  }

  setCentered(nodeId) {
    const success = this.nodeManager.setCentered(nodeId);
    if (success) {
      this.updateNodesState();
    }
    return this;
  }

  setHighlighted(nodeId) {
    const success = this.nodeManager.setHighlighted(nodeId);
    if (success) {
      this.updateNodesState();
    }
    return this;
  }

  setUpToTheRootHighlighted(nodeId) {
    const success = this.nodeManager.setUpToTheRootHighlighted(nodeId);
    if (success) {
      this.updateNodesState();
    }
    return this;
  }

  clearHighlighting() {
    this.nodeManager.clearHighlighting();
    this.updateNodesState();
    return this;
  }

  expandAll() {
    this.navigationManager.expandAll();
    return this;
  }

  collapseAll() {
    this.navigationManager.collapseAll();
    return this;
  }

  initialExpandLevel(level) {
    this.navigationManager.initialExpandLevel(level);
    this.updateNodesState();
    return this;
  }

  updateNodesState() {
    this.setLayouts({ expandNodesFirst: true });
    this.update(this.state.getState().root);
    return this;
  }

  // Zoom methods
  initialZoom(zoomLevel) {
    this.zoomManager.initialZoom(zoomLevel);
    return this;
  }

  zoomIn() {
    this.zoomManager.zoomIn();
    return this;
  }

  zoomOut() {
    this.zoomManager.zoomOut();
    return this;
  }

  fit(options) {
    this.zoomManager.fit(options);
    return this;
  }

  // Export methods
  exportImg(options) {
    this.exportManager.exportPNG(options);
    return this;
  }

  exportSvg() {
    this.exportManager.exportSVG();
    return this;
  }

  downloadImage(options) {
    this.exportManager.imageExporter.downloadImage(options);
    return this;
  }

  // Fullscreen
  fullscreen(elem) {
    this.fullscreenManager.fullscreen(elem);
    return this;
  }

  // Utility methods
  clear() {
    const attrs = this.state.getState();
    d3.select(window).on(`resize.${attrs.id}`, null);
    if (attrs.svg) {
      attrs.svg.remove();
    }
    return this;
  }

  // Backward compatibility methods
  getTextWidth(text, options) {
    return MathUtils.getTextWidth(text, options);
  }
}
```

### `src/index.js`
```javascript
// Main entry point
export { OrgChart } from './core/OrgChart.js';

// Export individual modules for advanced usage
export { ChartState } from './core/ChartState.js';
export { DataProcessor } from './data/DataProcessor.js';
export { NodeManager } from './data/NodeManager.js';
export { LayoutManager } from './layout/LayoutManager.js';
export { Renderer } from './rendering/Renderer.js';
export { ZoomManager } from './interaction/ZoomManager.js';
export { ExportManager } from './export/ExportManager.js';

// Export utilities
export { DOMUtils } from './utils/DOMUtils.js';
export { MathUtils } from './utils/MathUtils.js';
export { ExportUtils } from './utils/ExportUtils.js';
export { Constants, DEFAULT_CONFIG, LAYOUT_TYPES, NODE_STATES } from './utils/Constants.js';
```

## Current Code Structure

The main OrgChart class currently contains:
- Configuration management (lines 58-101)
- All business logic methods
- Rendering logic
- Event handling
- Export functionality
- Utility functions

## Refactoring Steps

1. **Create New OrgChart Class**
   - Create `src/core/OrgChart.js`
   - Import all necessary modules
   - Set up module coordination

2. **Maintain Public API**
   - Preserve all existing public methods
   - Ensure method chaining still works
   - Keep backward compatibility

3. **Delegate to Modules**
   - Route method calls to appropriate modules
   - Coordinate between modules when needed
   - Handle state synchronization

4. **Create Main Entry Point**
   - Create `src/index.js`
   - Export main class and modules
   - Provide access to utilities

5. **Update Build Configuration**
   - Update build scripts to use new entry point
   - Ensure bundling works correctly
   - Test module imports

6. **Validate Functionality**
   - Run all existing tests
   - Ensure no breaking changes
   - Test all public API methods

## Implementation Strategy

1. **Incremental Replacement**
   - Replace one method at a time
   - Test after each replacement
   - Maintain working state throughout

2. **Module Coordination**
   - Ensure modules can communicate
   - Handle shared state properly
   - Coordinate updates between modules

3. **Error Handling**
   - Preserve existing error handling
   - Add module-specific error handling
   - Ensure graceful degradation

## Validation Criteria

- [ ] All public API methods work identically
- [ ] Method chaining is preserved
- [ ] No breaking changes to existing code
- [ ] All tests pass without modification
- [ ] Performance is maintained or improved
- [ ] Memory usage is not significantly increased

## Files Modified
- Remove: `src/d3-org-chart.js` (original monolithic file)
- New: `src/core/OrgChart.js` (refactored main class)
- New: `src/index.js` (main entry point)
- Update: Build configuration files
- Update: Package.json entry points

## Next Step
After completion, proceed to Step 9: Update Tests and Documentation