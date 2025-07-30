import * as d3 from 'd3';
import { DOMUtils } from '../utils/DOMUtils.js';

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

    // Handle Edge browser display issues - only hide if explicitly needed
    if (DOMUtils.isEdge()) {
      linkUpdate.style('display', d => {
        // Only hide if node is collapsed and not highlighted
        if (d.parent && d.parent.data._collapsed && !d.data._upToTheRootHighlighted) {
          return 'none';
        }
        return 'initial';
      });
    } else {
      linkUpdate.attr('display', d => {
        // Only hide if node is collapsed and not highlighted
        if (d.parent && d.parent.data._collapsed && !d.data._upToTheRootHighlighted) {
          return 'none';
        }
        return 'initial';
      });
    }

    // Allow external modifications
    linkUpdate.each(attrs.linkUpdate);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(attrs.duration)
      .attr("d", (d) => {
        const n = attrs.compact && d.flexCompactDim ?
          {
            x: attrs.layoutBindings[attrs.layout].compactLinkMidX(d, attrs),
            y: attrs.layoutBindings[attrs.layout].compactLinkMidY(d, attrs)
          } :
          {
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