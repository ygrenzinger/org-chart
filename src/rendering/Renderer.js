import { select } from 'd3-selection';
import { NodeRenderer } from './NodeRenderer.js';
import { LinkRenderer } from './LinkRenderer.js';
import { ConnectionRenderer } from './ConnectionRenderer.js';
import { DOMUtils } from '../utils/DOMUtils.js';

const d3 = { select };

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
    if (attrs.firstDraw) {
      svg.call(attrs.zoomBehavior)
        .on("dblclick.zoom", null)
        .attr("cursor", "move");
    }

    // Add container g element
    const chart = DOMUtils.patternify(svg, 'chart', 'g', [{}]);
    
    // Add one more container g element for better positioning controls
    const centerG = DOMUtils.patternify(chart, 'center-group', 'g', [{}]);

    // Create wrappers for different elements
    attrs.linksWrapper = DOMUtils.patternify(centerG, 'links-wrapper', 'g', [{}]);
    attrs.nodesWrapper = DOMUtils.patternify(centerG, 'nodes-wrapper', 'g', [{}]);
    attrs.connectionsWrapper = DOMUtils.patternify(centerG, 'connections-wrapper', 'g', [{}]);
    attrs.defsWrapper = DOMUtils.patternify(svg, 'defs-wrapper', 'g', [{}]);

    // Store references
    attrs.svg = svg;
    attrs.chart = chart;
    attrs.centerG = centerG;

    return { svg, chart, centerG };
  }

  render(nodes, links, visibleConnections, { x0, y0, x, y, width, height }) {
    const attrs = this.state.getState();

    // Set center transform
    if (attrs.firstDraw) {
      attrs.centerG.attr("transform", () => {
        return attrs.layoutBindings[attrs.layout].centerTransform({
          centerX: attrs.calc.centerX,
          centerY: attrs.calc.centerY,
          scale: attrs.lastTransform.k,
          rootMargin: attrs.rootMargin,
          root: attrs.root,
          chartHeight: attrs.calc.chartHeight,
          chartWidth: attrs.calc.chartWidth
        });
      });
    }

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