export class NavigationManager {
  constructor(state, nodeManager, updateCallback) {
    this.state = state;
    this.nodeManager = nodeManager;
    this.updateCallback = updateCallback;
  }

  onButtonClick(event, d) {
    const attrs = this.state.getState();
    
    if (d.data._pagingButton) {
      return;
    }
    
    if (attrs.setActiveNodeCentered) {
      d.data._centered = true;
      d.data._centeredWithDescendants = true;
    }

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
      while (parent && parent._children) {
        // Expand all current parent's children
        parent.children = parent._children;
        parent._children = null;
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
    // Don't call updateCallback here as it will be called by the main chart
  }

  collapseAll() {
    const attrs = this.state.getState();
    attrs.allNodes.forEach(d => d.data._expanded = false);
    this.initialExpandLevel(0);
    // Don't call updateCallback here as it will be called by the main chart
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