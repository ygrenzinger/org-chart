import { stratify } from 'd3-hierarchy';
import { max } from 'd3-array';

const d3 = {
  stratify,
  max
};

export class DataProcessor {
  constructor(state) {
    this.state = state;
  }

  generateRoot(data) {
    if (!data || data.length === 0) return null;
    
    const attrs = this.state.getState();
    return d3.stratify()
      .id(d => attrs.nodeId(d))
      .parentId(d => attrs.parentNodeId(d))(data);
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