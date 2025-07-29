# Step 5: Extract Rendering Logic

## Objective
Extract rendering logic for nodes, links, and connections from the monolithic OrgChart class into dedicated rendering modules.

## Files to Create

### `src/rendering/NodeRenderer.js`
```javascript
import * as d3 from 'd3';
import { DOMUtils } from '../utils/DOMUtils.js';

export class NodeRenderer {
  constructor(state) {
    this.state = state;
  }

  renderNodes(nodesWrapper, nodes, { x0, y0, x, y, width, height }) {
    const attrs = this.state.getState();
    
    // Get nodes selection
    const nodeSelection = nodesWrapper
      .selectAll("g.node")
      .data(nodes, ({ data }) => attrs.nodeId(data));

    // Enter any new nodes at the parent's previous position
    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => {
        const xj = attrs.layoutBindings[attrs.layout].nodeJoinX({ x: x0, y: y0, width, height });
        const yj = attrs.layoutBindings[attrs.layout].nodeJoinY({ x: x0, y: y0, width, height });
        return `translate(${xj},${yj})`;
      })
      .attr("cursor", "pointer")
      .on("click.node", (event, node) => this.handleNodeClick(event, node))
      .on("keydown.node", (event, node) => this.handleNodeKeydown(event, node));

    // Allow external node enter modifications
    nodeEnter.each(attrs.nodeEnter);

    // Add background rectangle for the nodes
    const nodesSelection = DOMUtils.patternify(nodeEnter, 'node-rect', 'rect', d => [d]);

    // Node update styles
    const nodeUpdate = nodeEnter
      .merge(nodeSelection)
      .style("font", "12px sans-serif");

    // Add foreignObject element inside rectangle
    const fo = DOMUtils.patternify(nodeUpdate, 'node-foreign-object', 'foreignObject', d => [d])
      .style('overflow', 'visible');

    // Add foreign object div
    DOMUtils.patternify(fo, 'node-foreign-object-div', 'xhtml:div', d => [d]);

    // Restyle foreign object elements
    DOMUtils.restyleForeignObjectElements(nodeUpdate, attrs);

    // Add Node button circle's group (expand-collapse button)
    const nodeButtonGroups = DOMUtils.patternify(nodeUpdate, 'node-button-g', 'g', d => [d])
      .on("click", (event, d) => this.handleButtonClick(event, d))
      .on("keydown", (event, d) => this.handleButtonKeydown(event, d));

    // Add button foreign object
    DOMUtils.patternify(nodeButtonGroups, 'node-button-foreign-object', 'foreignObject', d => [d])
      .attr('pointer-events', 'all')
      .attr('width', d => attrs.nodeButtonWidth(d))
      .attr('height', d => attrs.nodeButtonHeight(d))
      .attr('x', d => attrs.nodeButtonX(d))
      .attr('y', d => attrs.nodeButtonY(d));

    // Add expand collapse button content
    DOMUtils.patternify(nodeButtonGroups.select('.node-button-foreign-object'), 'node-button-div', 'xhtml:div', d => [d])
      .style('pointer-events', 'none')
      .style('display', 'flex')
      .style('width', '100%')
      .style('height', '100%');

    return this.updateNodes(nodeUpdate, nodeSelection, { x, y, width, height });
  }

  updateNodes(nodeUpdate, nodeSelection, { x, y, width, height }) {
    const attrs = this.state.getState();

    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(attrs.duration)
      .attr("opacity", 0)
      .transition()
      .duration(attrs.duration)
      .attr("transform", ({ x, y, width, height }) => {
        return attrs.layoutBindings[attrs.layout].nodeUpdateTransform({ x, y, width, height });
      })
      .attr("opacity", 1);

    // Style node rectangles
    nodeUpdate
      .select(".node-rect")
      .attr("width", ({ width }) => width)
      .attr("height", ({ height }) => height)
      .attr("x", ({ width }) => 0)
      .attr("y", ({ height }) => 0)
      .attr('rx', 3)
      .attr("fill", attrs.nodeDefaultBackground);

    // Position node buttons
    nodeUpdate.select(".node-button-g").attr("transform", ({ data, width, height }) => {
      const x = attrs.layoutBindings[attrs.layout].buttonX({ width, height });
      const y = attrs.layoutBindings[attrs.layout].buttonY({ width, height });
      return `translate(${x},${y})`;
    })
    .attr("display", ({ data }) => {
      return data._directSubordinates > 0 ? "block" : "none";
    })
    .attr("opacity", ({ data, children, _children }) => {
      return data._directSubordinates > 0 ? 1 : 0;
    });

    // Restyle node button content
    nodeUpdate
      .select(".node-button-foreign-object .node-button-div")
      .html((node) => {
        return attrs.buttonContent({ node, state: attrs });
      });

    // Allow external node update modifications
    nodeUpdate.each(attrs.nodeUpdate);

    return this.exitNodes(nodeSelection, { x, y, width, height });
  }

  exitNodes(nodeSelection, { x, y, width, height }) {
    const attrs = this.state.getState();

    // Remove any exiting nodes after transition
    const nodeExitTransition = nodeSelection.exit().transition().duration(attrs.duration);
    nodeExitTransition.each(attrs.nodeExit);

    const maxDepthNode = nodeExitTransition.data().reduce((a, b) => 
      a.depth < b.depth ? a : b, { depth: Infinity });

    nodeExitTransition.attr("opacity", 1)
      .transition()
      .duration(attrs.duration)
      .attr("transform", (d) => {
        const ex = attrs.layoutBindings[attrs.layout].nodeJoinX({ x, y, width, height });
        const ey = attrs.layoutBindings[attrs.layout].nodeJoinY({ x, y, width, height });
        return `translate(${ex},${ey})`;
      })
      .on("end", function () {
        d3.select(this).remove();
      })
      .attr("opacity", 0);
  }

  handleNodeClick(event, node) {
    const attrs = this.state.getState();
    
    if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
      return;
    }
    
    if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
      // Handle paging - this should be delegated to NodeManager
      return;
    }
    
    attrs.onNodeClick(node);
  }

  handleNodeKeydown(event, node) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.handleButtonClick(event, node);
    }
  }

  handleButtonClick(event, node) {
    // This should be delegated to NavigationManager
    event.stopPropagation();
  }

  handleButtonKeydown(event, node) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.handleButtonClick(event, node);
    }
  }
}
```

### `src/rendering/LinkRenderer.js`
```javascript
import * as d3 from 'd3';

export class LinkRenderer {
  constructor(state) {
    this.state = state;
  }

  renderLinks(linksWrapper, links, { x0, y0, x, y, width, height }) {
    const attrs = this.state.getState();

    // Get links selection
    const linkSelection = linksWrapper
      .selectAll("path.link")
      .data(links, (d) => attrs.nodeId(d.data));

    // Enter any new links at the parent's previous position
    const linkEnter = linkSelection
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", (d) => {
        const xo = attrs.layoutBindings[attrs.layout].linkJoinX({ x: x0, y: y0, width, height });
        const yo = attrs.layoutBindings[attrs.layout].linkJoinY({ x: x0, y: y0, width, height });
        const o = { x: xo, y: yo };
        return attrs.layoutBindings[attrs.layout].diagonal(o, o, o);
      });

    // Get links update selection
    const linkUpdate = linkEnter.merge(linkSelection);

    // Styling links
    linkUpdate
      .attr("fill", "none")
      .attr("stroke", "#E4E2E9")
      .attr("stroke-width", 1);

    // Handle Edge browser display issues
    if (DOMUtils.isEdge()) {
      linkUpdate.style('display', d => {
        return d.data._upToTheRootHighlighted ? 'initial' : 'none';
      });
    } else {
      linkUpdate.attr('display', d => {
        return d.data._upToTheRootHighlighted ? 'initial' : 'none';
      });
    }

    // Allow external modifications
    linkUpdate.each(attrs.linkUpdate);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(attrs.duration)
      .attr("d", (d) => {
        const n = attrs.compact && d.flexCompactDim ? {
          x: attrs.layoutBindings[attrs.layout].compactLinkMidX(d, attrs),
          y: attrs.layoutBindings[attrs.layout].compactLinkMidY(d, attrs)
        } : {
          x: attrs.layoutBindings[attrs.layout].linkX(d),
          y: attrs.layoutBindings[attrs.layout].linkY(d)
        };

        const p = {
          x: attrs.layoutBindings[attrs.layout].linkParentX(d),
          y: attrs.layoutBindings[attrs.layout].linkParentY(d),
        };

        const m = attrs.compact && d.flexCompactDim ? {
          x: attrs.layoutBindings[attrs.layout].linkCompactXStart(d),
          y: attrs.layoutBindings[attrs.layout].linkCompactYStart(d),
        } : null;

        return attrs.layoutBindings[attrs.layout].diagonal(n, p, m, { sy: attrs.linkYOffset });
      });

    return this.exitLinks(linkSelection, { x, y, width, height });
  }

  exitLinks(linkSelection, { x, y, width, height }) {
    const attrs = this.state.getState();

    // Remove any links which are exiting after animation
    linkSelection
      .exit()
      .transition()
      .duration(attrs.duration)
      .attr("d", (d) => {
        const xo = attrs.layoutBindings[attrs.layout].linkJoinX({ x, y, width, height });
        const yo = attrs.layoutBindings[attrs.layout].linkJoinY({ x, y, width, height });
        const o = { x: xo, y: yo };
        return attrs.layoutBindings[attrs.layout].diagonal(o, o, null, { sy: attrs.linkYOffset });
      })
      .remove();
  }
}
```

### `src/rendering/ConnectionRenderer.js`
```javascript
import * as d3 from 'd3';

export class ConnectionRenderer {
  constructor(state) {
    this.state = state;
  }

  renderConnections(connectionsWrapper, visibleConnections) {
    const attrs = this.state.getState();

    // Get connections selection
    const connectionsSel = connectionsWrapper
      .selectAll("path.connection")
      .data(visibleConnections);

    // Enter any new connections
    const connEnter = connectionsSel
      .enter()
      .append("path")
      .attr("class", "connection");

    // Get connections update selection
    const connUpdate = connEnter.merge(connectionsSel);

    // Styling connections
    connUpdate.attr("fill", "none")
      .attr('d', (d) => {
        const xs = attrs.layoutBindings[attrs.layout].linkX({ 
          x: d._source.x, y: d._source.y, width: d._source.width, height: d._source.height 
        });
        const ys = attrs.layoutBindings[attrs.layout].linkY({ 
          x: d._source.x, y: d._source.y, width: d._source.width, height: d._source.height 
        });
        const xt = attrs.layoutBindings[attrs.layout].linkJoinX({ 
          x: d._target.x, y: d._target.y, width: d._target.width, height: d._target.height 
        });
        const yt = attrs.layoutBindings[attrs.layout].linkJoinY({ 
          x: d._target.x, y: d._target.y, width: d._target.width, height: d._target.height 
        });
        
        return attrs.linkGroupArc({ source: { x: xs, y: ys }, target: { x: xt, y: yt } });
      });

    // Allow external modifications
    connUpdate.each(attrs.connectionsUpdate);

    // Remove exiting connections
    connectionsSel
      .exit()
      .transition()
      .duration(attrs.duration)
      .attr('opacity', 0)
      .remove();
  }

  renderConnectionDefs(defsWrapper, visibleConnections) {
    const attrs = this.state.getState();
    const defsString = attrs.defs.bind(this)(attrs, visibleConnections);
    const existingString = defsWrapper.html();
    
    if (defsString !== existingString) {
      defsWrapper.html(defsString);
    }
  }
}
```

### `src/rendering/Renderer.js`
```javascript
import * as d3 from 'd3';
import { NodeRenderer } from './NodeRenderer.js';
import { LinkRenderer } from './LinkRenderer.js';
import { ConnectionRenderer } from './ConnectionRenderer.js';
import { DOMUtils } from '../utils/DOMUtils.js';

export class Renderer {
  constructor(state) {
    this.state = state;
    this.nodeRenderer = new NodeRenderer(state);
    this.linkRenderer = new LinkRenderer(state);
    this.connectionRenderer = new ConnectionRenderer(state);
  }

  initializeSVG() {
    const attrs = this.state.getState();
    const container = d3.select(attrs.container);
    const containerRect = container.node().getBoundingClientRect();

    // Add svg
    const svg = DOMUtils.patternify(container, 'svg-chart-container', 'svg', [{}])
      .attr("width", attrs.svgWidth)
      .attr("height", attrs.svgHeight)
      .attr("font-family", attrs.defaultFont);

    // Add zoom behavior
    svg.call(attrs.zoomBehavior)
      .on("dblclick.zoom", null)
      .attr("cursor", "move");

    // Add container g element
    const chart = DOMUtils.patternify(svg, 'chart', 'g', [{}]);
    
    // Add one more container g element for better positioning controls
    const centerG = DOMUtils.patternify(chart, 'center-group', 'g', [{}]);

    // Create wrappers for different elements
    attrs.linksWrapper = DOMUtils.patternify(centerG, 'links-wrapper', 'g', [{}]);
    attrs.nodesWrapper = DOMUtils.patternify(centerG, 'nodes-wrapper', 'g', [{}]);
    attrs.connectionsWrapper = DOMUtils.patternify(centerG, 'connections-wrapper', 'g', [{}]);
    attrs.defsWrapper = DOMUtils.patternify(svg, 'defs-wrapper', 'defs', [{}]);

    // Store references
    attrs.svg = svg;
    attrs.chart = chart;
    attrs.centerG = centerG;

    return { svg, chart, centerG };
  }

  render(nodes, links, visibleConnections, { x0, y0, x, y, width, height }) {
    const attrs = this.state.getState();

    // Set center transform
    attrs.centerG.attr("transform", () => {
      return attrs.layoutBindings[attrs.layout].centerTransform({
        root: attrs.root,
        centerY: attrs.centerY,
        scale: attrs.scale,
        centerX: attrs.centerX
      });
    });

    // Render connection definitions
    this.connectionRenderer.renderConnectionDefs(attrs.defsWrapper, visibleConnections);

    // Render links
    this.linkRenderer.renderLinks(attrs.linksWrapper, links, { x0, y0, x, y, width, height });

    // Render connections
    this.connectionRenderer.renderConnections(attrs.connectionsWrapper, visibleConnections);

    // Render nodes
    this.nodeRenderer.renderNodes(attrs.nodesWrapper, nodes, { x0, y0, x, y, width, height });

    // Restyle foreign object elements
    DOMUtils.restyleForeignObjectElements(attrs.centerG, attrs);
  }

  setupWindowResize() {
    const attrs = this.state.getState();
    
    d3.select(window).on(`resize.${attrs.id}`, () => {
      const containerRect = d3.select(attrs.container).node().getBoundingClientRect();
      attrs.svg.attr('width', containerRect.width);
    });
  }
}
```

## Current Code to Extract

From the main OrgChart class, extract these rendering-related methods:
- Lines 479-541: Link rendering logic
- Lines 568-705: Node rendering logic
- Lines 542-567: Connection rendering logic
- Lines 315-342: SVG initialization
- Lines 346-351: Window resize handling

## Implementation Steps

1. **Create NodeRenderer Module**
   - Create `src/rendering/NodeRenderer.js`
   - Move node rendering, updating, and event handling logic
   - Include button rendering and foreign object management

2. **Create LinkRenderer Module**
   - Create `src/rendering/LinkRenderer.js`
   - Move link rendering and transition logic
   - Include diagonal path generation

3. **Create ConnectionRenderer Module**
   - Create `src/rendering/ConnectionRenderer.js`
   - Move connection rendering logic
   - Include definition management

4. **Create Main Renderer Module**
   - Create `src/rendering/Renderer.js`
   - Coordinate all rendering operations
   - Manage SVG initialization and layout

5. **Update Main Class**
   - Import rendering modules in OrgChart class
   - Replace direct rendering calls with renderer methods
   - Remove extracted rendering methods

6. **Update Tests**
   - Create unit tests for rendering modules
   - Test rendering with different configurations
   - Ensure visual output remains consistent

## Validation Criteria

- [ ] All rendering operations produce identical visual output
- [ ] Node interactions (click, hover) work correctly
- [ ] Link and connection rendering is accurate
- [ ] SVG structure and styling are preserved
- [ ] Tests pass without modification

## Files Modified
- `src/d3-org-chart.js` (remove rendering methods, add imports)
- New: `src/rendering/NodeRenderer.js`
- New: `src/rendering/LinkRenderer.js`
- New: `src/rendering/ConnectionRenderer.js`
- New: `src/rendering/Renderer.js`

## Next Step
After completion, proceed to Step 6: Extract Interaction Management