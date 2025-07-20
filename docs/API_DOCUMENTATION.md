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

---

## Export and Utilities

### `exportSvg()`

Exports the chart as an SVG file.

**Returns:** `void`

**Example:**
```javascript
chart.exportSvg(); // Downloads SVG file
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