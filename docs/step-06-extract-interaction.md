# Step 6: Extract Interaction Management

## Objective
Extract interaction management including zoom, pan, navigation, and event handling from the monolithic OrgChart class into dedicated interaction modules.

## Files to Create

### `src/interaction/ZoomManager.js`
```javascript
import * as d3 from 'd3';

export class ZoomManager {
  constructor(state) {
    this.state = state;
  }

  initializeZoom() {
    const attrs = this.state.getState();
    
    // Get zooming function
    attrs.zoomBehavior = attrs.createZoom()
      .clickDistance(10)
      .on('start', (event, d) => attrs.onZoomStart(event))
      .on('end', (event, d) => attrs.onZoomEnd(event))
      .on("zoom", (event, d) => {
        attrs.onZoom(event);
        this.zoomed(event, d);
      })
      .scaleExtent(attrs.scaleExtent);

    return attrs.zoomBehavior;
  }

  zoomed(event, d) {
    const attrs = this.state.getState();
    
    // Get d3 event's transform object
    const transform = event.transform;
    
    // Store it
    attrs.lastTransform = transform;
    
    // Reposition and rescale chart accordingly
    attrs.chart.attr("transform", transform);
    
    // Apply new styles to the foreign object element
    attrs.centerG.selectAll('.node-foreign-object')
      .attr('transform', `scale(${1 / transform.k})`);
  }

  initialZoom(zoomLevel) {
    const attrs = this.state.getState();
    attrs.svg.call(attrs.zoomBehavior.transform, d3.zoomIdentity.scale(zoomLevel));
  }

  zoomIn() {
    const attrs = this.state.getState();
    attrs.svg.transition().call(attrs.zoomBehavior.scaleBy, 1.3);
  }

  zoomOut() {
    const attrs = this.state.getState();
    attrs.svg.transition().call(attrs.zoomBehavior.scaleBy, 0.78);
  }

  zoomTreeBounds({ x0, x1, y0, y1, params = { animate: true, scale: true, onCompleted: () => { } } }) {
    const attrs = this.state.getState();
    const { centerG, svgWidth: w, svgHeight: h, svg, zoomBehavior, duration, lastTransform } = attrs;
    
    let scaleVal = Math.min(8, 0.9 / Math.max((x1 - x0) / w, (y1 - y0) / h));
    let identity = d3.zoomIdentity.translate(w / 2, h / 2);
    identity = identity.scale(params.scale ? scaleVal : lastTransform.k);
    identity = identity.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    
    // Transition zoom wrapper component into specified bounds
    svg.transition().duration(params.animate ? duration : 0).call(zoomBehavior.transform, identity);
    centerG.transition().duration(params.animate ? duration : 0).attr('transform', 'translate(0,0)')
      .on('end', function () {
        params.onCompleted();
      });
  }

  fit({ animate = true, nodes, scale = true, onCompleted = () => { } } = {}) {
    const attrs = this.state.getState();
    const { root } = attrs;
    
    let descendants = nodes ? nodes : root.descendants();
    const minX = d3.min(descendants, d => d.x + attrs.layoutBindings[attrs.layout].nodeLeftX(d));
    const maxX = d3.max(descendants, d => d.x + attrs.layoutBindings[attrs.layout].nodeRightX(d));
    const minY = d3.min(descendants, d => d.y + attrs.layoutBindings[attrs.layout].nodeTopY(d));
    const maxY = d3.max(descendants, d => d.y + attrs.layoutBindings[attrs.layout].nodeBottomY(d));

    this.zoomTreeBounds({
      x0: minX, x1: maxX, y0: minY, y1: maxY,
      params: { animate, scale, onCompleted }
    });
  }
}
```

### `src/interaction/NavigationManager.js`
```javascript
export class NavigationManager {
  constructor(state, nodeManager, updateCallback) {
    this.state = state;
    this.nodeManager = nodeManager;
    this.updateCallback = updateCallback;
  }

  onButtonClick(event, d) {
    const attrs = this.state.getState();
    
    // If children are expanded
    if (d.children) {
      // Collapse them
      d._children = d.children;
      d.children = null;
      
      // Set descendants expanded property to false
      this.setExpansionFlagToChildren(d, false);
    } else {
      // Expand children
      d.children = d._children;
      d._children = null;
      
      // Set each child as expanded
      if (d.children) {
        d.children.forEach(({ data }) => (data._expanded = true));
      }
    }

    // Redraw Graph
    this.updateCallback(d);
    event.stopPropagation();

    // Trigger callback
    attrs.onExpandOrCollapse(d);
  }

  setExpansionFlagToChildren({ data, children, _children }, flag) {
    // Set flag to the current property
    data._expanded = flag;

    // Loop over and recursively update expanded children's descendants
    if (children) {
      children.forEach(d => {
        this.setExpansionFlagToChildren(d, flag);
      });
    }

    // Loop over and recursively update collapsed children's descendants
    if (_children) {
      _children.forEach(d => {
        this.setExpansionFlagToChildren(d, flag);
      });
    }
  }

  expandSomeNodes(d) {
    // If node has expanded property set
    if (d.data._expanded) {
      let parent = d.parent;
      
      // While we can go up
      while (parent) {
        // Expand all current parent's children
        if (parent._children) {
          parent.children = parent._children;
          parent._children = null;
        }
        
        // Replace current parent holding object
        parent = parent.parent;
      }
    }

    // Recursively do the same for collapsed nodes
    if (d._children) {
      d._children.forEach(ch => this.expandSomeNodes(ch));
    }

    // Recursively do the same for expanded nodes
    if (d.children) {
      d.children.forEach(ch => this.expandSomeNodes(ch));
    }
  }

  expandAll() {
    const attrs = this.state.getState();
    attrs.data.forEach(d => d._expanded = true);
    this.updateCallback(attrs.root);
  }

  collapseAll() {
    const attrs = this.state.getState();
    attrs.allNodes.forEach(d => d.data._expanded = false);
    this.initialExpandLevel(0);
    this.updateCallback(attrs.root);
  }

  initialExpandLevel(level) {
    const attrs = this.state.getState();
    
    if (level >= 0) {
      attrs.root.descendants().forEach(d => {
        d.data._expanded = d.depth < level;
      });
    }
  }

  collapse(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
      d._children.forEach(ch => this.collapse(ch));
    }
  }

  expand(d) {
    if (d._children) {
      d.children = d._children;
      d._children = null;
      d.children.forEach(ch => this.expand(ch));
    }
  }
}
```

### `src/interaction/EventManager.js`
```javascript
export class EventManager {
  constructor(state, navigationManager, nodeManager) {
    this.state = state;
    this.navigationManager = navigationManager;
    this.nodeManager = nodeManager;
  }

  handleNodeClick(event, node) {
    const attrs = this.state.getState();
    
    // Check if click is on button
    if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
      return;
    }
    
    // Check if click is on paging button
    if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
      this.nodeManager.loadPagingNodes(node);
      return;
    }
    
    // Execute user-defined callback
    attrs.onNodeClick(node);
  }

  handleNodeKeydown(event, node) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.navigationManager.onButtonClick(event, node);
    }
  }

  handleButtonClick(event, node) {
    this.navigationManager.onButtonClick(event, node);
  }

  handleButtonKeydown(event, node) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.navigationManager.onButtonClick(event, node);
    }
  }

  setupKeyboardNavigation() {
    const attrs = this.state.getState();
    
    // Add keyboard event listeners for accessibility
    d3.select(attrs.container)
      .on('keydown', (event) => {
        const focusedNode = d3.select(document.activeElement);
        
        switch (event.key) {
          case 'ArrowUp':
          case 'ArrowDown':
          case 'ArrowLeft':
          case 'ArrowRight':
            this.handleArrowNavigation(event, focusedNode);
            break;
          case 'Enter':
          case ' ':
            this.handleActivation(event, focusedNode);
            break;
          case 'Escape':
            this.handleEscape(event);
            break;
        }
      });
  }

  handleArrowNavigation(event, focusedNode) {
    // Implementation for keyboard navigation between nodes
    event.preventDefault();
    // This would involve finding the next/previous node based on direction
    // and updating focus accordingly
  }

  handleActivation(event, focusedNode) {
    // Handle Enter/Space key activation
    const nodeData = focusedNode.datum();
    if (nodeData) {
      this.handleButtonClick(event, nodeData);
    }
  }

  handleEscape(event) {
    // Handle escape key - could be used to clear selections or exit modes
    const attrs = this.state.getState();
    this.nodeManager.clearHighlighting();
  }
}
```

### `src/interaction/FullscreenManager.js`
```javascript
import * as d3 from 'd3';

export class FullscreenManager {
  constructor(state) {
    this.state = state;
  }

  fullscreen(elem) {
    const attrs = this.state.getState();
    const el = d3.select(elem || attrs.container).node();

    // Set up fullscreen change event listener
    d3.select(document).on('fullscreenchange.' + attrs.id, function (d) {
      if (!document.fullscreenElement) {
        // Exiting fullscreen
        setTimeout(d => {
          attrs.svg.attr('height', attrs.svgHeight);
        }, 500);
      } else {
        // Entering fullscreen
        setTimeout(d => {
          attrs.svg.attr('height', window.innerHeight - 40);
        }, 500);
      }
    });

    // Request fullscreen using appropriate method
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  isFullscreen() {
    return !!(document.fullscreenElement || 
             document.mozFullScreenElement || 
             document.webkitFullscreenElement || 
             document.msFullscreenElement);
  }
}
```

## Current Code to Extract

From the main OrgChart class, extract these interaction-related methods:
- Lines 287-298: Zoom behavior initialization
- Lines 872-881: `zoomed` method
- Lines 264-267: `initialZoom` method
- Lines 972-981: `zoomIn` and `zoomOut` methods
- Lines 884-897: `zoomTreeBounds` method
- Lines 898-907: `fit` method
- Lines 748-770: `onButtonClick` method
- Lines 771-781: `setExpansionFlagToChildren` method
- Lines 782-800: `expandSomeNodes` method
- Lines 1023-1032: `expandAll` and `collapseAll` methods
- Lines 862-871: `collapse` and `expand` methods
- Lines 953-971: `fullscreen` method

## Implementation Steps

1. **Create ZoomManager Module**
   - Create `src/interaction/ZoomManager.js`
   - Move zoom, pan, and fit functionality
   - Include zoom behavior initialization and event handling

2. **Create NavigationManager Module**
   - Create `src/interaction/NavigationManager.js`
   - Move node expansion/collapse logic
   - Include tree navigation methods

3. **Create EventManager Module**
   - Create `src/interaction/EventManager.js`
   - Move event handling logic
   - Include keyboard navigation support

4. **Create FullscreenManager Module**
   - Create `src/interaction/FullscreenManager.js`
   - Move fullscreen functionality
   - Include cross-browser fullscreen support

5. **Update Main Class**
   - Import interaction modules in OrgChart class
   - Replace direct interaction calls with manager methods
   - Remove extracted interaction methods

6. **Update Tests**
   - Create unit tests for interaction modules
   - Test zoom, pan, and navigation functionality
   - Ensure event handling works correctly

## Validation Criteria

- [ ] Zoom and pan operations work smoothly
- [ ] Node expansion/collapse functions correctly
- [ ] Keyboard navigation is accessible
- [ ] Fullscreen mode operates properly
- [ ] Event handling maintains expected behavior
- [ ] Tests pass without modification

## Files Modified
- `src/d3-org-chart.js` (remove interaction methods, add imports)
- New: `src/interaction/ZoomManager.js`
- New: `src/interaction/NavigationManager.js`
- New: `src/interaction/EventManager.js`
- New: `src/interaction/FullscreenManager.js`

## Next Step
After completion, proceed to Step 7: Extract Export Functionality