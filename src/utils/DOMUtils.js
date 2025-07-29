import * as d3 from 'd3';

export class DOMUtils {
  static patternify(container, selector, elementTag, data) {
    const selection = container.selectAll("." + selector).data(data, (d, i) => {
      if (typeof d === "object") {
        if (d.nodeId) return d.nodeId;
        if (d.id) return d.id;
      }
      return i;
    });
    
    selection.exit().remove();
    const merged = selection.enter().append(elementTag).merge(selection);
    merged.attr("class", selector);
    return merged;
  }

  static restyleForeignObjectElements(container, attrs) {
    container
      .selectAll(".node-foreign-object")
      .attr("width", ({ width }) => width)
      .attr("height", ({ height }) => height)
      .attr("x", ({ width }) => 0)
      .attr("y", ({ height }) => 0);

    container
      .selectAll(".node-foreign-object-div")
      .style("width", ({ width }) => `${width}px`)
      .style("height", ({ height }) => `${height}px`)
      .html(function (d, i, arr) {
        if (d.data._pagingButton) {
          return `<div class="paging-button-wrapper"><div style="pointer-events:none">${attrs.pagingButton(d, i, arr, attrs)}</div></div>`;
        }
        return attrs.nodeContent.bind(this)(d, i, arr, attrs);
      });
  }

  static isEdge() {
    return window.navigator.userAgent.includes("Edge");
  }
}