import { flextree } from 'd3-flextree';
import { LayoutBindings } from './LayoutBindings.js';
import { CompactLayout } from './CompactLayout.js';

export class LayoutManager {
  constructor(state) {
    this.state = state;
    this.layoutBindings = new LayoutBindings();
    this.compactLayout = new CompactLayout(this.layoutBindings, state);
  }

  initializeFlexTreeLayout() {
    const attrs = this.state.getState();
    
    attrs.flexTreeLayout = flextree({
      nodeSize: node => {
        const width = attrs.nodeWidth(node);
        const height = attrs.nodeHeight(node);
        const siblingsMargin = attrs.siblingsMargin(node);
        const childrenMargin = attrs.childrenMargin(node);
        
        return attrs.layoutBindings[attrs.layout].nodeFlexSize({
          width, height, siblingsMargin, childrenMargin, state: attrs, node
        });
      }
    }).spacing((nodeA, nodeB) => 
      nodeA.parent == nodeB.parent ? 0 : attrs.neighbourMargin(nodeA, nodeB)
    );
  }

  applyLayout(root) {
    const attrs = this.state.getState();
    
    // Calculate compact dimensions if needed
    if (attrs.compact) {
      this.compactLayout.calculateCompactFlexDimensions(root);
    }

    // Apply flex tree layout
    const treeData = attrs.flexTreeLayout(root);

    // Apply compact positions if needed
    if (attrs.compact) {
      this.compactLayout.calculateCompactFlexPositions(root);
    }

    // Apply layout-specific transformations
    const nodes = treeData.descendants();
    nodes.forEach(attrs.layoutBindings[attrs.layout].swap);

    return { nodes, links: treeData.descendants().slice(1) };
  }

  getLayoutBindings() {
    return this.layoutBindings;
  }

  setLayoutBindings(bindings) {
    this.layoutBindings = bindings;
  }

  setupLayoutBindings() {
    const attrs = this.state.getState();
    
    // Create layout bindings with proper context binding for diagonal functions
    attrs.layoutBindings = {};
    
    Object.keys(this.layoutBindings.getAllBindings()).forEach(layout => {
      attrs.layoutBindings[layout] = { ...this.layoutBindings.getBinding(layout) };
      
      // Bind diagonal functions to the chart instance context
      if (layout === 'left' || layout === 'right') {
        attrs.layoutBindings[layout].diagonal = attrs.hdiagonal.bind(this.state);
      } else {
        attrs.layoutBindings[layout].diagonal = attrs.diagonal.bind(this.state);
      }
    });
  }
}