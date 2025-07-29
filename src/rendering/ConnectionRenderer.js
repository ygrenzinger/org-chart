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