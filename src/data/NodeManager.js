export class NodeManager {
  constructor(dataProcessor, state) {
    this.dataProcessor = dataProcessor;
    this.state = state;
  }

  addNode(obj) {
    const attrs = this.state.getState();
    
    // Handle root node case
    if (obj && (attrs.parentNodeId(obj) == null || attrs.parentNodeId(obj) == attrs.nodeId(obj)) && attrs.data.length == 0) {
      attrs.data.push(obj);
      return true;
    }

    const root = this.dataProcessor.generateRoot(attrs.data);
    if (!root) return false;

    const descendants = root.descendants();
    const nodeFound = descendants.filter(({ data }) => 
      attrs.nodeId(data).toString() === attrs.nodeId(obj).toString())[0];
    const parentFound = descendants.filter(({ data }) => 
      attrs.nodeId(data).toString() === attrs.parentNodeId(obj).toString())[0];

    if (nodeFound) {
      console.log(`ORG CHART - ADD - Node with id "${attrs.nodeId(obj)}" already exists in tree`);
      return false;
    }

    if (!parentFound) {
      console.log(`ORG CHART - ADD - Parent node with id "${attrs.parentNodeId(obj)}" not found in tree`);
      throw new Error(`Parent node with id "${attrs.parentNodeId(obj)}" not found in tree`);
    }

    // Handle centered and expanded state
    if (obj._centered && !obj._expanded) obj._expanded = true;
    
    attrs.data.push(obj);
    return true;
  }

  removeNode(nodeId) {
    const attrs = this.state.getState();
    const root = this.dataProcessor.generateRoot(attrs.data);
    
    if (!root) return false;

    const descendants = root.descendants();
    const node = descendants.filter(({ data }) => attrs.nodeId(data) == nodeId)[0];

    if (!node) {
      console.log(`ORG CHART - REMOVE - Node with id "${nodeId}" not found in the tree`);
      return false;
    }

    // Get all node descendants and mark for removal
    const nodeDescendants = node.descendants();
    nodeDescendants.forEach(d => d.data._filteredOut = true);

    // Filter out retrieved nodes and reassign data
    attrs.data = attrs.data.filter(d => !d._filteredOut);
    return true;
  }

  setExpanded(id, expandedFlag = true) {
    const attrs = this.state.getState();
    const node = attrs.allNodes.filter(({ data }) => attrs.nodeId(data) == id)[0];

    if (!node) {
      console.log(`ORG CHART - ${expandedFlag ? "EXPAND" : "COLLAPSE"} - Node with id (${id}) not found in the tree`);
      return false;
    }

    node.data._expanded = expandedFlag;
    if (expandedFlag === false) {
      const parent = node.parent || { descendants: () => [] };
      const descendants = parent.descendants().filter(d => d != parent);
      descendants.forEach(d => d.data._expanded = false);
    }

    return true;
  }

  setCentered(nodeId) {
    const attrs = this.state.getState();
    const root = this.dataProcessor.generateRoot(attrs.data);
    const descendants = root.descendants();
    const node = descendants.filter(({ data }) => 
      attrs.nodeId(data).toString() == nodeId.toString())[0];

    if (!node) {
      console.log(`ORG CHART - CENTER - Node with id (${nodeId}) not found in the tree`);
      return false;
    }

    // Set centered state (don't clear previous ones to allow multiple centered nodes)
    node.data._centered = true;
    node.data._expanded = true;
    
    // Expand ancestors
    const ancestors = node.ancestors();
    ancestors.forEach(d => d.data._expanded = true);

    return true;
  }

  setHighlighted(nodeId) {
    const attrs = this.state.getState();
    const root = this.dataProcessor.generateRoot(attrs.data);
    const descendants = root.descendants();
    const node = descendants.filter(d => 
      attrs.nodeId(d.data).toString() === nodeId.toString())[0];

    if (!node) {
      console.log(`ORG CHART - HIGHLIGHT - Node with id (${nodeId}) not found in the tree`);
      return false;
    }

    // Set highlight and expand (don't clear previous ones to allow multiple highlighted nodes)
    node.data._highlighted = true;
    node.data._expanded = true;
    node.data._centered = true;
    
    // Expand ancestors
    const ancestors = node.ancestors();
    ancestors.forEach(d => d.data._expanded = true);
    
    return true;
  }

  setUpToTheRootHighlighted(nodeId) {
    const attrs = this.state.getState();
    const root = this.dataProcessor.generateRoot(attrs.data);
    const descendants = root.descendants();
    const node = descendants.filter(d => 
      attrs.nodeId(d.data).toString() === nodeId.toString())[0];

    if (!node) {
      console.log(`ORG CHART - HIGHLIGHTROOT - Node with id (${nodeId}) not found in the tree`);
      return false;
    }

    // Set highlight and expand (don't clear previous ones to allow multiple highlighted nodes)
    node.data._upToTheRootHighlighted = true;
    node.data._expanded = true;
    
    // Highlight and expand up to root
    const ancestors = node.ancestors();
    ancestors.forEach(d => {
      d.data._upToTheRootHighlighted = true;
      d.data._expanded = true;
    });
    
    return true;
  }

  clearHighlighting() {
    const attrs = this.state.getState();
    attrs.allNodes.forEach(d => {
      d.data._highlighted = false;
      d.data._upToTheRootHighlighted = false;
    });
  }

  loadPagingNodes(node) {
    const attrs = this.state.getState();
    node.data._pagingButton = false;
    const current = node.parent.data._pagingStep;
    const step = attrs.pagingStep(node.parent);
    const newPagingIndex = current + step;
    node.parent.data._pagingStep = newPagingIndex;
    return step;
  }
}