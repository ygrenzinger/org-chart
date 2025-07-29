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
      .attr("cursor", "pointer")
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

    // Restyle button texts (legacy support)
    nodeUpdate
      .select(".node-button-text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", ({ children }) => {
        if (children) return 40;
        return 26;
      })
      .text(({ children }) => {
        if (children) return "-";
        return "+";
      })
      .attr("y", DOMUtils.isEdge() ? 10 : 0);

    // Allow external node update modifications
    nodeUpdate.each(attrs.nodeUpdate);

    return this.exitNodes(nodeSelection, { x, y, width, height });
  }

  exitNodes(nodeSelection, { x, y, width, height }) {
    const attrs = this.state.getState();

    // Remove any exiting nodes after transition
    const nodeExitTransition = nodeSelection.exit();
    nodeExitTransition.each(attrs.nodeExit);

    const maxDepthNode = nodeExitTransition.data().reduce((a, b) => 
      a.depth < b.depth ? a : b, { depth: Infinity });

    nodeExitTransition.attr("opacity", 1)
      .transition()
      .duration(attrs.duration)
      .attr("transform", (d) => {
        let { x, y, width, height } = maxDepthNode.parent || {};
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
    
    // Delegate to EventManager if available
    if (attrs.chartInstance && attrs.chartInstance.eventManager) {
      attrs.chartInstance.eventManager.handleNodeClick(event, node);
      return;
    }
    
    // Fallback to original behavior
    const { data } = node;
    
    if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
      return;
    }
    
    if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
        if (attrs.chartInstance && attrs.chartInstance.loadPagingNodes) {
          attrs.chartInstance.loadPagingNodes(node);
        }      return;
    }
    
    if (!data._pagingButton) {
      attrs.onNodeClick(node);
      return;
    }
    
    console.log('event fired, no handlers');
  }

  handleNodeKeydown(event, node) {
    const attrs = this.state.getState();
    
    // Delegate to EventManager if available
    if (attrs.chartInstance && attrs.chartInstance.eventManager) {
      attrs.chartInstance.eventManager.handleNodeKeydown(event, node);
      return;
    }
    
    // Fallback to original behavior
    const { data } = node;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
        return;
      }
      if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
        if (attrs.chartInstance && attrs.chartInstance.loadPagingNodes) {
          attrs.chartInstance.loadPagingNodes(node);
        }
        return;
      }
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        this.handleButtonClick(event, node);
      }
    }
  }

  handleButtonClick(event, node) {
    const attrs = this.state.getState();
    
    // Delegate to EventManager if available
    if (attrs.chartInstance && attrs.chartInstance.eventManager) {
      attrs.chartInstance.eventManager.handleButtonClick(event, node);
      return;
    }
    
    // Fallback to original behavior
    event.stopPropagation();
    if (attrs.chartInstance && attrs.chartInstance.onButtonClick) {
      attrs.chartInstance.onButtonClick(event, node);
    }
  }

  handleButtonKeydown(event, node) {
    const attrs = this.state.getState();
    
    // Delegate to EventManager if available
    if (attrs.chartInstance && attrs.chartInstance.eventManager) {
      attrs.chartInstance.eventManager.handleButtonKeydown(event, node);
      return;
    }
    
    // Fallback to original behavior
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      this.handleButtonClick(event, node);
    }
  }
}