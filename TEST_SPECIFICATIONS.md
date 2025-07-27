# D3 Org Chart - Public API Test Specifications

This document outlines all public methods of the OrgChart class and the unit tests that should be created for each method.

## Core Rendering Methods

### 1. `render()`
**Purpose**: Main rendering method that draws the entire org chart

**Unit Tests**:
- **Should render chart with valid data**
  - Given: Valid hierarchical data
  - Expected: Chart container is created with SVG elements
  - Expected: Nodes and links are rendered correctly

- **Should handle empty data gracefully**
  - Given: Empty data array
  - Expected: No error thrown, empty chart displayed
  - Expected: Console log "ORG CHART - Data is empty"

- **Should create proper DOM structure**
  - Given: Valid data
  - Expected: SVG element with correct width/height
  - Expected: Container groups (nodes-wrapper, links-wrapper, connections-wrapper) are created

- **Should apply zoom behavior**
  - Given: Chart is rendered
  - Expected: Zoom behavior is attached to SVG
  - Expected: Double-click zoom is disabled

- **Should handle window resize**
  - Given: Rendered chart
  - When: Window is resized
  - Expected: Chart dimensions update accordingly

### 2. `update(node)`
**Purpose**: Updates the visual representation based on node state changes

**Unit Tests**:
- **Should update node positions after expansion**
  - Given: Node with collapsed children
  - When: Node is expanded
  - Expected: Child nodes appear with correct positions

- **Should animate transitions**
  - Given: Node state change
  - Expected: Transitions use configured duration
  - Expected: Smooth animation between states

- **Should handle compact layout positioning**
  - Given: Compact mode enabled
  - Expected: Nodes positioned in compact arrangement
  - Expected: Proper spacing between compact nodes

## Data Management Methods

### 3. `addNode(obj)`
**Purpose**: Adds a new node to the chart at runtime

**Unit Tests**:
- **Should add root node to empty chart**
  - Given: Empty chart and root node object
  - Expected: Node is added and chart re-renders
  - Expected: Data array contains the new node

- **Should add child node to existing parent**
  - Given: Existing parent node and valid child object
  - Expected: Child is added under correct parent
  - Expected: Chart updates to show new node

- **Should reject duplicate node IDs**
  - Given: Node with existing ID
  - Expected: Console log warning about duplicate
  - Expected: Node is not added

- **Should reject node without valid parent**
  - Given: Child node with non-existent parent ID
  - Expected: Console log error about missing parent
  - Expected: Node is not added

### 4. `removeNode(nodeId)`
**Purpose**: Removes a node and all its descendants from the chart

**Unit Tests**:
- **Should remove node and descendants**
  - Given: Node ID with children
  - Expected: Node and all descendants are removed
  - Expected: Data array no longer contains removed nodes

- **Should handle non-existent node ID**
  - Given: Invalid node ID
  - Expected: Console log warning about node not found
  - Expected: No changes to chart data

- **Should update chart after removal**
  - Given: Valid node removal
  - Expected: Chart re-renders without removed nodes
  - Expected: Remaining nodes maintain correct structure

## State Management Methods

### 5. `setExpanded(id, expandedFlag)`
**Purpose**: Programmatically expands or collapses a specific node

**Unit Tests**:
- **Should expand collapsed node**
  - Given: Collapsed node ID and expandedFlag=true
  - Expected: Node children become visible
  - Expected: Node's _expanded property is true

- **Should collapse expanded node**
  - Given: Expanded node ID and expandedFlag=false
  - Expected: Node children become hidden
  - Expected: Node's _expanded property is false

- **Should handle invalid node ID**
  - Given: Non-existent node ID
  - Expected: Console log error message
  - Expected: No state changes

### 6. `setCentered(nodeId)`
**Purpose**: Centers the chart view on a specific node

**Unit Tests**:
- **Should center on valid node**
  - Given: Valid node ID
  - Expected: Chart view centers on specified node
  - Expected: Node's _centered property is true

- **Should expand ancestors when centering**
  - Given: Node with collapsed ancestors
  - Expected: All ancestor nodes are expanded
  - Expected: Path to centered node is visible

- **Should handle invalid node ID**
  - Given: Non-existent node ID
  - Expected: Console log error message
  - Expected: No centering occurs

### 7. `setHighlighted(nodeId)`
**Purpose**: Highlights a specific node

**Unit Tests**:
- **Should highlight valid node**
  - Given: Valid node ID
  - Expected: Node's _highlighted property is true
  - Expected: Visual highlighting applied

- **Should clear previous highlighting**
  - Given: Previously highlighted node
  - When: New node is highlighted
  - Expected: Previous highlighting is removed

### 8. `setUpToTheRootHighlighted(nodeId)`
**Purpose**: Highlights a node and all its ancestors up to root

**Unit Tests**:
- **Should highlight node and ancestors**
  - Given: Valid node ID
  - Expected: Node and all ancestors have _upToTheRootHighlighted=true
  - Expected: Visual highlighting applied to entire path

### 9. `clearHighlighting()`
**Purpose**: Removes all highlighting from the chart

**Unit Tests**:
- **Should clear all highlighting flags**
  - Given: Chart with highlighted nodes
  - Expected: All _highlighted and _upToTheRootHighlighted flags are false
  - Expected: Visual highlighting is removed

## Expansion/Collapse Methods

### 10. `expandAll()`
**Purpose**: Expands all nodes in the chart

**Unit Tests**:
- **Should expand all collapsed nodes**
  - Given: Chart with some collapsed nodes
  - Expected: All nodes have _expanded=true
  - Expected: All children are visible

- **Should update chart display**
  - Given: Collapsed nodes exist
  - Expected: Chart re-renders showing all nodes
  - Expected: Proper layout with all nodes visible

### 11. `collapseAll()`
**Purpose**: Collapses all nodes except root

**Unit Tests**:
- **Should collapse all non-root nodes**
  - Given: Fully expanded chart
  - Expected: Only root node remains expanded
  - Expected: All other nodes have _expanded=false

- **Should maintain root node visibility**
  - Given: Any chart state
  - Expected: Root node remains visible
  - Expected: Root's immediate children may be visible based on initialExpandLevel

## Zoom and Navigation Methods

### 12. `zoomIn()`
**Purpose**: Zooms into the chart

**Unit Tests**:
- **Should increase zoom scale**
  - Given: Chart at current zoom level
  - Expected: Zoom scale increases by factor of 1.3
  - Expected: Smooth transition animation

- **Should respect scale extent limits**
  - Given: Chart at maximum zoom
  - Expected: Zoom does not exceed scaleExtent maximum

### 13. `zoomOut()`
**Purpose**: Zooms out of the chart

**Unit Tests**:
- **Should decrease zoom scale**
  - Given: Chart at current zoom level
  - Expected: Zoom scale decreases by factor of 0.78
  - Expected: Smooth transition animation

- **Should respect scale extent limits**
  - Given: Chart at minimum zoom
  - Expected: Zoom does not go below scaleExtent minimum

### 14. `fit(options)`
**Purpose**: Fits the chart to show all or specified nodes

**Unit Tests**:
- **Should fit all nodes by default**
  - Given: Chart with various node positions
  - Expected: All nodes are visible within viewport
  - Expected: Optimal zoom level is calculated

- **Should fit specific nodes when provided**
  - Given: Subset of nodes specified
  - Expected: Only specified nodes are fitted
  - Expected: Other nodes may be outside viewport

- **Should handle animation option**
  - Given: animate=false option
  - Expected: Immediate fit without transition
  - Given: animate=true option
  - Expected: Smooth transition to fit

### 15. `initialZoom(zoomLevel)`
**Purpose**: Sets initial zoom level for the chart

**Unit Tests**:
- **Should set zoom to specified level**
  - Given: Zoom level value
  - Expected: Chart zoom is set to specified level
  - Expected: No animation for initial zoom

## Export Methods

### 16. `exportImg(options)`
**Purpose**: Exports the chart as PNG image

**Unit Tests**:
- **Should export with default options**
  - Given: No options provided
  - Expected: PNG image is generated
  - Expected: Default scale and background applied

- **Should handle custom scale**
  - Given: scale=5 option
  - Expected: High resolution image generated
  - Expected: Image dimensions scaled appropriately

- **Should handle full chart export**
  - Given: full=true option
  - Expected: Entire chart fits in exported image
  - Expected: All nodes are visible in export

- **Should handle custom background color**
  - Given: backgroundColor="#FFFFFF" option
  - Expected: Image has specified background color

### 17. `exportSvg()`
**Purpose**: Exports the chart as SVG

**Unit Tests**:
- **Should generate SVG file**
  - Given: Chart with data
  - Expected: SVG file is created
  - Expected: SVG contains all chart elements

- **Should preserve styling**
  - Given: Chart with custom styles
  - Expected: SVG maintains visual appearance
  - Expected: All CSS styles are embedded

## Utility Methods

### 18. `fullscreen(elem)`
**Purpose**: Enters fullscreen mode for the chart

**Unit Tests**:
- **Should request fullscreen on container**
  - Given: No element specified
  - Expected: Chart container goes fullscreen
  - Expected: Chart resizes to fullscreen dimensions

- **Should request fullscreen on specified element**
  - Given: Custom element selector
  - Expected: Specified element goes fullscreen

- **Should handle fullscreen exit**
  - Given: Fullscreen mode active
  - When: Fullscreen is exited
  - Expected: Chart returns to original dimensions

### 19. `clear()`
**Purpose**: Cleans up the chart and removes event listeners

**Unit Tests**:
- **Should remove SVG element**
  - Given: Rendered chart
  - Expected: SVG element is removed from DOM
  - Expected: Container is empty

- **Should remove event listeners**
  - Given: Chart with active listeners
  - Expected: Window resize listener is removed
  - Expected: No memory leaks from event handlers

### 20. `getChartState()`
**Purpose**: Returns the current state/configuration of the chart

**Unit Tests**:
- **Should return complete state object**
  - Given: Configured chart
  - Expected: Object contains all configuration properties
  - Expected: State reflects current chart settings

- **Should return live state**
  - Given: Chart with modified properties
  - Expected: Returned state reflects current values
  - Expected: Changes are immediately reflected

## Configuration Getter/Setter Methods

### 21. Dynamic Property Methods
**Purpose**: All configuration properties have getter/setter methods

**Unit Tests for each property**:
- **Should get current value**
  - Given: Property with set value
  - Expected: Getter returns current value

- **Should set new value**
  - Given: New value for property
  - Expected: Property is updated
  - Expected: Method returns chart instance for chaining

- **Should enable method chaining**
  - Given: Multiple property setters
  - Expected: Methods can be chained together
  - Expected: All properties are set correctly

**Key properties to test**:
- `data()` - Chart data
- `container()` - Container selector
- `svgWidth()` / `svgHeight()` - Dimensions
- `nodeWidth()` / `nodeHeight()` - Node dimensions
- `layout()` - Layout direction
- `compact()` - Compact mode
- `duration()` - Animation duration
- `onNodeClick()` - Click callback
- `onExpandOrCollapse()` - Expand/collapse callback

## Integration Test Scenarios

### 22. Complete Workflow Tests
**Purpose**: Test common usage patterns

**Unit Tests**:
- **Should handle complete data lifecycle**
  - Given: Empty chart
  - When: Data is loaded, nodes added/removed, expanded/collapsed
  - Expected: Chart maintains consistency throughout

- **Should handle rapid state changes**
  - Given: Multiple quick operations
  - Expected: Chart handles concurrent updates gracefully
  - Expected: Final state is consistent

- **Should maintain performance with large datasets**
  - Given: Large hierarchical dataset
  - Expected: Rendering completes within reasonable time
  - Expected: Interactions remain responsive