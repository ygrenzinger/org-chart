import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { linkHorizontal } from 'd3-shape';

const d3 = {
    select,
    zoom,
    linkHorizontal
}

// Default configuration constants
export const DEFAULT_CONFIG = {
  // NOT INTENDED FOR PUBLIC OVERRIDE
  id: null, // Will be set in ChartState constructor
  firstDraw: true,
  ctx: document.createElement('canvas').getContext('2d'),
  initialExpandLevel: 1,
  nodeDefaultBackground: 'none',
  lastTransform: { x: 0, y: 0, k: 1 },
  allowedNodesCount: {},
  zoomBehavior: null,
  generateRoot: null,

  // INTENDED FOR PUBLIC OVERRIDE
  svgWidth: 800,
  svgHeight: window.innerHeight - 100,
  container: "body",
  data: null,
  connections: [],
  defaultFont: "Helvetica",
  nodeId: d => d.nodeId || d.id,
  parentNodeId: d => d.parentNodeId || d.parentId,
  rootMargin: 40,
  nodeWidth: d3Node => 250,
  nodeHeight: d => 150,
  neighbourMargin: (n1, n2) => 80,
  siblingsMargin: d3Node => 20,
  childrenMargin: d => 60,
  compactMarginPair: d => 100,
  compactMarginBetween: d3Node => 20,
  nodeButtonWidth: d => 40,
  nodeButtonHeight: d => 40,
  nodeButtonX: d => -20,
  nodeButtonY: d => -20,
  linkYOffset: 30,
  pagingStep: d => 5,
  minPagingVisibleNodes: d => 2000,
  scaleExtent: [0.001, 20],
  duration: 400,
  imageName: 'Chart',
  setActiveNodeCentered: true,
  layout: "top",
  compact: true,
  createZoom: d => d3.zoom(),
  onZoomStart: e => { },
  onZoom: e => { },
  onZoomEnd: e => { },
  onNodeClick: (d) => d,
  onExpandOrCollapse: (d) => d,
  nodeContent: d => `<div style="padding:5px;font-size:10px;">Sample Node(id=${d.id}), override using <br/> 
            <code>chart.nodeContent({data}=>{ <br/>
             &nbsp;&nbsp;&nbsp;&nbsp;return '' // Custom HTML <br/>
             })</code>
             <br/> 
             Or check different <a href="https://github.com/bumbeishvili/org-chart#jump-to-examples" target="_blank">layout examples</a>
             </div>`,
  buttonContent: ({ node, state }) => {
    const icons = {
      "left": d => d ?
        `<div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.283 3.50094L6.51 11.4749C6.37348 11.615 6.29707 11.8029 6.29707 11.9984C6.29707 12.194 6.37348 12.3819 6.51 12.5219L14.283 20.4989C14.3466 20.5643 14.4226 20.6162 14.5066 20.6516C14.5906 20.6871 14.6808 20.7053 14.772 20.7053C14.8632 20.7053 14.9534 20.6871 15.0374 20.6516C15.1214 20.6162 15.1974 20.5643 15.261 20.4989C15.3918 20.365 15.4651 20.1852 15.4651 19.9979C15.4651 19.8107 15.3918 19.6309 15.261 19.4969L7.9515 11.9984L15.261 4.50144C15.3914 4.36756 15.4643 4.18807 15.4643 4.00119C15.4643 3.81431 15.3914 3.63482 15.261 3.50094C15.1974 3.43563 15.1214 3.38371 15.0374 3.34827C14.9534 3.31282 14.8632 3.29456 14.772 3.29456C14.6808 3.29456 14.5906 3.31282 14.5066 3.34827C14.4226 3.38371 14.3466 3.43563 14.283 3.50094V3.50094Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg></span><span style="color:#716E7B">${node.data._directSubordinatesPaging} </span></div>` :
        `<div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.989 3.49944C7.85817 3.63339 7.78492 3.8132 7.78492 4.00044C7.78492 4.18768 7.85817 4.36749 7.989 4.50144L15.2985 11.9999L7.989 19.4969C7.85817 19.6309 7.78492 19.8107 7.78492 19.9979C7.78492 20.1852 7.85817 20.365 7.989 20.4989C8.05259 20.5643 8.12863 20.6162 8.21261 20.6516C8.2966 20.6871 8.38684 20.7053 8.478 20.7053C8.56916 20.7053 8.6594 20.6871 8.74338 20.6516C8.82737 20.6162 8.90341 20.5643 8.967 20.4989L16.74 12.5234C16.8765 12.3834 16.9529 12.1955 16.9529 11.9999C16.9529 11.8044 16.8765 11.6165 16.74 11.4764L8.967 3.50094C8.90341 3.43563 8.82737 3.38371 8.74338 3.34827C8.6594 3.31282 8.56916 3.29456 8.478 3.29456C8.38684 3.29456 8.2966 3.31282 8.21261 3.34827C8.12863 3.38371 8.05259 3.43563 7.989 3.50094V3.49944Z" fill="#716E7B" stroke="#716E7B"/>
                          </svg></span><span style="color:#716E7B">${node.data._directSubordinatesPaging} </span></div>`,
      "bottom": d => d ? `<div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M19.497 7.98903L12 15.297L4.503 7.98903C4.36905 7.85819 4.18924 7.78495 4.002 7.78495C3.81476 7.78495 3.63495 7.85819 3.501 7.98903C3.43614 8.05257 3.38462 8.12842 3.34944 8.21213C3.31427 8.29584 3.29615 8.38573 3.29615 8.47653C3.29615 8.56733 3.31427 8.65721 3.34944 8.74092C3.38462 8.82463 3.43614 8.90048 3.501 8.96403L11.4765 16.74C11.6166 16.8765 11.8044 16.953 12 16.953C12.1956 16.953 12.3834 16.8765 12.5235 16.74L20.499 8.96553C20.5643 8.90193 20.6162 8.8259 20.6517 8.74191C20.6871 8.65792 20.7054 8.56769 20.7054 8.47653C20.7054 8.38537 20.6871 8.29513 20.6517 8.21114C20.6162 8.12715 20.5643 8.05112 20.499 7.98753C20.3651 7.85669 20.1852 7.78345 19.998 7.78345C19.8108 7.78345 19.6309 7.85669 19.497 7.98753V7.98903Z" fill="#716E7B" stroke="#716E7B"/>
                       </svg></span><span style="margin-left:1px;color:#716E7B" >${node.data._directSubordinatesPaging} </span></div>
                       ` : `<div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M11.457 8.07005L3.49199 16.4296C3.35903 16.569 3.28485 16.7543 3.28485 16.9471C3.28485 17.1398 3.35903 17.3251 3.49199 17.4646L3.50099 17.4736C3.56545 17.5414 3.64304 17.5954 3.72904 17.6324C3.81504 17.6693 3.90765 17.6883 4.00124 17.6883C4.09483 17.6883 4.18745 17.6693 4.27344 17.6324C4.35944 17.5954 4.43703 17.5414 4.50149 17.4736L12.0015 9.60155L19.4985 17.4736C19.563 17.5414 19.6405 17.5954 19.7265 17.6324C19.8125 17.6693 19.9052 17.6883 19.9987 17.6883C20.0923 17.6883 20.1849 17.6693 20.2709 17.6324C20.3569 17.5954 20.4345 17.5414 20.499 17.4736L20.508 17.4646C20.641 17.3251 20.7151 17.1398 20.7151 16.9471C20.7151 16.7543 20.641 16.569 20.508 16.4296L12.543 8.07005C12.4729 7.99653 12.3887 7.93801 12.2954 7.89801C12.202 7.85802 12.1015 7.8374 12 7.8374C11.8984 7.8374 11.798 7.85802 11.7046 7.89801C11.6113 7.93801 11.527 7.99653 11.457 8.07005Z" fill="#716E7B" stroke="#716E7B"/>
                       </svg></span><span style="margin-left:1px;color:#716E7B" >${node.data._directSubordinatesPaging} </span></div>`,
      "right": d => d ? `<div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M7.989 3.49944C7.85817 3.63339 7.78492 3.8132 7.78492 4.00044C7.78492 4.18768 7.85817 4.36749 7.989 4.50144L15.2985 11.9999L7.989 19.4969C7.85817 19.6309 7.78492 19.8107 7.78492 19.9979C7.78492 20.1852 7.85817 20.365 7.989 20.4989C8.05259 20.5643 8.12863 20.6162 8.21261 20.6516C8.2966 20.6871 8.38684 20.7053 8.478 20.7053C8.56916 20.7053 8.6594 20.6871 8.74338 20.6516C8.82737 20.6162 8.90341 20.5643 8.967 20.4989L16.74 12.5234C16.8765 12.3834 16.9529 12.1955 16.9529 11.9999C16.9529 11.8044 16.8765 11.6165 16.74 11.4764L8.967 3.50094C8.90341 3.43563 8.82737 3.38371 8.74338 3.34827C8.6594 3.31282 8.56916 3.29456 8.478 3.29456C8.38684 3.29456 8.2966 3.31282 8.21261 3.34827C8.12863 3.38371 8.05259 3.43563 7.989 3.50094V3.49944Z" fill="#716E7B" stroke="#716E7B"/>
                       </svg></span><span style="color:#716E7B">${node.data._directSubordinatesPaging} </span></div>` :
        `<div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M14.283 3.50094L6.51 11.4749C6.37348 11.615 6.29707 11.8029 6.29707 11.9984C6.29707 12.194 6.37348 12.3819 6.51 12.5219L14.283 20.4989C14.3466 20.5643 14.4226 20.6162 14.5066 20.6516C14.5906 20.6871 14.6808 20.7053 14.772 20.7053C14.8632 20.7053 14.9534 20.6871 15.0374 20.6516C15.1214 20.6162 15.1974 20.5643 15.261 20.4989C15.3918 20.365 15.4651 20.1852 15.4651 19.9979C15.4651 19.8107 15.3918 19.6309 15.261 19.4969L7.9515 11.9984L15.261 4.50144C15.3914 4.36756 15.4643 4.18807 15.4643 4.00119C15.4643 3.81431 15.3914 3.63482 15.261 3.50094C15.1974 3.43563 15.1214 3.38371 15.0374 3.34827C14.9534 3.31282 14.8632 3.29456 14.772 3.29456C14.6808 3.29456 14.5906 3.31282 14.5066 3.34827C14.4226 3.38371 14.3466 3.43563 14.283 3.50094V3.50094Z" fill="#716E7B" stroke="#716E7B"/>
                       </svg></span><span style="color:#716E7B">${node.data._directSubordinatesPaging} </span></div>`,
      "top": d => d ? `<div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.457 8.07005L3.49199 16.4296C3.35903 16.569 3.28485 16.7543 3.28485 16.9471C3.28485 17.1398 3.35903 17.3251 3.49199 17.4646L3.50099 17.4736C3.56545 17.5414 3.64304 17.5954 3.72904 17.6324C3.81504 17.6693 3.90765 17.6883 4.00124 17.6883C4.09483 17.6883 4.18745 17.6693 4.27344 17.6324C4.35944 17.5954 4.43703 17.5414 4.50149 17.4736L12.0015 9.60155L19.4985 17.4736C19.563 17.5414 19.6405 17.5954 19.7265 17.6324C19.8125 17.6693 19.9052 17.6883 19.9987 17.6883C20.0923 17.6883 20.1849 17.6693 20.2709 17.6324C20.3569 17.5954 20.4345 17.5414 20.499 17.4736L20.508 17.4646C20.641 17.3251 20.7151 17.1398 20.7151 16.9471C20.7151 16.7543 20.641 16.569 20.508 16.4296L12.543 8.07005C12.4729 7.99653 12.3887 7.93801 12.2954 7.89801C12.202 7.85802 12.1015 7.8374 12 7.8374C11.8984 7.8374 11.798 7.85802 11.7046 7.89801C11.6113 7.93801 11.527 7.99653 11.457 8.07005Z" fill="#716E7B" stroke="#716E7B"/>
                        </svg></span><span style="margin-left:1px;color:#716E7B">${node.data._directSubordinatesPaging} </span></div>
                        ` : `<div style="display:flex;"><span style="align-items:center;display:flex;"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.497 7.98903L12 15.297L4.503 7.98903C4.36905 7.85819 4.18924 7.78495 4.002 7.78495C3.81476 7.78495 3.63495 7.85819 3.501 7.98903C3.43614 8.05257 3.38462 8.12842 3.34944 8.21213C3.31427 8.29584 3.29615 8.38573 3.29615 8.47653C3.29615 8.56733 3.31427 8.65721 3.34944 8.74092C3.38462 8.82463 3.43614 8.90048 3.501 8.96403L11.4765 16.74C11.6166 16.8765 11.8044 16.953 12 16.953C12.1956 16.953 12.3834 16.8765 12.5235 16.74L20.499 8.96553C20.5643 8.90193 20.6162 8.8259 20.6517 8.74191C20.6871 8.65792 20.7054 8.56769 20.7054 8.47653C20.7054 8.38537 20.6871 8.29513 20.6517 8.21114C20.6162 8.12715 20.5643 8.05112 20.499 7.98753C20.3651 7.85669 20.1852 7.78345 19.998 7.78345C19.8108 7.78345 19.6309 7.85669 19.497 7.98753V7.98903Z" fill="#716E7B" stroke="#716E7B"/>
                        </svg></span><span style="margin-left:1px;color:#716E7B">${node.data._directSubordinatesPaging} </span></div>`
    }
    return `<div style="border:1px solid #E4E2E9;border-radius:3px;padding:3px;font-size:9px;margin:auto auto;background-color:white"> ${icons[state.layout](node.children)}  </div>`
  },
  pagingButton: (d, i, arr, state) => {
    const step = state.pagingStep(d.parent);
    const currentIndex = d.parent.data._pagingStep;
    const diff = d.parent.data._directSubordinatesPaging - currentIndex;
    const min = Math.min(diff, step);
    return `
                   <div style="margin-top:90px;">
                      <div style="display:flex;width:170px;border-radius:20px;padding:5px 15px; padding-bottom:4px;;background-color:#E5E9F2">
                      <div><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.59 7.41L10.18 12L5.59 16.59L7 18L13 12L7 6L5.59 7.41ZM16 6H18V18H16V6Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg>
                      </div><div style="line-height:2"> Show next ${min}  nodes </div></div>
                   </div>
                `
  },
  nodeUpdate: function (d, i, arr) {
    d3.select(this)
      .select('.node-rect')
      .attr("stroke", d => d.data._highlighted || d.data._upToTheRootHighlighted ? '#E27396' : 'none')
      .attr("stroke-width", d.data._highlighted || d.data._upToTheRootHighlighted ? 10 : 1)
  },
  nodeEnter: (d) => d,
  nodeExit: (d) => d,
  linkUpdate: function (d, i, arr) {
    d3.select(this)
      .attr("stroke", d => d.data._upToTheRootHighlighted ? '#E27396' : '#E4E2E9')
      .attr("stroke-width", d => d.data._upToTheRootHighlighted ? 5 : 1)

    if (d.data._upToTheRootHighlighted) {
      d3.select(this).raise()
    }
  },
  linkGroupArc: d3.linkHorizontal().x(d => d.x).y(d => d.y),
  hdiagonal: function (s, t, m, offsets = { sy: 0 }) {
    const x = s.x;
    const y = s.y;
    const ex = t.x;
    const ey = t.y;

    let mx = m && m.x != null ? m.x : x;
    let my = m && m.y != null ? m.y : y;

    let xrvs = ex - x < 0 ? -1 : 1;
    let yrvs = ey - y < 0 ? -1 : 1;

    let rdef = 35;
    let r = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;
    r = Math.abs(ey - y) / 2 < r ? Math.abs(ey - y) / 2 : r;

    let h = Math.abs(ey - y) / 2 - r;
    let w = Math.abs(ex - x) / 2 - r;

    return `
                          M ${mx} ${my}
                          L ${mx} ${y}
                          L ${x} ${y}
                          L ${x + w * xrvs} ${y}
                          C ${x + w * xrvs + r * xrvs} ${y} 
                            ${x + w * xrvs + r * xrvs} ${y} 
                            ${x + w * xrvs + r * xrvs} ${y + r * yrvs}
                          L ${x + w * xrvs + r * xrvs} ${ey - r * yrvs} 
                          C ${x + w * xrvs + r * xrvs}  ${ey} 
                            ${x + w * xrvs + r * xrvs}  ${ey} 
                            ${ex - w * xrvs}  ${ey}
                          L ${ex} ${ey}
               `;
  },
  diagonal: function (s, t, m, offsets = { sy: 0, }) {
    const x = s.x;
    let y = s.y;
    const ex = t.x;
    const ey = t.y;

    let mx = m && m.x != null ? m.x : x;
    let my = m && m.y != null ? m.y : y;

    let xrvs = ex - x < 0 ? -1 : 1;
    let yrvs = ey - y < 0 ? -1 : 1;

    y += offsets.sy;

    let rdef = 35;
    let r = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;
    r = Math.abs(ey - y) / 2 < r ? Math.abs(ey - y) / 2 : r;

    let h = Math.abs(ey - y) / 2 - r;
    let w = Math.abs(ex - x) - r * 2;

    const path = `
                          M ${mx} ${my}
                          L ${x} ${my}
                          L ${x} ${y}
                          L ${x} ${y + h * yrvs}
                          C  ${x} ${y + h * yrvs + r * yrvs} ${x} ${y + h * yrvs + r * yrvs
                } ${x + r * xrvs} ${y + h * yrvs + r * yrvs}
                          L ${x + w * xrvs + r * xrvs} ${y + h * yrvs + r * yrvs}
                          C  ${ex}  ${y + h * yrvs + r * yrvs} ${ex}  ${y + h * yrvs + r * yrvs
                } ${ex} ${ey - h * yrvs}
                          L ${ex} ${ey}
               `;
    return path;
  },
  defs: function (state, visibleConnections) {
    return `<defs>
                    ${visibleConnections.map(conn => {
      const labelWidth = this.getTextWidth(conn.label, { ctx: state.ctx, fontSize: 2, defaultFont: state.defaultFont });
      return `
                       <marker id="${conn.from + "_" + conn.to}" refX="${conn._source.x < conn._target.x ? -7 : 7}" refY="5" markerWidth="500"  markerHeight="500"  orient="${conn._source.x < conn._target.x ? "auto" : "auto-start-reverse"}" >
                       <rect rx=0.5 width=${conn.label ? labelWidth + 3 : 0} height=3 y=1  fill="#E27396"></rect>
                       <text font-size="2px" x=1 fill="white" y=3>${conn.label || ''}</text>
                       </marker>

                       <marker id="arrow-${conn.from + "_" + conn.to}"  markerWidth="500"  markerHeight="500"  refY="2"  refX="1" orient="${conn._source.x < conn._target.x ? "auto" : "auto-start-reverse"}" >
                       <path transform="translate(0)" d='M0,0 V4 L2,2 Z' fill='#E27396' />
                       </marker>
                    `}).join("")}
                    </defs>
                    `
  },
  connectionsUpdate: function (d, i, arr) {
    d3.select(this)
      .attr("stroke", d => '#E27396')
      .attr('stroke-linecap', 'round')
      .attr("stroke-width", d => '5')
      .attr('pointer-events', 'none')
      .attr("marker-start", d => `url(#${d.from + "_" + d.to})`)
      .attr("marker-end", d => `url(#arrow-${d.from + "_" + d.to})`)
  }
};

// Layout bindings will be added dynamically in the ChartState class
export const LAYOUT_BINDINGS_TEMPLATE = {
  "left": {
    "nodeLeftX": node => 0,
    "nodeRightX": node => node.width,
    "nodeTopY": node => - node.height / 2,
    "nodeBottomY": node => node.height / 2,
    "nodeJoinX": node => node.x + node.width,
    "nodeJoinY": node => node.y - node.height / 2,
    "linkJoinX": node => node.x + node.width,
    "linkJoinY": node => node.y,
    "linkX": node => node.x,
    "linkY": node => node.y,
    "linkCompactXStart": node => node.x + node.width / 2,
    "linkCompactYStart": node => node.y + (node.compactEven ? node.height / 2 : -node.height / 2),
    "compactLinkMidX": (node, state) => node.firstCompactNode.x,
    "compactLinkMidY": (node, state) => node.firstCompactNode.y + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4,
    "linkParentX": node => node.parent.x + node.parent.width,
    "linkParentY": node => node.parent.y,
    "buttonX": node => node.width,
    "buttonY": node => node.height / 2,
    "centerTransform": ({ root, rootMargin, centerY, scale, centerX }) => `translate(${rootMargin},${centerY}) scale(${scale})`,
    "compactDimension": {
      sizeColumn: node => node.height,
      sizeRow: node => node.width,
      reverse: arr => arr.slice().reverse()
    },
    "nodeFlexSize": ({ height, width, siblingsMargin, childrenMargin, state, node }) => {
      if (state.compact && node.flexCompactDim) {
        const result = [node.flexCompactDim[0], node.flexCompactDim[1]]
        return result;
      };
      return [height + siblingsMargin, width + childrenMargin]
    },
    "zoomTransform": ({ centerY, scale }) => `translate(${0},${centerY}) scale(${scale})`,
    "swap": d => { const x = d.x; d.x = d.y; d.y = x; },
    "nodeUpdateTransform": ({ x, y, width, height }) => `translate(${x},${y - height / 2})`,
  },
  "top": {
    "nodeLeftX": node => -node.width / 2,
    "nodeRightX": node => node.width / 2,
    "nodeTopY": node => 0,
    "nodeBottomY": node => node.height,
    "nodeJoinX": node => node.x - node.width / 2,
    "nodeJoinY": node => node.y + node.height,
    "linkJoinX": node => node.x,
    "linkJoinY": node => node.y + node.height,
    "linkCompactXStart": node => node.x + (node.compactEven ? node.width / 2 : -node.width / 2),
    "linkCompactYStart": node => node.y + node.height / 2,
    "compactLinkMidX": (node, state) => node.firstCompactNode.x + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4,
    "compactLinkMidY": node => node.firstCompactNode.y,
    "compactDimension": {
      sizeColumn: node => node.width,
      sizeRow: node => node.height,
      reverse: arr => arr,
    },
    "linkX": node => node.x,
    "linkY": node => node.y,
    "linkParentX": node => node.parent.x,
    "linkParentY": node => node.parent.y + node.parent.height,
    "buttonX": node => node.width / 2,
    "buttonY": node => node.height,
    "centerTransform": ({ root, rootMargin, centerY, scale, centerX }) => `translate(${centerX},${rootMargin}) scale(${scale})`,
    "nodeFlexSize": ({ height, width, siblingsMargin, childrenMargin, state, node, compactViewIndex }) => {
      if (state.compact && node.flexCompactDim) {
        const result = [node.flexCompactDim[0], node.flexCompactDim[1]]
        return result;
      };
      return [width + siblingsMargin, height + childrenMargin];
    },
    "zoomTransform": ({ centerX, scale }) => `translate(${centerX},0}) scale(${scale})`,
    "swap": d => { },
    "nodeUpdateTransform": ({ x, y, width, height }) => `translate(${x - width / 2},${y})`,
  },
  "bottom": {
    "nodeLeftX": node => -node.width / 2,
    "nodeRightX": node => node.width / 2,
    "nodeTopY": node => -node.height,
    "nodeBottomY": node => 0,
    "nodeJoinX": node => node.x - node.width / 2,
    "nodeJoinY": node => node.y - node.height - node.height,
    "linkJoinX": node => node.x,
    "linkJoinY": node => node.y - node.height,
    "linkCompactXStart": node => node.x + (node.compactEven ? node.width / 2 : -node.width / 2),
    "linkCompactYStart": node => node.y - node.height / 2,
    "compactLinkMidX": (node, state) => node.firstCompactNode.x + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4,
    "compactLinkMidY": node => node.firstCompactNode.y,
    "linkX": node => node.x,
    "linkY": node => node.y,
    "compactDimension": {
      sizeColumn: node => node.width,
      sizeRow: node => node.height,
      reverse: arr => arr,
    },
    "linkParentX": node => node.parent.x,
    "linkParentY": node => node.parent.y - node.parent.height,
    "buttonX": node => node.width / 2,
    "buttonY": node => 0,
    "centerTransform": ({ root, rootMargin, centerY, scale, centerX, chartHeight }) => `translate(${centerX},${chartHeight - rootMargin}) scale(${scale})`,
    "nodeFlexSize": ({ height, width, siblingsMargin, childrenMargin, state, node }) => {
      if (state.compact && node.flexCompactDim) {
        const result = [node.flexCompactDim[0], node.flexCompactDim[1]]
        return result;
      };
      return [width + siblingsMargin, height + childrenMargin]
    },
    "zoomTransform": ({ centerX, scale }) => `translate(${centerX},0}) scale(${scale})`,
    "swap": d => { d.y = -d.y; },
    "nodeUpdateTransform": ({ x, y, width, height }) => `translate(${x - width / 2},${y - height})`,
  },
  "right": {
    "nodeLeftX": node => -node.width,
    "nodeRightX": node => 0,
    "nodeTopY": node => - node.height / 2,
    "nodeBottomY": node => node.height / 2,
    "nodeJoinX": node => node.x - node.width - node.width,
    "nodeJoinY": node => node.y - node.height / 2,
    "linkJoinX": node => node.x - node.width,
    "linkJoinY": node => node.y,
    "linkX": node => node.x,
    "linkY": node => node.y,
    "linkParentX": node => node.parent.x - node.parent.width,
    "linkParentY": node => node.parent.y,
    "buttonX": node => 0,
    "buttonY": node => node.height / 2,
    "linkCompactXStart": node => node.x - node.width / 2,
    "linkCompactYStart": node => node.y + (node.compactEven ? node.height / 2 : -node.height / 2),
    "compactLinkMidX": (node, state) => node.firstCompactNode.x,
    "compactLinkMidY": (node, state) => node.firstCompactNode.y + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4,
    "centerTransform": ({ root, rootMargin, centerY, scale, centerX, chartWidth }) => `translate(${chartWidth - rootMargin},${centerY}) scale(${scale})`,
    "nodeFlexSize": ({ height, width, siblingsMargin, childrenMargin, state, node }) => {
      if (state.compact && node.flexCompactDim) {
        const result = [node.flexCompactDim[0], node.flexCompactDim[1]]
        return result;
      };
      return [height + siblingsMargin, width + childrenMargin]
    },
    "compactDimension": {
      sizeColumn: node => node.height,
      sizeRow: node => node.width,
      reverse: arr => arr.slice().reverse()
    },
    "zoomTransform": ({ centerY, scale }) => `translate(${0},${centerY}) scale(${scale})`,
    "swap": d => { const x = d.x; d.x = -d.y; d.y = x; },
    "nodeUpdateTransform": ({ x, y, width, height }) => `translate(${x - width},${y - height / 2})`,
  }
};

export const LAYOUT_TYPES = {
  TOP: "top",
  BOTTOM: "bottom",
  LEFT: "left",
  RIGHT: "right"
};

export const NODE_STATES = {
  EXPANDED: "_expanded",
  CENTERED: "_centered",
  HIGHLIGHTED: "_highlighted",
  UP_TO_ROOT_HIGHLIGHTED: "_upToTheRootHighlighted"
};