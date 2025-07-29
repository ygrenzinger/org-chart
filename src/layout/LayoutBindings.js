export class LayoutBindings {
  constructor() {
    this.bindings = this.createLayoutBindings();
  }

  createLayoutBindings() {
    return {
      "top": {
        "nodeLeftX": (node) => -node.width / 2,
        "nodeRightX": (node) => node.width / 2,
        "nodeTopY": (node) => 0,
        "nodeBottomY": (node) => node.height,
        "nodeJoinX": ({ x, width }) => x + width / 2,
        "nodeJoinY": ({ y, height }) => y + height,
        "linkJoinX": ({ x, width }) => x + width / 2,
        "linkJoinY": ({ y, height }) => y + height,
        "linkX": (node) => node.x,
        "linkY": (node) => node.y,
        "linkParentX": (node) => node.parent.x,
        "linkParentY": (node) => node.parent.y + node.parent.height,
        "buttonX": ({ width }) => width / 2,
        "buttonY": ({ height }) => height,
        "centerTransform": ({ root, rootMargin, centerY, scale, centerX }) => 
          `translate(${centerX},${rootMargin}) scale(${scale})`,
        "nodeUpdateTransform": ({ x, y, width, height }) => 
          `translate(${x - width / 2},${y})`,
        "swap": (d) => { /* no swap needed for top layout */ },
        "nodeFlexSize": ({ width, height, siblingsMargin, childrenMargin, state, node }) => {
          if (state.compact && node.flexCompactDim) {
            return [node.flexCompactDim[0], node.flexCompactDim[1]];
          }
          return [width + siblingsMargin, height + childrenMargin];
        },
        "zoomTransform": ({ centerX, scale }) => `translate(${centerX},0) scale(${scale})`,
        "diagonal": null, // Will be set by main class
        "compactDimension": {
          "sizeColumn": node => node.width,
          "sizeRow": node => node.height,
          "reverse": arr => arr
        },
        "linkCompactXStart": node => node.x + (node.compactEven ? node.width / 2 : -node.width / 2),
        "linkCompactYStart": node => node.y + node.height / 2,
        "compactLinkMidX": (node, state) => node.firstCompactNode.x + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4,
        "compactLinkMidY": (node, state) => node.firstCompactNode.y
      },
      "bottom": {
        "nodeLeftX": (node) => -node.width / 2,
        "nodeRightX": (node) => node.width / 2,
        "nodeTopY": (node) => -node.height,
        "nodeBottomY": (node) => 0,
        "nodeJoinX": ({ x, width }) => x + width / 2,
        "nodeJoinY": ({ y, height }) => y,
        "linkJoinX": ({ x, width }) => x + width / 2,
        "linkJoinY": ({ y, height }) => y,
        "linkX": (node) => node.x,
        "linkY": (node) => node.y,
        "linkParentX": (node) => node.parent.x,
        "linkParentY": (node) => node.parent.y - node.parent.height,
        "buttonX": ({ width }) => width / 2,
        "buttonY": () => 0,
        "centerTransform": ({ root, rootMargin, centerY, scale, centerX, chartHeight }) => 
          `translate(${centerX},${chartHeight - rootMargin}) scale(${scale})`,
        "nodeUpdateTransform": ({ x, y, width, height }) => 
          `translate(${x - width / 2},${y - height})`,
        "swap": (d) => { d.y = -d.y; },
        "nodeFlexSize": ({ width, height, siblingsMargin, childrenMargin, state, node }) => {
          if (state.compact && node.flexCompactDim) {
            return [node.flexCompactDim[0], node.flexCompactDim[1]];
          }
          return [width + siblingsMargin, height + childrenMargin];
        },
        "zoomTransform": ({ centerX, scale }) => `translate(${centerX},0) scale(${scale})`,
        "diagonal": null, // Will be set by main class
        "compactDimension": {
          "sizeColumn": node => node.width,
          "sizeRow": node => node.height,
          "reverse": arr => arr
        },
        "linkCompactXStart": node => node.x + (node.compactEven ? node.width / 2 : -node.width / 2),
        "linkCompactYStart": node => node.y - node.height / 2,
        "compactLinkMidX": (node, state) => node.firstCompactNode.x + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4,
        "compactLinkMidY": (node, state) => node.firstCompactNode.y
      },
      "left": {
        "nodeLeftX": (node) => 0,
        "nodeRightX": (node) => node.width,
        "nodeTopY": (node) => -node.height / 2,
        "nodeBottomY": (node) => node.height / 2,
        "nodeJoinX": ({ x, width }) => x + width,
        "nodeJoinY": ({ y, height }) => y + height / 2,
        "linkJoinX": ({ x, width }) => x + width,
        "linkJoinY": ({ y, height }) => y + height / 2,
        "linkX": (node) => node.x,
        "linkY": (node) => node.y,
        "linkParentX": (node) => node.parent.x + node.parent.width,
        "linkParentY": (node) => node.parent.y,
        "buttonX": ({ width }) => width,
        "buttonY": ({ height }) => height / 2,
        "centerTransform": ({ root, rootMargin, centerY, scale, centerX }) => 
          `translate(${rootMargin},${centerY}) scale(${scale})`,
        "nodeUpdateTransform": ({ x, y, width, height }) => 
          `translate(${x},${y - height / 2})`,
        "swap": (d) => { 
          const temp = d.x; 
          d.x = d.y; 
          d.y = temp; 
        },
        "nodeFlexSize": ({ width, height, siblingsMargin, childrenMargin, state, node }) => {
          if (state.compact && node.flexCompactDim) {
            return [node.flexCompactDim[0], node.flexCompactDim[1]];
          }
          return [height + siblingsMargin, width + childrenMargin];
        },
        "zoomTransform": ({ centerY, scale }) => `translate(${0},${centerY}) scale(${scale})`,
        "diagonal": null, // Will be set by main class
        "compactDimension": {
          "sizeColumn": node => node.height,
          "sizeRow": node => node.width,
          "reverse": arr => arr.slice().reverse()
        },
        "linkCompactXStart": node => node.x + node.width / 2,
        "linkCompactYStart": node => node.y + (node.compactEven ? node.height / 2 : -node.height / 2),
        "compactLinkMidX": (node, state) => node.firstCompactNode.x,
        "compactLinkMidY": (node, state) => node.firstCompactNode.y + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4
      },
      "right": {
        "nodeLeftX": (node) => -node.width,
        "nodeRightX": (node) => 0,
        "nodeTopY": (node) => -node.height / 2,
        "nodeBottomY": (node) => node.height / 2,
        "nodeJoinX": ({ x, width }) => x,
        "nodeJoinY": ({ y, height }) => y + height / 2,
        "linkJoinX": ({ x, width }) => x,
        "linkJoinY": ({ y, height }) => y + height / 2,
        "linkX": (node) => node.x,
        "linkY": (node) => node.y,
        "linkParentX": (node) => node.parent.x - node.parent.width,
        "linkParentY": (node) => node.parent.y,
        "buttonX": () => 0,
        "buttonY": ({ height }) => height / 2,
        "centerTransform": ({ root, rootMargin, centerY, scale, centerX, chartWidth }) => 
          `translate(${chartWidth - rootMargin},${centerY}) scale(${scale})`,
        "nodeUpdateTransform": ({ x, y, width, height }) => 
          `translate(${x - width},${y - height / 2})`,
        "swap": (d) => { 
          const temp = d.x; 
          d.x = -d.y; 
          d.y = temp; 
        },
        "nodeFlexSize": ({ width, height, siblingsMargin, childrenMargin, state, node }) => {
          if (state.compact && node.flexCompactDim) {
            return [node.flexCompactDim[0], node.flexCompactDim[1]];
          }
          return [height + siblingsMargin, width + childrenMargin];
        },
        "zoomTransform": ({ centerY, scale }) => `translate(${0},${centerY}) scale(${scale})`,
        "diagonal": null, // Will be set by main class
        "compactDimension": {
          "sizeColumn": node => node.height,
          "sizeRow": node => node.width,
          "reverse": arr => arr.slice().reverse()
        },
        "linkCompactXStart": node => node.x - node.width / 2,
        "linkCompactYStart": node => node.y + (node.compactEven ? node.height / 2 : -node.height / 2),
        "compactLinkMidX": (node, state) => node.firstCompactNode.x,
        "compactLinkMidY": (node, state) => node.firstCompactNode.y + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4
      }
    };
  }

  getBinding(layout) {
    return this.bindings[layout];
  }

  setDiagonal(layout, diagonalFunction) {
    this.bindings[layout].diagonal = diagonalFunction;
  }

  getAllBindings() {
    return this.bindings;
  }
}