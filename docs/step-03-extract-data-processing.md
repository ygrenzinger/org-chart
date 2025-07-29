# Step 3: Extract Data Processing Logic

## Objective
Extract data processing, hierarchy management, and node operations from the monolithic OrgChart class into dedicated data management modules.

## Files to Create

### `src/data/DataProcessor.js`
```javascript
import * as d3 from 'd3';

export class DataProcessor {
  constructor(nodeIdAccessor, parentNodeIdAccessor) {
    this.nodeId = nodeIdAccessor;
    this.parentNodeId = parentNodeIdAccessor;
  }

  generateRoot(data) {
    if (!data || data.length === 0) return null;
    
    return d3.stratify()
      .id(d => this.nodeId(d))
      .parentId(d => this.parentNodeId(d))(data);
  }

  getNodeChildren({ data, children, _children }, nodeStore) {
    nodeStore.push(data);

    if (children) {
      children.forEach(d => {
        this.getNodeChildren(d, nodeStore);
      });
    }

    if (_children) {
      _children.forEach(d => {
        this.getNodeChildren(d, nodeStore);
      });
    }

    return nodeStore;
  }

  processHierarchyData(root, attrs) {
    // Calculate max node depth
    const maxDepth = d3.max(root.descendants(), d => d.depth);
    const _hierarchyHeight = maxDepth;

    // Set up paging for nodes
    root.descendants()
      .filter(node => node.children)
      .filter(node => !node.data._pagingStep)
      .forEach(node => {
        node.data._pagingStep = attrs.minPagingVisibleNodes(node);
      });

    // Process each node
    root.each((node, i, arr) => {
      let width = attrs.nodeWidth(node);
      let height = attrs.nodeHeight(node);
      Object.assign(node, { width, height, _hierarchyHeight });
    });

    // Store direct and total descendants count
    root.descendants().forEach(d => {
      Object.assign(d.data, {
        _directSubordinates: d.children ? d.children.length : 0,
        _totalSubordinates: d.descendants().length - 1
      });
    });

    return root;
  }

  filterDataForPaging(data, hiddenNodesMap) {
    return data.filter(d => hiddenNodesMap[d.id] !== true);
  }
}
```

### `src/data/NodeManager.js`
```javascript
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
      return false;
    }

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

    if (expandedFlag) {
      node.data._expanded = true;
    } else {
      const parent = node.parent || { descendants: () => [] };
      const descendants = parent.descendants().filter(d => d != parent);
      descendants.forEach(d => d.data._expanded = false);
    }

    return true;
  }

  setCentered(nodeId) {
    const attrs = this.state.getState();
    const descendants = attrs.allNodes;
    const node = descendants.filter(({ data }) => 
      attrs.nodeId(data).toString() == nodeId.toString())[0];

    if (!node) {
      console.log(`ORG CHART - CENTER - Node with id (${nodeId}) not found in the tree`);
      return false;
    }

    // Clear previous centered states
    descendants.forEach(d => d.data._centered = false);
    
    // Set centered state
    node.data._centered = true;
    
    // Expand ancestors
    const ancestors = node.ancestors();
    ancestors.forEach(d => d.data._expanded = true);

    return true;
  }

  setHighlighted(nodeId) {
    const attrs = this.state.getState();
    const descendants = attrs.allNodes;
    const node = descendants.filter(d => 
      attrs.nodeId(d.data).toString() === nodeId.toString())[0];

    if (!node) {
      console.log(`ORG CHART - HIGHLIGHT - Node with id (${nodeId}) not found in the tree`);
      return false;
    }

    // Clear previous highlights
    descendants.forEach(d => d.data._highlighted = false);
    
    // Set highlight
    node.data._highlighted = true;
    return true;
  }

  setUpToTheRootHighlighted(nodeId) {
    const attrs = this.state.getState();
    const descendants = attrs.allNodes;
    const node = descendants.filter(d => 
      attrs.nodeId(d.data).toString() === nodeId.toString())[0];

    if (!node) {
      console.log(`ORG CHART - HIGHLIGHTROOT - Node with id (${nodeId}) not found in the tree`);
      return false;
    }

    // Clear previous highlights
    descendants.forEach(d => d.data._upToTheRootHighlighted = false);
    
    // Highlight up to root
    node.ancestors().forEach(d => d.data._upToTheRootHighlighted = true);
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
    const step = attrs.pagingStep(node.parent);
    node.parent.data._pagingStep += step;
    return step;
  }
}
```

## Current Code to Extract

From the main OrgChart class, extract these data-related methods:
- Lines 248-263: `getNodeChildren` method
- Lines 353-387: `addNode` method
- Lines 369-387: `removeNode` method
- Lines 808-860: `setLayouts` method (data processing parts)
- Lines 913-932: `setExpanded` method
- Lines 925-935: `setCentered` method
- Lines 936-946: `setHighlighted` method
- Lines 942-947: `setUpToTheRootHighlighted` method
- Lines 948-952: `clearHighlighting` method
- Lines 908-912: `loadPagingNodes` method

## Implementation Steps

1. **Create DataProcessor Module**
   - Create `src/data/DataProcessor.js`
   - Move hierarchy generation and data processing logic
   - Include root generation and node processing methods

2. **Create NodeManager Module**
   - Create `src/data/NodeManager.js`
   - Move node manipulation methods (add, remove, expand, etc.)
   - Include state management for node properties

3. **Update Main Class**
   - Import data modules in OrgChart class
   - Replace direct method calls with module method calls
   - Remove extracted methods from main class

4. **Update Tests**
   - Create unit tests for data processing modules
   - Ensure existing data manipulation tests still pass
   - Test node operations independently

## Validation Criteria

- [ ] All node operations (add, remove, expand, collapse) work correctly
- [ ] Data hierarchy processing maintains structure
- [ ] Node state management (highlighting, centering) functions properly
- [ ] Tests pass without modification
- [ ] Data modules can be tested independently

## Files Modified
- `src/d3-org-chart.js` (remove data methods, add imports)
- New: `src/data/DataProcessor.js`
- New: `src/data/NodeManager.js`

## Next Step
After completion, proceed to Step 4: Extract Layout Management