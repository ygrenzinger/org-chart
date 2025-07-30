import * as d3 from 'd3';
import { ChartState } from './ChartState.js';
import { DataProcessor } from '../data/DataProcessor.js';
import { NodeManager } from '../data/NodeManager.js';
import { LayoutManager } from '../layout/LayoutManager.js';
import { Renderer } from '../rendering/Renderer.js';
import { ZoomManager } from '../interaction/ZoomManager.js';
import { NavigationManager } from '../interaction/NavigationManager.js';
import { EventManager } from '../interaction/EventManager.js';
import { FullscreenManager } from '../interaction/FullscreenManager.js';
import { ExportManager } from '../export/ExportManager.js';
import { PrintManager } from '../export/PrintManager.js';
import { DOMUtils } from '../utils/DOMUtils.js';
import { MathUtils } from '../utils/MathUtils.js';
import { ExportUtils } from '../utils/ExportUtils.js';

export class OrgChart {
  constructor(initialConfig = {}) {
    // Initialize state management
    this.state = new ChartState(initialConfig);
    
    // Initialize modules
    this.initializeModules();
    
    // Set up public API methods
    this.setupPublicAPI();
    
    // Initialize the chart
    this.initialize();
  }

  initializeModules() {
    // Data management
    this.dataProcessor = new DataProcessor(this.state);
    this.nodeManager = new NodeManager(this.dataProcessor, this.state);
    
    // Layout management
    this.layoutManager = new LayoutManager(this.state);
    
    // Rendering
    this.renderer = new Renderer(this.state);
    
    // Interaction management
    this.zoomManager = new ZoomManager(this.state);
    this.navigationManager = new NavigationManager(
      this.state, 
      this.nodeManager, 
      this.update.bind(this)
    );
    this.eventManager = new EventManager(
      this.state, 
      this.navigationManager, 
      this.nodeManager
    );
    this.fullscreenManager = new FullscreenManager(this.state);
    
    // Export management
    this.exportManager = new ExportManager(this);
    this.printManager = new PrintManager(this, this.exportManager);
    
    // Store reference to chart instance for callbacks
    const attrs = this.state.getState();
    attrs.chartInstance = this;
  }

  setupPublicAPI() {
    const attrs = this.state.getState();
    
    // Create getter/setter methods for all configuration properties
    Object.keys(attrs).forEach((key) => {
      this[key] = function(value) {
        if (!arguments.length) return this.state.getState()[key];
        this.state.updateState({ [key]: value });
        return this;
      };
    });

    // Expose state getter
    this.getChartState = () => this.state.getState();
  }

  initialize() {
    // Set up layout bindings with diagonal functions
    this.layoutManager.setupLayoutBindings();
    
    // Initialize enter/exit/update pattern
    this.initializeEnterExitUpdatePattern();
  }

  initializeEnterExitUpdatePattern() {
    d3.selection.prototype.patternify = function (params) {
      var container = this;
      var selector = params.selector;
      var elementTag = params.tag;
      var data = params.data || [selector];

      return DOMUtils.patternify(container, selector, elementTag, data);
    };
  }

  // Main render method
  render() {
    const attrs = this.state.getState();
    
    // Check if data is available
    if (!attrs.data || attrs.data.length === 0) {
      console.log('ORG CHART - Data is empty');
      this.clearChart();
      return this;
    }

    // Calculate container dimensions
    const container = d3.select(attrs.container);
    const containerRect = container.node().getBoundingClientRect();
    if (containerRect.width > 0) {
      this.state.updateState({ svgWidth: containerRect.width });
    }

    // Initialize calculated properties
    const calc = {
      id: `ID${Math.floor(Math.random() * 1000000)}`,
      chartWidth: attrs.svgWidth,
      chartHeight: attrs.svgHeight,
      centerX: attrs.svgWidth / 2,
      centerY: attrs.svgHeight / 2
    };
    this.state.updateState({ calc });

    // Initialize SVG if first draw
    if (attrs.firstDraw) {
      this.zoomManager.initializeZoom();
      this.renderer.initializeSVG();
      this.renderer.setupWindowResize();
      this.state.updateState({ firstDraw: false });
    }

    // Initialize flex tree layout
    this.layoutManager.initializeFlexTreeLayout();

    // Set up layouts
    this.setLayouts({ expandNodesFirst: false });
    
    // Display tree contents
    this.update(attrs.root);
    
    return this;
  }

  clearChart() {
    const attrs = this.state.getState();
    const container = d3.select(attrs.container);
    
    container.select('.nodes-wrapper').remove();
    container.select('.links-wrapper').remove();
    container.select('.connections-wrapper').remove();
  }

  setLayouts({ expandNodesFirst = true }) {
    const attrs = this.state.getState();
    
    // Generate root from data
    attrs.root = this.dataProcessor.generateRoot(attrs.data);
    if (!attrs.root) return;

    // Handle initial expand level
    const descendantsBefore = attrs.root.descendants();
    if (attrs.initialExpandLevel > 1 && descendantsBefore.length > 0) {
      descendantsBefore.forEach((d) => {
        if (d.depth <= attrs.initialExpandLevel) {
          d.data._expanded = true;
        }
      });
      attrs.initialExpandLevel = 1;
    }

    // Handle paging
    const hiddenNodesMap = {};
    attrs.root.descendants()
      .filter(node => node.children)
      .filter(node => !node.data._pagingStep)
      .forEach(node => {
        node.data._pagingStep = attrs.minPagingVisibleNodes(node);
      });

    // Process paging logic
    attrs.root.eachBefore((node, i) => {
      node.data._directSubordinatesPaging = node.children ? node.children.length : 0;
      if (node.children) {
        node.children.forEach((child, j) => {
          child.data._pagingButton = false;
          if (j > node.data._pagingStep) {
            hiddenNodesMap[child.id] = true;
          }
          if (j === node.data._pagingStep && (node.children.length - 1) > node.data._pagingStep) {
            child.data._pagingButton = true;
          }
          if (hiddenNodesMap[child.parent.id]) {
            hiddenNodesMap[child.id] = true;
          }
          if (child.data._expanded || child.data._centered || child.data._highlighted || child.data._upToTheRootHighlighted) {
            let localNode = child;
            while (localNode && (hiddenNodesMap[localNode.id] || localNode.data._pagingButton)) {
              hiddenNodesMap[localNode.id] = false;
              if (localNode.data._pagingButton) {
                localNode.data._pagingButton = false;
                localNode.parent.children.forEach(ch => {
                  ch.data._expanded = true;
                  hiddenNodesMap[ch.id] = false;
                });
              }
              localNode = localNode.parent;
            }
          }
        });
      }
    });

    // Filter out hidden nodes and process hierarchy data
    attrs.root = this.dataProcessor.generateRoot(attrs.data.filter(d => hiddenNodesMap[d.id] !== true));
    attrs.root = this.dataProcessor.processHierarchyData(attrs.root, attrs);
    
    // Store positions for animation
    attrs.root.x0 = 0;
    attrs.root.y0 = 0;
    attrs.allNodes = attrs.root.descendants();
    
    // Store direct and total descendants count
    attrs.allNodes.forEach((d) => {
      Object.assign(d.data, {
        _directSubordinates: d.children ? d.children.length : 0,
        _totalSubordinates: d.descendants().length - 1
      });
    });

    // Handle node expansion
    if (attrs.root.children) {
      if (expandNodesFirst) {
        // Expand all nodes first
        attrs.root.children.forEach((d) => this.navigationManager.expand(d));
      }
      
      // Then collapse them all
      attrs.root.children.forEach((d) => this.navigationManager.collapse(d));
      
      // Collapse root if level is 0
      if (attrs.initialExpandLevel === 0) {
        attrs.root._children = attrs.root.children;
        attrs.root.children = null;
      }
      
      // Then only expand nodes which have expanded property set to true
      [attrs.root].forEach(ch => this.navigationManager.expandSomeNodes(ch));
    }
    
    this.state.updateState(attrs);
  }

  update({ x0, y0, x = 0, y = 0, width, height }) {
    const attrs = this.state.getState();
    
    // Apply layout
    const { nodes, links } = this.layoutManager.applyLayout(attrs.root);
    
    // Process connections
    const { visibleConnections } = this.processConnections(nodes);
    
    // Render everything
    this.renderer.render(nodes, links, visibleConnections, { x0, y0, x, y, width, height });
    
    // Store old positions for transition
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    
    // Handle centering
    this.handleCentering();
    
    return this;
  }

  processConnections(nodes) {
    const attrs = this.state.getState();
    const connections = attrs.connections || [];
    
    // Create node maps
    const allNodesMap = {};
    const visibleNodesMap = {};
    
    attrs.allNodes.forEach(d => allNodesMap[attrs.nodeId(d.data)] = d);
    nodes.forEach(d => visibleNodesMap[attrs.nodeId(d.data)] = d);
    
    // Process connections
    connections.forEach(connection => {
      connection._source = allNodesMap[connection.from];
      connection._target = allNodesMap[connection.to];
    });
    
    const visibleConnections = connections.filter(d => 
      visibleNodesMap[d.from] && visibleNodesMap[d.to]
    );
    
    return { visibleConnections };
  }

  handleCentering() {
    const attrs = this.state.getState();
    
    const centeredNode = attrs.allNodes.filter(d => d.data._centered)[0];
    if (!centeredNode) return;
    
    let centeredNodes = [centeredNode];
    if (centeredNode.data._centeredWithDescendants) {
      if (attrs.compact) {
        centeredNodes = centeredNode.descendants().filter((d, i) => i < 7);
      } else {
        centeredNodes = centeredNode.descendants().filter((d, i, arr) => {
          const h = Math.round(arr.length / 2);
          const spread = 2;
          if (arr.length % 2) {
            return i > h - spread && i < h + spread - 1;
          }
          return i > h - spread && i < h + spread;
        });
      }
    }
    
    centeredNode.data._centeredWithDescendants = null;
    centeredNode.data._centered = null;
    
    this.zoomManager.fit({
      animate: true,
      scale: false,
      nodes: centeredNodes
    });
  }

  // Diagonal generation methods
  hdiagonal(s, t, m, offsets) {
    const state = this.state.getState();
    return state.hdiagonal(s, t, m, offsets);
  }

  diagonal(s, t, m, offsets) {
    const state = this.state.getState();
    return state.diagonal(s, t, m, offsets);
  }

  // Public API methods that delegate to modules
  addNode(obj) {
    const success = this.nodeManager.addNode(obj);
    if (success) {
      const attrs = this.getChartState();
      if (attrs.data.length === 1) {
        this.render();
      } else {
        this.updateNodesState();
      }
    }
    return this;
  }

  removeNode(nodeId) {
    const success = this.nodeManager.removeNode(nodeId);
    if (success) {
      const attrs = this.getChartState();
      if (attrs.data.length === 0) {
        this.render();
      } else {
        this.updateNodesState();
      }
    }
    return this;
  }

  setExpanded(id, expandedFlag = true) {
    this.nodeManager.setExpanded(id, expandedFlag);
    return this;
  }

  setCentered(nodeId) {
    this.nodeManager.setCentered(nodeId);
    return this;
  }

  setHighlighted(nodeId) {
    this.nodeManager.setHighlighted(nodeId);
    return this;
  }

  setUpToTheRootHighlighted(nodeId) {
    this.nodeManager.setUpToTheRootHighlighted(nodeId);
    return this;
  }

  clearHighlighting() {
    const attrs = this.getChartState();
    this.nodeManager.clearHighlighting();
    this.update(attrs.root);
    return this;
  }

  expandAll() {
    this.navigationManager.expandAll();
    this.render();
    return this;
  }

  collapseAll() {
    this.navigationManager.collapseAll();
    this.initialExpandLevel(0);
    this.render();
    return this;
  }

  initialExpandLevel(level) {
    this.navigationManager.initialExpandLevel(level);
    return this;
  }

  updateNodesState() {
    const attrs = this.getChartState();
    this.setLayouts({ expandNodesFirst: true });
    this.update(attrs.root);
    return this;
  }

  // Zoom methods
  initialZoom(zoomLevel) {
    return this.zoomManager.initialZoom(zoomLevel);
  }

  zoomIn() {
    this.zoomManager.zoomIn();
    return this;
  }

  zoomOut() {
    this.zoomManager.zoomOut();
    return this;
  }

  fit(options = {}) {
    this.zoomManager.fit(options);
    return this;
  }

  zoomed(event, d) {
    this.zoomManager.zoomed(event, d);
  }

  zoomTreeBounds({ x0, x1, y0, y1, params = { animate: true, scale: true, onCompleted: () => { } } }) {
    this.zoomManager.zoomTreeBounds({ x0, x1, y0, y1, params });
  }

  // Export methods
  exportImg(options = {}) {
    this.exportManager.exportPNG(options);
    return this;
  }

  exportSvg() {
    this.exportManager.exportSVG();
    return this;
  }

  downloadImage(options) {
    return this.exportManager.imageExporter.downloadImage(options);
  }

  // Fullscreen
  fullscreen(elem) {
    this.fullscreenManager.fullscreen(elem);
    return this;
  }

  // Navigation methods
  onButtonClick(event, d) {
    this.navigationManager.onButtonClick(event, d);
  }

  setExpansionFlagToChildren({ data, children, _children }, flag) {
    this.navigationManager.setExpansionFlagToChildren({ data, children, _children }, flag);
  }

  expandSomeNodes(d) {
    this.navigationManager.expandSomeNodes(d);
  }

  collapse(d) {
    this.navigationManager.collapse(d);
  }

  expand(d) {
    this.navigationManager.expand(d);
  }

  loadPagingNodes(node) {
    this.nodeManager.loadPagingNodes(node);
    this.updateNodesState();
  }

  // Utility methods
  getNodeChildren({ data, children, _children }, nodeStore) {
    return this.dataProcessor.getNodeChildren({ data, children, _children }, nodeStore);
  }

  isEdge() {
    return DOMUtils.isEdge();
  }

  restyleForeignObjectElements() {
    const attrs = this.getChartState();
    DOMUtils.restyleForeignObjectElements(attrs.svg, attrs);
  }

  toDataURL(url, callback) {
    ExportUtils.toDataURL(url, callback);
  }

  getTextWidth(text, options = {}) {
    return MathUtils.getTextWidth(text, options);
  }

  clear() {
    const attrs = this.getChartState();
    d3.select(window).on(`resize.${attrs.id}`, null);
    if (attrs.svg) {
      attrs.svg.remove();
      attrs.svg = null;
    }
    return this;
  }
}