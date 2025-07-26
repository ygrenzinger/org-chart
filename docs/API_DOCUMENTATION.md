# D3 Org Chart - Complete API Documentation

This document provides comprehensive documentation for all public functions and methods available in the D3 Org Chart library.

## Table of Contents

1. [Constructor](#constructor)
2. [Core Methods](#core-methods)
3. [Configuration Methods (Getter/Setter)](#configuration-methods-gettersetter)
4. [Event Handling](#event-handling)
5. [Data Management](#data-management)
6. [Layout and Rendering](#layout-and-rendering)
7. [User Interaction](#user-interaction)
8. [Export and Utilities](#export-and-utilities)

---

## Constructor

### `new OrgChart()`

Creates a new instance of the OrgChart class.

**Returns:** `OrgChart` - A new OrgChart instance

**Example:**
```javascript
const chart = new OrgChart();
```

---

## Core Methods

### `render()`

Renders or re-renders the organization chart with the current configuration and data.

**Returns:** `OrgChart` - The chart instance for method chaining

**Description:**
- Processes the data and creates the hierarchical structure
- Calculates node positions using the layout algorithm
- Renders nodes, links, and connections
- Applies zoom and pan behaviors
- Handles expand/collapse functionality

**Example:**
```javascript
chart.render();
```

**Notes:**
- Must be called after setting data and container
- Can be called multiple times to update the chart
- Automatically handles empty data scenarios

### `getChartState()`

Returns the internal state object containing all configuration and runtime data.

**Returns:** `Object` - The complete internal state object

**Description:**
- Provides access to all internal configuration properties
- Includes runtime calculated values
- Useful for debugging and advanced customization

**Example:**
```javascript
const state = chart.getChartState();
console.log(state.svgWidth, state.data);
```

### `initialZoom(zoomLevel)`

Sets the initial zoom level for the chart.

**Parameters:**
- `zoomLevel` (Number): The zoom scale factor (e.g., 1.0 for 100%, 0.5 for 50%)

**Returns:** `OrgChart` - The chart instance for method chaining

**Example:**
```javascript
chart.initialZoom(0.8); // Set to 80% zoom
```

### `clear()`

Cleans up the chart and removes all event listeners.

**Returns:** `void`

**Description:**
- Removes all SVG elements
- Cleans up event listeners
- Should be called when removing the chart from the page

**Example:**
```javascript
chart.clear();
```

---

## Configuration Methods (Getter/Setter)

All configuration properties support both getter and setter functionality through dynamically created methods.

### Pattern
```javascript
// Getter - returns current value
const value = chart.propertyName();

// Setter - sets new value and returns chart instance for chaining
chart.propertyName(newValue);
```

### Core Configuration

#### `container(selector)`

Sets or gets the container element for the chart.

**Parameters:**
- `selector` (String|Element): CSS selector string or DOM element

**Returns:** `String|Element|OrgChart` - Current container (getter) or chart instance (setter)

**Example:**
```javascript
chart.container('#my-chart'); // Set container
const container = chart.container(); // Get container
```

#### `data(dataArray)`

Sets or gets the hierarchical data for the chart.

**Parameters:**
- `dataArray` (Array): Array of objects representing nodes

**Returns:** `Array|OrgChart` - Current data (getter) or chart instance (setter)

**Data Format:**
```javascript
const data = [
  { id: 1, parentId: null, name: 'CEO' },
  { id: 2, parentId: 1, name: 'CTO' },
  { id: 3, parentId: 1, name: 'CFO' }
];
chart.data(data);
```

#### `svgWidth(width)` / `svgHeight(height)`

Sets or gets the SVG dimensions.

**Parameters:**
- `width/height` (Number): Dimension in pixels

**Returns:** `Number|OrgChart` - Current dimension (getter) or chart instance (setter)

**Example:**
```javascript
chart.svgWidth(1200).svgHeight(800);
```

### Node Configuration

#### `nodeWidth(accessor)` / `nodeHeight(accessor)`

Sets or gets the node dimensions.

**Parameters:**
- `accessor` (Function|Number): Function that returns width/height or static value

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

**Example:**
```javascript
chart.nodeWidth(250).nodeHeight(150);
// Or dynamic sizing
chart.nodeWidth(d => d.data.isManager ? 300 : 200);
```

#### `nodeContent(contentFunction)`

Sets or gets the HTML content generator for nodes.

**Parameters:**
- `contentFunction` (Function): Function that returns HTML string for node content

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Example:**
```javascript
chart.nodeContent(d => `
  <div style="padding: 10px;">
    <h3>${d.data.name}</h3>
    <p>${d.data.position}</p>
  </div>
`);
```

#### `buttonContent(contentFunction)`

Sets or gets the expand/collapse button content.

**Parameters:**
- `contentFunction` (Function): Function that returns HTML for button

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Example:**
```javascript
chart.buttonContent(({ node, state }) => 
  `<button>${node.children ? '-' : '+'}</button>`
);
```

#### `pagingButton(contentFunction)`

Sets or gets the paging button content and styling function.

**Parameters:**
- `contentFunction` (Function): Function that returns HTML for paging button

**Function Parameters:**
- `d` (Object): Node data object
- `i` (Number): Index in array
- `arr` (Array): Full array of nodes
- `state` (Object): Chart state object

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Description:**
- Controls the appearance of paging buttons that appear when there are many child nodes
- Has access to paging step calculations and node counts
- Can customize both content and styling

**Example:**
```javascript
chart.pagingButton((d, i, arr, state) => {
  const step = state.pagingStep(d.parent);
  const diff = d.parent.data._directSubordinates - d.parent.data._directSubordinatesPaging;
  const min = Math.min(diff, step);
  return `<div>Show ${min} more</div>`;
});
```

### Layout Configuration

#### `layout(direction)`

Sets or gets the layout direction.

**Parameters:**
- `direction` (String): 'top', 'bottom', 'left', or 'right'

**Returns:** `String|OrgChart` - Current layout (getter) or chart instance (setter)

**Example:**
```javascript
chart.layout('left'); // Horizontal layout
```

#### `compact(isCompact)`

Sets or gets compact mode.

**Parameters:**
- `isCompact` (Boolean): Whether to use compact positioning

**Returns:** `Boolean|OrgChart` - Current setting (getter) or chart instance (setter)

**Example:**
```javascript
chart.compact(true); // Enable compact mode
```

### Spacing Configuration

#### `rootMargin(margin)`

Sets or gets the root node margin from the top.

**Parameters:**
- `margin` (Number): Margin in pixels

**Returns:** `Number|OrgChart` - Current margin (getter) or chart instance (setter)

#### `siblingsMargin(accessor)`

Sets or gets the margin between sibling nodes.

**Parameters:**
- `accessor` (Function|Number): Function or static value for margin

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

#### `childrenMargin(accessor)`

Sets or gets the margin between parent and children.

**Parameters:**
- `accessor` (Function|Number): Function or static value for margin

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

#### `neighbourMargin(accessor)`

Sets or gets the margin between neighboring nodes.

**Parameters:**
- `accessor` (Function): Function that takes two nodes and returns margin

**Returns:** `Function|OrgChart` - Current accessor (getter) or chart instance (setter)

### Animation Configuration

#### `duration(milliseconds)`

Sets or gets the animation duration.

**Parameters:**
- `milliseconds` (Number): Animation duration in milliseconds

**Returns:** `Number|OrgChart` - Current duration (getter) or chart instance (setter)

**Example:**
```javascript
chart.duration(500); // 500ms animations
```

### Zoom Configuration

#### `scaleExtent(extent)`

Sets or gets the zoom scale limits.

**Parameters:**
- `extent` (Array): [minScale, maxScale] array

**Returns:** `Array|OrgChart` - Current extent (getter) or chart instance (setter)

**Example:**
```javascript
chart.scaleExtent([0.1, 5]); // Allow 10% to 500% zoom
```

### Paging Configuration

#### `pagingStep(accessor)`

Sets or gets the number of nodes to show when paging through large node sets.

**Parameters:**
- `accessor` (Function|Number): Function or static value for paging step size

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

**Default:** `d => 5`

**Example:**
```javascript
chart.pagingStep(10); // Show 10 nodes per page
```

#### `minPagingVisibleNodes(accessor)`

Sets or gets the minimum number of visible nodes before paging buttons appear.

**Parameters:**
- `accessor` (Function|Number): Function or static value for minimum visible nodes

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

**Default:** `d => 2000`

**Example:**
```javascript
chart.minPagingVisibleNodes(1000); // Show paging when more than 1000 nodes
```

### Button Configuration

#### `nodeButtonWidth(accessor)` / `nodeButtonHeight(accessor)`

Sets or gets the expand/collapse button dimensions.

**Parameters:**
- `accessor` (Function|Number): Function or static value for button dimension

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

**Default:** `d => 40`

**Example:**
```javascript
chart.nodeButtonWidth(50).nodeButtonHeight(50);
```

#### `nodeButtonX(accessor)` / `nodeButtonY(accessor)`

Sets or gets the expand/collapse button position relative to the node.

**Parameters:**
- `accessor` (Function|Number): Function or static value for button position

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

**Default:** `d => -20`

**Example:**
```javascript
chart.nodeButtonX(-25).nodeButtonY(-25);
```

### Compact Layout Configuration

#### `compactMarginPair(accessor)`

Sets or gets the margin between two nodes in compact mode.

**Parameters:**
- `accessor` (Function|Number): Function or static value for compact pair margin

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

**Default:** `d => 100`

#### `compactMarginBetween(accessor)`

Sets or gets the margin between nodes in compact mode rows.

**Parameters:**
- `accessor` (Function|Number): Function or static value for compact between margin

**Returns:** `Function|Number|OrgChart` - Current accessor (getter) or chart instance (setter)

**Default:** `d => 20`

### Additional Configuration

#### `defaultFont(fontFamily)`

Sets or gets the default font family for the chart.

**Parameters:**
- `fontFamily` (String): Font family name

**Returns:** `String|OrgChart` - Current font (getter) or chart instance (setter)

**Default:** `"Helvetica"`

**Example:**
```javascript
chart.defaultFont('Arial, sans-serif');
```

#### `imageName(name)`

Sets or gets the default filename for exported images.

**Parameters:**
- `name` (String): Base filename for exports

**Returns:** `String|OrgChart` - Current name (getter) or chart instance (setter)

**Default:** `'Chart'`

**Example:**
```javascript
chart.imageName('OrgChart-2024');
```

#### `setActiveNodeCentered(centered)`

Sets or gets whether active nodes should be centered when expanded/collapsed.

**Parameters:**
- `centered` (Boolean): Whether to center active nodes

**Returns:** `Boolean|OrgChart` - Current setting (getter) or chart instance (setter)

**Default:** `true`

#### `linkYOffset(offset)`

Sets or gets the Y offset for links (useful for Safari compatibility).

**Parameters:**
- `offset` (Number): Y offset in pixels

**Returns:** `Number|OrgChart` - Current offset (getter) or chart instance (setter)

**Default:** `30`

#### `createZoom(zoomFunction)`

Sets or gets the zoom behavior creation function.

**Parameters:**
- `zoomFunction` (Function): Function that returns a D3 zoom behavior

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Default:** `d => d3.zoom()`

---

## Event Handling

### `onNodeClick(callback)`

Sets or gets the node click event handler.

**Parameters:**
- `callback` (Function): Function called when a node is clicked

**Returns:** `Function|OrgChart` - Current callback (getter) or chart instance (setter)

**Example:**
```javascript
chart.onNodeClick(d => {
  console.log('Clicked node:', d.data);
});
```

### `onExpandOrCollapse(callback)`

Sets or gets the expand/collapse event handler.

**Parameters:**
- `callback` (Function): Function called when a node is expanded or collapsed

**Returns:** `Function|OrgChart` - Current callback (getter) or chart instance (setter)

### `onZoom(callback)` / `onZoomStart(callback)` / `onZoomEnd(callback)`

Sets or gets zoom event handlers.

**Parameters:**
- `callback` (Function): Function called during zoom events

**Returns:** `Function|OrgChart` - Current callback (getter) or chart instance (setter)

**Example:**
```javascript
chart.onZoom(event => {
  console.log('Zoom level:', event.transform.k);
});
```

---

## Data Management

### `nodeId(accessor)`

Sets or gets the node ID accessor function.

**Parameters:**
- `accessor` (Function): Function that returns the unique ID for a node

**Returns:** `Function|OrgChart` - Current accessor (getter) or chart instance (setter)

**Default:** `d => d.nodeId || d.id`

### `parentNodeId(accessor)`

Sets or gets the parent node ID accessor function.

**Parameters:**
- `accessor` (Function): Function that returns the parent ID for a node

**Returns:** `Function|OrgChart` - Current accessor (getter) or chart instance (setter)

**Default:** `d => d.parentNodeId || d.parentId`

### `connections(connectionsArray)`

Sets or gets connection data for drawing relationships between non-hierarchical nodes.

**Parameters:**
- `connectionsArray` (Array): Array of connection objects

**Returns:** `Array|OrgChart` - Current connections (getter) or chart instance (setter)

**Connection Format:**
```javascript
const connections = [
  { from: "node1", to: "node2", label: "Reports to" }
];
chart.connections(connections);
```

---

## Layout and Rendering

### `layoutBindings(bindings)`

Sets or gets custom layout binding functions for different orientations.

**Parameters:**
- `bindings` (Object): Object containing layout-specific positioning functions

**Returns:** `Object|OrgChart` - Current bindings (getter) or chart instance (setter)

### `nodeUpdate(updateFunction)`

Sets or gets the node update function for custom node styling.

**Parameters:**
- `updateFunction` (Function): Function called during node updates

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

### `linkUpdate(updateFunction)`

Sets or gets the link update function for custom link styling.

**Parameters:**
- `updateFunction` (Function): Function called during link updates

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

### `connectionsUpdate(updateFunction)`

Sets or gets the connections update function for custom connection styling.

**Parameters:**
- `updateFunction` (Function): Function called during connection updates

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Description:**
- Allows customization of connection lines between non-hierarchical nodes
- Called for each connection during rendering
- Provides access to connection data and DOM elements

**Example:**
```javascript
chart.connectionsUpdate(function(d) {
  d3.select(this)
    .attr("stroke", "#E27396")
    .attr("stroke-width", 3);
});
```

### `nodeEnter(enterFunction)`

Sets or gets the node enter function for custom node entry behavior.

**Parameters:**
- `enterFunction` (Function): Function called when nodes enter the DOM

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Description:**
- Called when new nodes are added to the chart
- Allows custom initialization of node elements
- Part of D3's enter-update-exit pattern

### `nodeExit(exitFunction)`

Sets or gets the node exit function for custom node removal behavior.

**Parameters:**
- `exitFunction` (Function): Function called when nodes exit the DOM

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Description:**
- Called when nodes are removed from the chart
- Allows custom cleanup or exit animations
- Part of D3's enter-update-exit pattern

### `defs(defsFunction)`

Sets or gets the SVG definitions function for custom markers and patterns.

**Parameters:**
- `defsFunction` (Function): Function that returns SVG defs content

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Description:**
- Defines SVG markers, gradients, patterns, and other reusable elements
- Used for connection arrows and custom visual elements
- Called during chart rendering to populate SVG defs section

### `linkGroupArc(arcFunction)`

Sets or gets the arc generator for connection links.

**Parameters:**
- `arcFunction` (Function): D3 arc generator function

**Returns:** `Function|OrgChart` - Current function (getter) or chart instance (setter)

**Default:** `d3.linkHorizontal().x(d => d.x).y(d => d.y)`

**Description:**
- Controls how connection lines are drawn between nodes
- Uses D3's link generators for smooth curves
- Can be customized for different connection styles

---

## User Interaction

### `expandAll()`

Expands all nodes in the chart.

**Returns:** `OrgChart` - The chart instance for method chaining

**Example:**
```javascript
chart.expandAll().render();
```

### `collapseAll()`

Collapses all nodes in the chart.

**Returns:** `OrgChart` - The chart instance for method chaining

**Example:**
```javascript
chart.collapseAll().render();
```

### `zoomIn()`

Programmatically zooms in the chart.

**Returns:** `void`

### `zoomOut()`

Programmatically zooms out the chart.

**Returns:** `void`

### `clearHighlighting()`

Removes all node highlighting.

**Returns:** `OrgChart` - The chart instance for method chaining

### `addNode(nodeObject)`

Adds a new node to the chart at runtime.

**Parameters:**
- `nodeObject` (Object): Node data object to add

**Returns:** `OrgChart` - The chart instance for method chaining

**Description:**
- Adds a node to the existing data structure
- Automatically re-renders the chart
- Validates parent-child relationships

**Example:**
```javascript
chart.addNode({
  id: 'new-node',
  parentId: 'existing-parent',
  name: 'New Employee'
});
```

### `removeNode(nodeId)`

Removes a node and all its descendants from the chart.

**Parameters:**
- `nodeId` (String|Number): ID of the node to remove

**Returns:** `OrgChart` - The chart instance for method chaining

**Description:**
- Removes the specified node and all its children
- Updates the data structure and re-renders
- Handles cleanup of related connections

**Example:**
```javascript
chart.removeNode('node-to-remove');
```

### `setExpanded(nodeId, expandedFlag)`

Sets the expanded state of a specific node.

**Parameters:**
- `nodeId` (String|Number): ID of the node to expand/collapse
- `expandedFlag` (Boolean): True to expand, false to collapse (default: true)

**Returns:** `OrgChart` - The chart instance for method chaining

**Example:**
```javascript
chart.setExpanded('node-1', true);  // Expand node
chart.setExpanded('node-2', false); // Collapse node
```

### `setCentered(nodeId)`

Centers the view on a specific node and ensures its ancestors are expanded.

**Parameters:**
- `nodeId` (String|Number): ID of the node to center on

**Returns:** `OrgChart` - The chart instance for method chaining

**Description:**
- Expands all ancestors of the target node
- Centers the view on the specified node
- Useful for navigation and highlighting specific parts of the hierarchy

**Example:**
```javascript
chart.setCentered('target-node-id');
```

### `setHighlighted(nodeId)`

Highlights a specific node with visual emphasis.

**Parameters:**
- `nodeId` (String|Number): ID of the node to highlight

**Returns:** `OrgChart` - The chart instance for method chaining

**Example:**
```javascript
chart.setHighlighted('important-node');
```

### `setUpToTheRootHighlighted(nodeId)`

Highlights a node and all its ancestors up to the root.

**Parameters:**
- `nodeId` (String|Number): ID of the node to highlight with ancestors

**Returns:** `OrgChart` - The chart instance for method chaining

**Description:**
- Highlights the specified node and all nodes in its path to root
- Useful for showing reporting chains or hierarchical paths

**Example:**
```javascript
chart.setUpToTheRootHighlighted('leaf-node');
```

### `fit(options)`

Fits the chart to show all or specific nodes within the viewport.

**Parameters:**
- `options` (Object): Configuration object for fitting behavior

**Options:**
- `animate` (Boolean): Whether to animate the transition (default: true)
- `nodes` (Array): Specific nodes to fit (default: all nodes)
- `scale` (Boolean): Whether to scale to fit (default: true)
- `onCompleted` (Function): Callback after fit completes

**Returns:** `OrgChart` - The chart instance for method chaining

**Example:**
```javascript
chart.fit({ animate: true, scale: true });
```

### `fullscreen(element)`

Enters fullscreen mode for the chart.

**Parameters:**
- `element` (String|Element): Element to make fullscreen (default: chart container)

**Returns:** `void`

**Description:**
- Requests fullscreen mode for the specified element
- Automatically adjusts chart dimensions for fullscreen
- Handles browser compatibility

**Example:**
```javascript
chart.fullscreen(); // Fullscreen the chart container
```

---

## Export and Utilities

### `exportSvg()`

Exports the chart as an SVG file.

**Returns:** `void`

**Example:**
```javascript
chart.exportSvg(); // Downloads SVG file
```

### `exportImg(options)`

Exports the chart as a PNG image with advanced options.

**Parameters:**
- `options` (Object): Configuration object for image export

**Options:**
- `full` (Boolean): Whether to export full chart or current view (default: false)
- `scale` (Number): Image scale factor for quality (default: 3)
- `onLoad` (Function): Callback after image generation (default: d => d)
- `save` (Boolean): Whether to trigger download (default: true)
- `backgroundColor` (String): Background color (default: "#FAFAFA")

**Returns:** `void`

**Description:**
- Exports high-quality PNG images
- Handles image scaling for better quality
- Supports both full chart and current viewport export
- Automatically handles image serialization and download

**Example:**
```javascript
chart.exportImg({
  full: true,
  scale: 4,
  backgroundColor: '#ffffff',
  onLoad: (dataUrl) => console.log('Image ready:', dataUrl)
});
```

### `downloadImage(options)`

Downloads the chart as a PNG or SVG image.

**Parameters:**
- `options` (Object): Configuration object for image export

**Options:**
- `node` (Element): SVG node to export
- `scale` (Number): Image scale factor (default: 2)
- `imageName` (String): Filename for download
- `isSvg` (Boolean): Whether to export as SVG (default: false for PNG)
- `save` (Boolean): Whether to trigger download (default: true)
- `backgroundColor` (String): Background color (default: "#FAFAFA")
- `onAlreadySerialized` (Function): Callback after serialization
- `onLoad` (Function): Callback after image generation

**Returns:** `void`

### `getTextWidth(text, options)`

Calculates the width of text with given styling.

**Parameters:**
- `text` (String): Text to measure
- `options` (Object): Styling options

**Options:**
- `fontSize` (Number): Font size in pixels (default: 14)
- `fontWeight` (Number): Font weight (default: 400)
- `defaultFont` (String): Font family (default: "Helvetica")
- `ctx` (CanvasRenderingContext2D): Canvas context for measurement

**Returns:** `Number` - Text width in pixels

### `diagonal(source, target, middle, offsets)`

Generates a custom diagonal path between two points.

**Parameters:**
- `source` (Object): Source point with x, y coordinates
- `target` (Object): Target point with x, y coordinates  
- `middle` (Object): Optional middle point for curved paths
- `offsets` (Object): Optional offset values for path adjustment

**Returns:** `String` - SVG path string for the diagonal

**Description:**
- Creates smooth curved diagonal connections between nodes
- Supports custom middle points for complex routing
- Used internally for vertical layout link generation
- Can be customized for advanced link styling

**Example:**
```javascript
const pathString = chart.diagonal(
  { x: 100, y: 50 },
  { x: 200, y: 150 },
  null,
  { sy: 10 }
);
```

### `hdiagonal(source, target, middle, offsets)`

Generates a horizontal diagonal path between two points.

**Parameters:**
- `source` (Object): Source point with x, y coordinates
- `target` (Object): Target point with x, y coordinates
- `middle` (Object): Optional middle point for curved paths
- `offsets` (Object): Optional offset values for path adjustment

**Returns:** `String` - SVG path string for the horizontal diagonal

**Description:**
- Creates smooth curved horizontal diagonal connections between nodes
- Optimized for horizontal layout orientations
- Supports custom curve radius and path adjustments
- Used internally for horizontal layout link generation

**Example:**
```javascript
const pathString = chart.hdiagonal(
  { x: 50, y: 100 },
  { x: 150, y: 200 },
  { x: 100, y: 150 },
  { sy: 5 }
);
```

---

## Advanced Methods

### `initializeEnterExitUpdatePattern()`

Initializes the D3 enter-exit-update pattern for the chart.

**Returns:** `void`

**Description:**
- Sets up the patternify method on D3 selections
- Called automatically during construction
- Used internally for efficient DOM updates

### `getNodeChildren(node, nodeStore)`

Recursively collects all children of a given node.

**Parameters:**
- `node` (Object): Node object with data, children, and _children properties
- `nodeStore` (Array): Array to store collected nodes

**Returns:** `Array` - Array of all descendant nodes

### `isEdge()`

Determines if the current environment is Microsoft Edge browser.

**Returns:** `Boolean` - True if running in Edge browser

### `restyleForeignObjectElements()`

Applies styling fixes for foreign object elements.

**Returns:** `void`

**Description:**
- Handles browser-specific styling issues
- Called automatically during rendering

### `updateNodesState()`

Updates the internal state of all nodes.

**Returns:** `void`

**Description:**
- Recalculates node positions and properties
- Updates expand/collapse states
- Called automatically during rendering

---

## Usage Examples

### Basic Setup
```javascript
const chart = new OrgChart()
  .container('#chart-container')
  .data(hierarchicalData)
  .svgWidth(1200)
  .svgHeight(800)
  .render();
```

### Advanced Configuration
```javascript
const chart = new OrgChart()
  .container('#chart-container')
  .data(data)
  .layout('left')
  .compact(true)
  .nodeWidth(d => d.data.isManager ? 300 : 250)
  .nodeHeight(150)
  .nodeContent(d => `
    <div class="node-content">
      <img src="${d.data.avatar}" alt="${d.data.name}">
      <h3>${d.data.name}</h3>
      <p>${d.data.position}</p>
    </div>
  `)
  .onNodeClick(d => showNodeDetails(d.data))
  .duration(600)
  .render();
```

### Dynamic Updates
```javascript
// Update data and re-render
chart.data(newData).render();

// Change layout
chart.layout('top').render();

// Expand all nodes
chart.expandAll();

// Export as image
chart.downloadImage({
  imageName: 'org-chart',
  scale: 3,
  backgroundColor: '#ffffff'
});
```

---

## Notes

- All setter methods return the chart instance, enabling method chaining
- The chart automatically handles responsive sizing when container dimensions change
- Configuration changes require calling `render()` to take effect
- The library uses D3.js v7 for DOM manipulation and data binding
- Custom styling can be applied through CSS or the provided styling functions