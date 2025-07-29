import * as d3 from 'd3';

export class EventManager {
  constructor(state, navigationManager, nodeManager) {
    this.state = state;
    this.navigationManager = navigationManager;
    this.nodeManager = nodeManager;
  }

  handleNodeClick(event, node) {
    const attrs = this.state.getState();
    
    // Check if click is on button
    if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
      return;
    }
    
    // Check if click is on paging button
    if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
      this.nodeManager.loadPagingNodes(node);
      return;
    }
    
    // Execute user-defined callback
    attrs.onNodeClick(node);
  }

  handleNodeKeydown(event, node) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.navigationManager.onButtonClick(event, node);
    }
  }

  handleButtonClick(event, node) {
    this.navigationManager.onButtonClick(event, node);
  }

  handleButtonKeydown(event, node) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.navigationManager.onButtonClick(event, node);
    }
  }

  setupKeyboardNavigation() {
    const attrs = this.state.getState();
    
    // Add keyboard event listeners for accessibility
    d3.select(attrs.container)
      .on('keydown', (event) => {
        const focusedNode = d3.select(document.activeElement);
        
        switch (event.key) {
          case 'ArrowUp':
          case 'ArrowDown':
          case 'ArrowLeft':
          case 'ArrowRight':
            this.handleArrowNavigation(event, focusedNode);
            break;
          case 'Enter':
          case ' ':
            this.handleActivation(event, focusedNode);
            break;
          case 'Escape':
            this.handleEscape(event);
            break;
        }
      });
  }

  handleArrowNavigation(event, focusedNode) {
    // Implementation for keyboard navigation between nodes
    event.preventDefault();
    // This would involve finding the next/previous node based on direction
    // and updating focus accordingly
  }

  handleActivation(event, focusedNode) {
    // Handle Enter/Space key activation
    const nodeData = focusedNode.datum();
    if (nodeData) {
      this.handleButtonClick(event, nodeData);
    }
  }

  handleEscape(event) {
    // Handle escape key - could be used to clear selections or exit modes
    const attrs = this.state.getState();
    this.nodeManager.clearHighlighting();
  }
}