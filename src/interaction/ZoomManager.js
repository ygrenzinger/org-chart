import * as d3 from 'd3';
import { MathUtils } from '../utils/MathUtils.js';

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
    
    // Apply new styles to the foreign object element for Edge browser compatibility
    const chartInstance = attrs.chartInstance;
    if (chartInstance && chartInstance.isEdge && chartInstance.isEdge()) {
      chartInstance.restyleForeignObjectElements();
    }
  }

  initialZoom(zoomLevel) {
    const attrs = this.state.getState();
    attrs.lastTransform.k = zoomLevel;
    return attrs.chartInstance;
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
        if (params.onCompleted) {
          params.onCompleted();
        }
      });
  }

  fit({ animate = true, nodes, scale = true, onCompleted = () => { } } = {}) {
    const attrs = this.state.getState();
    const { root } = attrs;
    
    let descendants = nodes ? nodes : root.descendants();
    const { minX, maxX, minY, maxY } = MathUtils.calculateBounds(descendants, attrs.layoutBindings, attrs.layout);

    this.zoomTreeBounds({
      x0: minX - 50, 
      x1: maxX + 50, 
      y0: minY - 50, 
      y1: maxY + 50,
      params: { animate, scale, onCompleted }
    });
  }
}