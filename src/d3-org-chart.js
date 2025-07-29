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
        const attrs = this.getChartState();
        attrs.lastTransform.k = zoomLevel;
        return this;
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
            const behaviors = {
                zoom: null
            };

            // Get zooming function
            behaviors.zoom = attrs.createZoom()
                .clickDistance(10)
                .on('start', (event, d) => attrs.onZoomStart(event))
                .on('end', (event, d) => attrs.onZoomEnd(event))
                .on("zoom", (event, d) => {
                    attrs.onZoom(event);
                    this.zoomed(event, d);
                })
                .scaleExtent(attrs.scaleExtent)
            attrs.zoomBehavior = behaviors.zoom;
        }

        //****************** ROOT node work ************************

        attrs.flexTreeLayout = flextree({
            nodeSize: node => {
                const width = attrs.nodeWidth(node);;
                const height = attrs.nodeHeight(node);
                const siblingsMargin = attrs.siblingsMargin(node)
                const childrenMargin = attrs.childrenMargin(node);
                return attrs.layoutBindings[attrs.layout].nodeFlexSize({
                    state: attrs,
                    node: node,
                    width,
                    height,
                    siblingsMargin,
                    childrenMargin
                });
            }
        })
            .spacing((nodeA, nodeB) => nodeA.parent == nodeB.parent ? 0 : attrs.neighbourMargin(nodeA, nodeB));

        this.setLayouts({ expandNodesFirst: false });

        // *************************  DRAWING **************************
        //Add svg
        const svg = container
            .patternify({
                tag: "svg",
                selector: "svg-chart-container"
            })
            .attr("width", attrs.svgWidth)
            .attr("height", attrs.svgHeight)
            .attr("font-family", attrs.defaultFont)

        if (attrs.firstDraw) {
            svg.call(attrs.zoomBehavior)
                .on("dblclick.zoom", null)
                .attr("cursor", "move")
        }

        attrs.svg = svg;

        //Add container g element
        const chart = svg
            .patternify({
                tag: "g",
                selector: "chart"
            })

        // Add one more container g element, for better positioning controls
        attrs.centerG = chart
            .patternify({
                tag: "g",
                selector: "center-group"
            })

        attrs.linksWrapper = attrs.centerG.patternify({
            tag: "g",
            selector: "links-wrapper"
        })

        attrs.nodesWrapper = attrs.centerG.patternify({
            tag: "g",
            selector: "nodes-wrapper"
        })

        attrs.connectionsWrapper = attrs.centerG.patternify({
            tag: "g",
            selector: "connections-wrapper"
        })

        attrs.defsWrapper = svg.patternify({
            tag: "g",
            selector: "defs-wrapper"
        })

        if (attrs.firstDraw) {
            attrs.centerG.attr("transform", () => {
                return attrs.layoutBindings[attrs.layout].centerTransform({
                    centerX: calc.centerX,
                    centerY: calc.centerY,
                    scale: attrs.lastTransform.k,
                    rootMargin: attrs.rootMargin,
                    root: attrs.root,
                    chartHeight: calc.chartHeight,
                    chartWidth: calc.chartWidth
                })
            });
        }

        attrs.chart = chart;

        // Display tree contenrs
        this.update(attrs.root);


        //#########################################  UTIL FUNCS ##################################
        // This function restyles foreign object elements ()

        d3.select(window).on(`resize.${attrs.id}`, () => {
            const containerRect = d3.select(attrs.container).node().getBoundingClientRect();
            attrs.svg.attr('width', containerRect.width)
        });

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

    groupBy(array, accessor, aggregator) {
        return MathUtils.groupBy(array, accessor, aggregator);
    }
    calculateCompactFlexDimensions(root) {
        const attrs = this.getChartState();
        root.eachBefore(node => {
            node.firstCompact = null;
            node.compactEven = null;
            node.flexCompactDim = null;
            node.firstCompactNode = null;
        })
        root.eachBefore(node => {
            if (node.children && node.children.length > 1) {
                const compactChildren = node.children
                    .filter(d => !d.children)

                if (compactChildren.length < 2) return;
                compactChildren.forEach((child, i) => {
                    if (!i) child.firstCompact = true;
                    if (i % 2) child.compactEven = false;
                    else child.compactEven = true;
                    child.row = Math.floor(i / 2);
                })
                const evenMaxColumnDimension = d3.max(compactChildren.filter(d => d.compactEven), attrs.layoutBindings[attrs.layout].compactDimension.sizeColumn);
                const oddMaxColumnDimension = d3.max(compactChildren.filter(d => !d.compactEven), attrs.layoutBindings[attrs.layout].compactDimension.sizeColumn);
                const columnSize = Math.max(evenMaxColumnDimension, oddMaxColumnDimension) * 2;
                const rowsMapNew = this.groupBy(compactChildren, d => d.row, reducedGroup => d3.max(reducedGroup, d => attrs.layoutBindings[attrs.layout].compactDimension.sizeRow(d) + attrs.compactMarginBetween(d)));
                const rowSize = d3.sum(rowsMapNew.map(v => v[1]))
                compactChildren.forEach(node => {
                    node.firstCompactNode = compactChildren[0];
                    if (node.firstCompact) {
                        node.flexCompactDim = [
                            columnSize + attrs.compactMarginPair(node),
                            rowSize - attrs.compactMarginBetween(node)
                        ];
                    } else {
                        node.flexCompactDim = [0, 0];
                    }
                })
                node.flexCompactDim = null;
            }
        })
    }

    calculateCompactFlexPositions(root) {
        const attrs = this.getChartState();
        root.eachBefore(node => {
            if (node.children) {
                const compactChildren = node.children.filter(d => d.flexCompactDim);
                const fch = compactChildren[0];
                if (!fch) return;
                compactChildren.forEach((child, i, arr) => {
                    if (i == 0) fch.x -= fch.flexCompactDim[0] / 2;
                    if (i & i % 2 - 1) child.x = fch.x + fch.flexCompactDim[0] * 0.25 - attrs.compactMarginPair(child) / 4;
                    else if (i) child.x = fch.x + fch.flexCompactDim[0] * 0.75 + attrs.compactMarginPair(child) / 4;
                })
                const centerX = fch.x + fch.flexCompactDim[0] * 0.5;
                fch.x = fch.x + fch.flexCompactDim[0] * 0.25 - attrs.compactMarginPair(fch) / 4;
                const offsetX = node.x - centerX;
                if (Math.abs(offsetX) < 10) {
                    compactChildren.forEach(d => d.x += offsetX);
                }

                const rowsMapNew = this.groupBy(compactChildren, d => d.row, reducedGroup => d3.max(reducedGroup, d => attrs.layoutBindings[attrs.layout].compactDimension.sizeRow(d)));
                const cumSum = d3.cumsum(rowsMapNew.map(d => d[1] + attrs.compactMarginBetween(d)));
                compactChildren
                    .forEach((node, i) => {
                        if (node.row) {
                            node.y = fch.y + cumSum[node.row - 1]
                        } else {
                            node.y = fch.y;
                        }
                    })

            }
        })
    }

    // This function basically redraws visible graph, based on nodes state
    update({ x0, y0, x = 0, y = 0, width, height }) {
        const attrs = this.getChartState();
        const calc = attrs.calc;

        // Paging
        if (attrs.compact) {
            this.calculateCompactFlexDimensions(attrs.root);
        }

        //  Assigns the x and y position for the nodes
        const treeData = attrs.flexTreeLayout(attrs.root);

        // Reassigns the x and y position for the based on the compact layout
        if (attrs.compact) {
            this.calculateCompactFlexPositions(attrs.root);
        }

        const nodes = treeData.descendants();

        // console.table(nodes.map(d => ({ x: d.x, y: d.y, width: d.width, height: d.height, flexCompactDim: d.flexCompactDim + "" })))

        // Get all links
        const links = treeData.descendants().slice(1);
        nodes.forEach(attrs.layoutBindings[attrs.layout].swap)

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
        const defsString = attrs.defs.bind(this)(attrs, visibleConnections);
        const existingString = attrs.defsWrapper.html();
        if (defsString !== existingString) {
            attrs.defsWrapper.html(defsString)
        }

        // --------------------------  LINKS ----------------------
        // Get links selection
        const linkSelection = attrs.linksWrapper
            .selectAll("path.link")
            .data(links, (d) => attrs.nodeId(d.data));

        // Enter any new links at the parent's previous position.
        const linkEnter = linkSelection
            .enter()
            .insert("path", "g")
            .attr("class", "link")
            .attr("d", (d) => {
                const xo = attrs.layoutBindings[attrs.layout].linkJoinX({ x: x0, y: y0, width, height });
                const yo = attrs.layoutBindings[attrs.layout].linkJoinY({ x: x0, y: y0, width, height });
                const o = { x: xo, y: yo };
                return attrs.layoutBindings[attrs.layout].diagonal(o, o, o);
            });

        // Get links update selection
        const linkUpdate = linkEnter.merge(linkSelection);

        // Styling links
        linkUpdate
            .attr("fill", "none")


        if (this.isEdge()) {
            linkUpdate
                .style('display', d => {
                    const display = d.data._pagingButton ? 'none' : 'auto'
                    return display;
                })
        } else {
            linkUpdate
                .attr('display', d => {
                    const display = d.data._pagingButton ? 'none' : 'auto'
                    return display;
                })
        }

        // Allow external modifications
        linkUpdate.each(attrs.linkUpdate);

        // Transition back to the parent element position
        linkUpdate
            .transition()
            .duration(attrs.duration)
            .attr("d", (d) => {
                const n = attrs.compact && d.flexCompactDim ?
                    {
                        x: attrs.layoutBindings[attrs.layout].compactLinkMidX(d, attrs),
                        y: attrs.layoutBindings[attrs.layout].compactLinkMidY(d, attrs)
                    } :
                    {
                        x: attrs.layoutBindings[attrs.layout].linkX(d),
                        y: attrs.layoutBindings[attrs.layout].linkY(d)
                    };

                const p = {
                    x: attrs.layoutBindings[attrs.layout].linkParentX(d),
                    y: attrs.layoutBindings[attrs.layout].linkParentY(d),
                };

                const m = attrs.compact && d.flexCompactDim ? {
                    x: attrs.layoutBindings[attrs.layout].linkCompactXStart(d),
                    y: attrs.layoutBindings[attrs.layout].linkCompactYStart(d),
                } : n;
                return attrs.layoutBindings[attrs.layout].diagonal(n, p, m, { sy: attrs.linkYOffset });
            });

        // Remove any  links which is exiting after animation
        const linkExit = linkSelection
            .exit()
            .transition()
            .duration(attrs.duration)
            .attr("d", (d) => {
                const xo = attrs.layoutBindings[attrs.layout].linkJoinX({ x, y, width, height });
                const yo = attrs.layoutBindings[attrs.layout].linkJoinY({ x, y, width, height });
                const o = { x: xo, y: yo };
                return attrs.layoutBindings[attrs.layout].diagonal(o, o, null, { sy: attrs.linkYOffset });
            })
            .remove();


        // --------------------------  CONNECTIONS ----------------------

        const connectionsSel = attrs.connectionsWrapper
            .selectAll("path.connection")
            .data(visibleConnections)

        // Enter any new connections at the parent's previous position.
        const connEnter = connectionsSel
            .enter()
            .insert("path", "g")
            .attr("class", "connection")
            .attr("d", (d) => {
                const xo = attrs.layoutBindings[attrs.layout].linkJoinX({ x: x0, y: y0, width, height });
                const yo = attrs.layoutBindings[attrs.layout].linkJoinY({ x: x0, y: y0, width, height });
                const o = { x: xo, y: yo };
                return attrs.layoutBindings[attrs.layout].diagonal(o, o, null, { sy: attrs.linkYOffset });
            });


        // Get connections update selection
        const connUpdate = connEnter.merge(connectionsSel);

        // Styling connections
        connUpdate.attr("fill", "none")

        // Transition back to the parent element position
        connUpdate
            .transition()
            .duration(attrs.duration)
            .attr('d', (d) => {
                const xs = attrs.layoutBindings[attrs.layout].linkX({ x: d._source.x, y: d._source.y, width: d._source.width, height: d._source.height });
                const ys = attrs.layoutBindings[attrs.layout].linkY({ x: d._source.x, y: d._source.y, width: d._source.width, height: d._source.height });
                const xt = attrs.layoutBindings[attrs.layout].linkJoinX({ x: d._target.x, y: d._target.y, width: d._target.width, height: d._target.height });
                const yt = attrs.layoutBindings[attrs.layout].linkJoinY({ x: d._target.x, y: d._target.y, width: d._target.width, height: d._target.height });
                return attrs.linkGroupArc({ source: { x: xs, y: ys }, target: { x: xt, y: yt } })
            })

        // Allow external modifications
        connUpdate.each(attrs.connectionsUpdate);

        // Remove any  links which is exiting after animation
        const connExit = connectionsSel
            .exit()
            .transition()
            .duration(attrs.duration)
            .attr('opacity', 0)
            .remove();

        // --------------------------  NODES ----------------------
        // Get nodes selection
        const nodesSelection = attrs.nodesWrapper
            .selectAll("g.node")
            .data(nodes, ({ data }) => attrs.nodeId(data));

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = nodesSelection
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d) => {
                if (d == attrs.root) return `translate(${x0},${y0})`
                const xj = attrs.layoutBindings[attrs.layout].nodeJoinX({ x: x0, y: y0, width, height });
                const yj = attrs.layoutBindings[attrs.layout].nodeJoinY({ x: x0, y: y0, width, height });
                return `translate(${xj},${yj})`
            })
            .attr("cursor", "pointer")
            .on("click.node", (event, node) => {
                const { data } = node;
                if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
                    return;
                }
                if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
                    this.loadPagingNodes(node);
                    return;
                }
                if (!data._pagingButton) {
                    attrs.onNodeClick(node);
                    return;
                }
                console.log('event fired, no handlers')
            })
            //  Event handler to the expand button
            .on("keydown.node", (event, node) => {
                const { data } = node;
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
                        return;
                    }
                    if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
                        this.loadPagingNodes(node);
                        return;
                    }
                    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                        this.onButtonClick(event, node)
                    }
                }
            });
        nodeEnter.each(attrs.nodeEnter)

        // Add background rectangle for the nodes
        nodeEnter
            .patternify({
                tag: "rect",
                selector: "node-rect",
                data: (d) => [d]
            })

        // Node update styles
        const nodeUpdate = nodeEnter
            .merge(nodesSelection)
            .style("font", "12px sans-serif");

        // Add foreignObject element inside rectangle
        const fo = nodeUpdate.patternify({
            tag: "foreignObject",
            selector: "node-foreign-object",
            data: (d) => [d]
        })
            .style('overflow', 'visible')

        // Add foreign object
        fo.patternify({
            tag: "xhtml:div",
            selector: "node-foreign-object-div",
            data: (d) => [d]
        })

        this.restyleForeignObjectElements();

        // Add Node button circle's group (expand-collapse button)
        const nodeButtonGroups = nodeEnter
            .patternify({
                tag: "g",
                selector: "node-button-g",
                data: (d) => [d]
            })
            .on("click", (event, d) => this.onButtonClick(event, d))
            .on("keydown", (event, d) => {
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    this.onButtonClick(event, d)
                }
            });

        nodeButtonGroups.patternify({
            tag: 'rect',
            selector: 'node-button-rect',
            data: (d) => [d]
        })
            .attr('opacity', 0)
            .attr('pointer-events', 'all')
            .attr('width', d => attrs.nodeButtonWidth(d))
            .attr('height', d => attrs.nodeButtonHeight(d))
            .attr('x', d => attrs.nodeButtonX(d))
            .attr('y', d => attrs.nodeButtonY(d))

        // Add expand collapse button content
        const nodeFo = nodeButtonGroups
            .patternify({
                tag: "foreignObject",
                selector: "node-button-foreign-object",
                data: (d) => [d]
            })
            .attr('width', d => attrs.nodeButtonWidth(d))
            .attr('height', d => attrs.nodeButtonHeight(d))
            .attr('x', d => attrs.nodeButtonX(d))
            .attr('y', d => attrs.nodeButtonY(d))
            .style('overflow', 'visible')
            .patternify({
                tag: "xhtml:div",
                selector: "node-button-div",
                data: (d) => [d]
            })
            .style('pointer-events', 'none')
            .style('display', 'flex')
            .style('width', '100%')
            .style('height', '100%')



        // Transition to the proper position for the node
        nodeUpdate
            .transition()
            .attr("opacity", 0)
            .duration(attrs.duration)
            .attr("transform", ({ x, y, width, height }) => {
                return attrs.layoutBindings[attrs.layout].nodeUpdateTransform({ x, y, width, height });

            })
            .attr("opacity", 1);

        // Style node rectangles
        nodeUpdate
            .select(".node-rect")
            .attr("width", ({ width }) => width)
            .attr("height", ({ height }) => height)
            .attr("x", ({ width }) => 0)
            .attr("y", ({ height }) => 0)
            .attr("cursor", "pointer")
            .attr('rx', 3)
            .attr("fill", attrs.nodeDefaultBackground)


        nodeUpdate.select(".node-button-g").attr("transform", ({ data, width, height }) => {
            const x = attrs.layoutBindings[attrs.layout].buttonX({ width, height });
            const y = attrs.layoutBindings[attrs.layout].buttonY({ width, height });
            return `translate(${x},${y})`
        })
            .attr("display", ({ data }) => {
                return data._directSubordinates > 0 ? null : 'none';
            })
            .attr("opacity", ({ data, children, _children }) => {
                if (data._pagingButton) {
                    return 0;
                }
                if (children || _children) {
                    return 1;
                }
                return 0;
            });

        // Restyle node button circle
        nodeUpdate
            .select(".node-button-foreign-object .node-button-div")
            .html((node) => {
                return attrs.buttonContent({ node, state: attrs })
            })

        // Restyle button texts
        nodeUpdate
            .select(".node-button-text")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", ({ children }) => {
                if (children) return 40;
                return 26;
            })
            .text(({ children }) => {
                if (children) return "-";
                return "+";
            })
            .attr("y", this.isEdge() ? 10 : 0);

        nodeUpdate.each(attrs.nodeUpdate)

        // Remove any exiting nodes after transition
        const nodeExitTransition = nodesSelection
            .exit()
        nodeExitTransition.each(attrs.nodeExit)

        const maxDepthNode = nodeExitTransition.data().reduce((a, b) => a.depth < b.depth ? a : b, { depth: Infinity });

        nodeExitTransition.attr("opacity", 1)
            .transition()
            .duration(attrs.duration)
            .attr("transform", (d) => {

                let { x, y, width, height } = maxDepthNode.parent || {};
                const ex = attrs.layoutBindings[attrs.layout].nodeJoinX({ x, y, width, height });
                const ey = attrs.layoutBindings[attrs.layout].nodeJoinY({ x, y, width, height });
                return `translate(${ex},${ey})`
            })
            .on("end", function () {
                d3.select(this).remove();
            })
            .attr("opacity", 0);

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
        const attrs = this.getChartState();
        if (d.data._pagingButton) {
            return;
        }
        if (attrs.setActiveNodeCentered) {
            d.data._centered = true;
            d.data._centeredWithDescendants = true;
        }

        // If childrens are expanded
        if (d.children) {
            //Collapse them
            d._children = d.children;
            d.children = null;

            // Set descendants expanded property to false
            this.setExpansionFlagToChildren(d, false);
        } else {
            // Expand children
            d.children = d._children;
            d._children = null;

            // Set each children as expanded
            if (d.children) {
                d.children.forEach(({ data }) => (data._expanded = true));
            }
        }

        // Redraw Graph
        this.update(d);
        event.stopPropagation();

        // Trigger callback
        attrs.onExpandOrCollapse(d);

    }

    // This function changes `expanded` property to descendants
    setExpansionFlagToChildren({ data, children, _children }, flag) {
        // Set flag to the current property
        data._expanded = flag;

        // Loop over and recursively update expanded children's descendants
        if (children) {
            children.forEach((d) => {
                this.setExpansionFlagToChildren(d, flag);
            });
        }

        // Loop over and recursively update collapsed children's descendants
        if (_children) {
            _children.forEach((d) => {
                this.setExpansionFlagToChildren(d, flag);
            });
        }
    }


    // Method which only expands nodes, which have property set "expanded=true"
    expandSomeNodes(d) {
        // If node has expanded property set
        if (d.data._expanded) {
            // Retrieve node's parent
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
            d._children.forEach((ch) => this.expandSomeNodes(ch));
        }

        // Recursively do the same for expanded nodes
        if (d.children) {
            d.children.forEach((ch) => this.expandSomeNodes(ch));
        }
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
                attrs.root.children.forEach(this.expand);
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
        if (d.children) {
            d._children = d.children;
            d._children.forEach((ch) => this.collapse(ch));
            d.children = null;
        }
    }

    // Function which expands passed node and it's descendants
    expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach((ch) => this.expand(ch));
            d._children = null;
        }
    }

    // Zoom handler function
    zoomed(event, d) {
        const attrs = this.getChartState();
        const chart = attrs.chart;

        // Get d3 event's transform object
        const transform = event.transform;

        // Store it
        attrs.lastTransform = transform;

        // Reposition and rescale chart accordingly
        chart.attr("transform", transform);

        // Apply new styles to the foreign object element
        if (this.isEdge()) {
            this.restyleForeignObjectElements();
        }
    }

    zoomTreeBounds({ x0, x1, y0, y1, params = { animate: true, scale: true, onCompleted: () => { } } }) {
        const { centerG, svgWidth: w, svgHeight: h, svg, zoomBehavior, duration, lastTransform } = this.getChartState()
        let scaleVal = Math.min(8, 0.9 / Math.max((x1 - x0) / w, (y1 - y0) / h));
        let identity = d3.zoomIdentity.translate(w / 2, h / 2)
        identity = identity.scale(params.scale ? scaleVal : lastTransform.k)

        identity = identity.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
        // Transition zoom wrapper component into specified bounds
        svg.transition().duration(params.animate ? duration : 0).call(zoomBehavior.transform, identity);
        centerG.transition().duration(params.animate ? duration : 0).attr('transform', 'translate(0,0)')
            .on('end', function () {
                if (params.onCompleted) {
                    params.onCompleted()
                }
            })
    }

    fit({ animate = true, nodes, scale = true, onCompleted = () => { } } = {}) {
        const attrs = this.getChartState();
        const { root } = attrs;
        let descendants = nodes ? nodes : root.descendants();
        const { minX, maxX, minY, maxY } = MathUtils.calculateBounds(descendants, attrs.layoutBindings, attrs.layout);

        this.zoomTreeBounds({
            params: { animate: animate, scale, onCompleted },
            x0: minX - 50,
            x1: maxX + 50,
            y0: minY - 50,
            y1: maxY + 50,

        });
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
        const attrs = this.getChartState();
        const el = d3.select(elem || attrs.container).node();

        d3.select(document).on('fullscreenchange.' + attrs.id, function (d) {
            const fsElement = document.fullscreenElement || document.mozFullscreenElement || document.webkitFullscreenElement;
            if (fsElement == el) {
                setTimeout(d => {
                    attrs.svg.attr('height', window.innerHeight - 40);
                }, 500)
            } else {
                attrs.svg.attr('height', attrs.svgHeight)
            }
        })

        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    }

    // Zoom in exposed method
    zoomIn() {
        const { svg, zoomBehavior } = this.getChartState();
        svg.transition().call(zoomBehavior.scaleBy, 1.3);
    }

    // Zoom out exposed method
    zoomOut() {
        const { svg, zoomBehavior } = this.getChartState();
        svg.transition().call(zoomBehavior.scaleBy, 0.78);
    }

    toDataURL(url, callback) {
        ExportUtils.toDataURL(url, callback);
    }

    exportImg({ full = false, scale = 3, onLoad = d => d, save = true, backgroundColor = "#FAFAFA" } = {}) {
        const that = this;
        const attrs = this.getChartState();
        const { svg: svgImg, root } = attrs
        let count = 0;
        const selection = svgImg.selectAll('img')
        let total = selection.size()

        const exportImage = () => {
            const transform = JSON.parse(JSON.stringify(that.lastTransform()));
            const duration = that.duration();
            if (full) {
                that.fit();
            }
            const { svg } = that.getChartState()

            setTimeout(d => {
                that.downloadImage({
                    node: svg.node(), scale,
                    isSvg: false,
                    backgroundColor,
                    onAlreadySerialized: d => {
                        that.update(root)
                    },
                    imageName: attrs.imageName,
                    onLoad: onLoad,
                    save
                })
            }, full ? duration + 10 : 0)
        }

        if (total > 0) {
            selection
                .each(function () {
                    that.toDataURL(this.src, (dataUrl) => {
                        this.src = dataUrl;
                        if (++count == total) {
                            exportImage();
                        }
                    })
                })
        } else {
            exportImage();
        }


    }



    exportSvg() {
        const { svg, imageName } = this.getChartState();
        this.downloadImage({ imageName: imageName, node: svg.node(), scale: 3, isSvg: true })
        return this;
    }

    expandAll() {
        const { allNodes, root, data } = this.getChartState();
        data.forEach(d => d._expanded = true)
        // allNodes.forEach(d => d.data._expanded = true);
        this.render()
        return this;
    }

    collapseAll() {
        const { allNodes, root } = this.getChartState();
        allNodes.forEach(d => d.data._expanded = false);
        this.initialExpandLevel(0)
        this.render();
        return this;
    }

    downloadImage({ node, scale = 2, imageName = 'graph', isSvg = false, save = true, backgroundColor = "#FAFAFA", onAlreadySerialized = d => { }, onLoad = d => { } }) {
        // Retrieve svg node
        const svgNode = node;




        if (isSvg) {
            let source = ExportUtils.serializeString(svgNode);
            //add xml declaration
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            //convert svg source to URI data scheme.
            var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            ExportUtils.saveAs(url, imageName + ".svg");
            onAlreadySerialized()
            return;
        }
        // Get image quality index (basically,  index you can zoom in)
        const quality = scale
        // Create image
        const image = document.createElement('img');
        image.onload = function () {
            // Create image canvas
            const canvas = document.createElement('canvas');
            // Set width and height based on SVG node
            const rect = svgNode.getBoundingClientRect();
            canvas.width = rect.width * quality;
            canvas.height = rect.height * quality;
            // Draw background
            const context = canvas.getContext('2d');
            context.fillStyle = backgroundColor;;
            context.fillRect(0, 0, rect.width * quality, rect.height * quality);
            context.drawImage(image, 0, 0, rect.width * quality, rect.height * quality);
            // Set some image metadata
            let dt = canvas.toDataURL('image/png');
            if (onLoad) {
                onLoad(dt)
            }
            if (save) {
                // Invoke saving function
                ExportUtils.saveAs(dt, imageName + '.png');
            }

        };

        var url = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(ExportUtils.serializeString(svgNode));

        onAlreadySerialized()

        image.src = url// URL.createObjectURL(blob);
        // This function invokes save window

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