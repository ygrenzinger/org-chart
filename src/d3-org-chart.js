import { selection, select } from "d3-selection";
import { max, min, sum, cumsum } from "d3-array";
import { tree, stratify } from "d3-hierarchy";
import { zoom, zoomIdentity } from "d3-zoom";
import { flextree } from 'd3-flextree';
import { linkHorizontal } from 'd3-shape';
import { ChartState } from './core/ChartState.js';
import { DOMUtils } from './utils/DOMUtils.js';
import { MathUtils } from './utils/MathUtils.js';
import { ExportUtils } from './utils/ExportUtils.js';
import { DataProcessor } from './data/DataProcessor.js';
import { NodeManager } from './data/NodeManager.js';
import { LayoutManager } from './layout/LayoutManager.js';
import { Renderer } from './rendering/Renderer.js';
import { ZoomManager } from './interaction/ZoomManager.js';
import { NavigationManager } from './interaction/NavigationManager.js';
import { EventManager } from './interaction/EventManager.js';
import { FullscreenManager } from './interaction/FullscreenManager.js';
import { ExportManager } from './export/ExportManager.js';
import { PrintManager } from './export/PrintManager.js';

const d3 = {
    selection,
    select,
    max,
    min,
    sum,
    cumsum,
    tree,
    stratify,
    zoom,
    zoomIdentity,
    linkHorizontal,
    flextree
}

export class OrgChart {
    constructor() {
        // Initialize chart state with configuration management
        const chartState = new ChartState();
        const attrs = chartState.getState();

        this.getChartState = () => attrs;

        // Initialize data processing modules
        this.dataProcessor = new DataProcessor(chartState);
        this.nodeManager = new NodeManager(this.dataProcessor, chartState);
        
        // Initialize layout manager
        this.layoutManager = new LayoutManager(chartState);
        this.layoutManager.setupLayoutBindings();
        
        // Initialize renderer
        this.renderer = new Renderer(chartState);
        
        // Initialize interaction managers
        this.zoomManager = new ZoomManager(chartState);
        this.navigationManager = new NavigationManager(chartState, this.nodeManager, (d) => this.update(d));
        this.eventManager = new EventManager(chartState, this.navigationManager, this.nodeManager);
        this.fullscreenManager = new FullscreenManager(chartState);
        
        // Initialize export managers
        this.exportManager = new ExportManager(this);
        this.printManager = new PrintManager(this, this.exportManager);
        
        // Store reference to chart instance for callbacks
        attrs.chartInstance = this;

        // Dynamically set getter and setter functions for Chart class using ChartState
        Object.keys(attrs).forEach((key) => {
            //@ts-ignore
            this[key] = function (_) {
                if (!arguments.length) {
                    return attrs[key];
                } else {
                    attrs[key] = _;
                }
                return this;
            };
        });

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

    // This method retrieves passed node's children IDs (including node)
    getNodeChildren({ data, children, _children }, nodeStore) {
        return this.dataProcessor.getNodeChildren({ data, children, _children }, nodeStore);
    }

    // This method can be invoked via chart.setZoomFactor API, it zooms to particulat scale
    initialZoom(zoomLevel) {
        return this.zoomManager.initialZoom(zoomLevel);
    }

    render() {
        //InnerFunctions which will update visuals
        const attrs = this.getChartState();
        if (!attrs.data || attrs.data.length == 0) {
            console.log('ORG CHART - Data is empty');
            if (attrs.container) {
                select(attrs.container).select('.nodes-wrapper').remove();
                select(attrs.container).select('.links-wrapper').remove();
                select(attrs.container).select('.connections-wrapper').remove();
            }
            return this;
        }

        //Drawing containers
        const container = d3.select(attrs.container);
        const containerRect = container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

        //Calculated properties
        const calc = {
            id: `ID${Math.floor(Math.random() * 1000000)}`, // id for event handlings,
            chartWidth: attrs.svgWidth,
            chartHeight: attrs.svgHeight
        };
        attrs.calc = calc;

        // Calculate max node depth (it's needed for layout heights calculation)
        calc.centerX = calc.chartWidth / 2;
        calc.centerY = calc.chartHeight / 2;

        // ******************* BEHAVIORS  **********************
        if (attrs.firstDraw) {
            // Initialize zoom behavior using ZoomManager
            this.zoomManager.initializeZoom();
        }

        //****************** ROOT node work ************************

        // Initialize flex tree layout using layout manager
        this.layoutManager.initializeFlexTreeLayout();

        this.setLayouts({ expandNodesFirst: false });

        // *************************  DRAWING **************************
        // Initialize SVG using renderer
        const { svg, chart, centerG } = this.renderer.initializeSVG();

        // Display tree contenrs
        this.update(attrs.root);


        //#########################################  UTIL FUNCS ##################################
        // Setup window resize handling using renderer
        this.renderer.setupWindowResize();

        if (attrs.firstDraw) {
            attrs.firstDraw = false;
        }

        return this;
    }

    // This function can be invoked via chart.addNode API, and it adds node in tree at runtime
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

    // This function can be invoked via chart.removeNode API, and it removes node from tree at runtime
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




    // This function basically redraws visible graph, based on nodes state
    update({ x0, y0, x = 0, y = 0, width, height }) {
        const attrs = this.getChartState();
        const calc = attrs.calc;

        // Apply layout using layout manager
        const { nodes, links } = this.layoutManager.applyLayout(attrs.root);

        // Connections
        const connections = attrs.connections;
        const allNodesMap = {};
        attrs.allNodes.forEach(d => allNodesMap[attrs.nodeId(d.data)] = d);

        const visibleNodesMap = {}
        nodes.forEach(d => visibleNodesMap[attrs.nodeId(d.data)] = d);

        connections.forEach(connection => {
            const source = allNodesMap[connection.from];
            const target = allNodesMap[connection.to];
            connection._source = source;
            connection._target = target;
        })
        const visibleConnections = connections.filter(d => visibleNodesMap[d.from] && visibleNodesMap[d.to]);

        // Use renderer to handle all rendering operations
        this.renderer.render(nodes, links, visibleConnections, { x0, y0, x, y, width, height });

        // Store the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // CHECK FOR CENTERING
        const centeredNode = attrs.allNodes.filter(d => d.data._centered)[0]
        if (centeredNode) {
            let centeredNodes = [centeredNode]
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
            this.fit({
                animate: true,
                scale: false,
                nodes: centeredNodes
            })
        }

    }



    // This function detects whether current browser is edge
    isEdge() {
        return DOMUtils.isEdge();
    }

    // Generate horizontal diagonal - play with it here - https://observablehq.com/@bumbeishvili/curved-edges-horizontal-d3-v3-v4-v5-v6
    hdiagonal(s, t, m, offsets) {
        const state = this.getChartState();
        return state.hdiagonal(s, t, m, offsets);
    }

    // Generate custom diagonal - play with it here - https://observablehq.com/@bumbeishvili/curved-edges
    diagonal(s, t, m, offsets) {
        const state = this.getChartState();
        return state.diagonal(s, t, m, offsets);
    }

    restyleForeignObjectElements() {
        const attrs = this.getChartState();
        DOMUtils.restyleForeignObjectElements(attrs.svg, attrs);
    }

    // Toggle children on click.
    onButtonClick(event, d) {
        this.navigationManager.onButtonClick(event, d);
    }

    // This function changes `expanded` property to descendants
    setExpansionFlagToChildren({ data, children, _children }, flag) {
        this.navigationManager.setExpansionFlagToChildren({ data, children, _children }, flag);
    }


    // Method which only expands nodes, which have property set "expanded=true"
    expandSomeNodes(d) {
        this.navigationManager.expandSomeNodes(d);
    }

    // This function updates nodes state and redraws graph, usually after data change
    updateNodesState() {
        const attrs = this.getChartState();


        this.setLayouts({ expandNodesFirst: true });

        // Redraw Graphs
        this.update(attrs.root);
    }

    setLayouts({ expandNodesFirst = true }) {
        const attrs = this.getChartState();
        // Store new root by converting flat data to hierarchy

        attrs.generateRoot = (data) => this.dataProcessor.generateRoot(data);
        attrs.root = attrs.generateRoot(attrs.data);

        const descendantsBefore = attrs.root.descendants();
        if (attrs.initialExpandLevel > 1 && descendantsBefore.length > 0) {
            descendantsBefore.forEach((d) => {
                if (d.depth <= attrs.initialExpandLevel) {
                    d.data._expanded = true;
                }
            })
            attrs.initialExpandLevel = 1;
        }


        const hiddenNodesMap = {};
        attrs.root.descendants()
            .filter(node => node.children)
            .filter(node => !node.data._pagingStep)
            .forEach(node => {
                node.data._pagingStep = attrs.minPagingVisibleNodes(node);
            })



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
                                })
                            }
                            localNode = localNode.parent;
                        }
                    }
                })
            }
        })


        attrs.root = this.dataProcessor.generateRoot(attrs.data.filter(d => hiddenNodesMap[d.id] !== true));

        attrs.root = this.dataProcessor.processHierarchyData(attrs.root, attrs);

        // Store positions, where children appear during their enter animation
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

        if (attrs.root.children) {
            if (expandNodesFirst) {
                // Expand all nodes first
                attrs.root.children.forEach((d) => this.expand(d));
            }
            // Then collapse them all
            attrs.root.children.forEach((d) => this.collapse(d));

            // Collapse root if level is 0
            if (attrs.initialExpandLevel == 0) {
                attrs.root._children = attrs.root.children;
                attrs.root.children = null;
            }

            // Then only expand nodes, which have expanded property set to true
            [attrs.root].forEach((ch) => this.expandSomeNodes(ch));
        }
    }

    // Function which collapses passed node and it's descendants
    collapse(d) {
        this.navigationManager.collapse(d);
    }

    // Function which expands passed node and it's descendants
    expand(d) {
        this.navigationManager.expand(d);
    }

    // Zoom handler function
    zoomed(event, d) {
        this.zoomManager.zoomed(event, d);
    }

    zoomTreeBounds({ x0, x1, y0, y1, params = { animate: true, scale: true, onCompleted: () => { } } }) {
        this.zoomManager.zoomTreeBounds({ x0, x1, y0, y1, params });
    }

    fit({ animate = true, nodes, scale = true, onCompleted = () => { } } = {}) {
        this.zoomManager.fit({ animate, nodes, scale, onCompleted });
        return this;
    }

    // Load Paging Nodes
    loadPagingNodes(node) {
        this.nodeManager.loadPagingNodes(node);
        this.updateNodesState();
    }

    // This function can be invoked via chart.setExpanded API, it expands or collapses particular node
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

    // It can take selector which would go fullscreen
    fullscreen(elem) {
        this.fullscreenManager.fullscreen(elem);
    }

    // Zoom in exposed method
    zoomIn() {
        this.zoomManager.zoomIn();
    }

    // Zoom out exposed method
    zoomOut() {
        this.zoomManager.zoomOut();
    }

    toDataURL(url, callback) {
        ExportUtils.toDataURL(url, callback);
    }

    exportImg(options = {}) {
        this.exportManager.exportPNG(options);
        return this;
    }



    exportSvg() {
        this.exportManager.exportSVG();
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

    downloadImage(options) {
        return this.exportManager.imageExporter.downloadImage(options);
    }

    // Calculate what size text will take
    getTextWidth(text, {
        fontSize = 14,
        fontWeight = 400,
        defaultFont = "Helvetice",
        ctx
    } = {}) {
        return MathUtils.getTextWidth(text, { ctx, fontSize, defaultFont });
    }

    // Clear after moving off from the page
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