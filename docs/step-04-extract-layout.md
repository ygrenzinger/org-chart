# Step 4: Extract Layout Management

## Objective
Extract layout management, positioning calculations, and compact layout logic from the monolithic OrgChart class into dedicated layout modules.

## Files to Create

### `src/layout/LayoutBindings.js`
```javascript
export class LayoutBindings {
  constructor() {
    this.bindings = this.createLayoutBindings();
  }

  createLayoutBindings() {
    return {
      "top": {
        "nodeLeftX": (node) => -node.width / 2,
        "nodeRightX": (node) => node.width / 2,
        "nodeTopY": (node) => 0,
        "nodeBottomY": (node) => node.height,
        "nodeJoinX": ({ x, width }) => x + width / 2,
        "nodeJoinY": ({ y, height }) => y + height,
        "linkJoinX": ({ x, width }) => x + width / 2,
        "linkJoinY": ({ y }) => y,
        "linkX": (node) => node.x,
        "linkY": (node) => node.y,
        "linkParentX": (node) => node.parent.x,
        "linkParentY": (node) => node.parent.y,
        "buttonX": ({ width }) => width - 40,
        "buttonY": ({ height }) => height - 40,
        "centerTransform": ({ root, centerY, scale, centerX }) => 
          `translate(${centerX},${centerY}) scale(${scale})`,
        "nodeUpdateTransform": ({ x, y, width, height }) => 
          `translate(${x - width / 2},${y})`,
        "swap": (d) => { /* no swap needed for top layout */ },
        "nodeFlexSize": ({ width, height, siblingsMargin, childrenMargin }) => 
          [width + siblingsMargin, height + childrenMargin],
        "zoomTransform": ({ centerX, centerY, scale }) => 
          `translate(${centerX},${centerY}) scale(${scale})`,
        "diagonal": null, // Will be set by main class
        "compactDimension": {
          "sizeColumn": node => node.height,
          "sizeRow": node => node.width,
          "reverse": arr => arr.slice().reverse()
        },
        "linkCompactXStart": node => node.x + node.width / 2,
        "linkCompactYStart": node => node.y + node.height,
        "compactLinkMidX": (node, state) => node.firstCompactNode.x,
        "compactLinkMidY": (node, state) => 
          node.firstCompactNode.y + node.firstCompactNode.flexCompactDim[0] / 4 + 
          state.compactMarginPair(node) / 4
      },
      "bottom": {
        "nodeLeftX": (node) => -node.width / 2,
        "nodeRightX": (node) => node.width / 2,
        "nodeTopY": (node) => -node.height,
        "nodeBottomY": (node) => 0,
        "nodeJoinX": ({ x, width }) => x + width / 2,
        "nodeJoinY": ({ y }) => y,
        "linkJoinX": ({ x, width }) => x + width / 2,
        "linkJoinY": ({ y, height }) => y + height,
        "linkX": (node) => node.x,
        "linkY": (node) => node.y,
        "linkParentX": (node) => node.parent.x,
        "linkParentY": (node) => node.parent.y,
        "buttonX": ({ width }) => width - 40,
        "buttonY": () => -40,
        "centerTransform": ({ root, centerY, scale, centerX }) => 
          `translate(${centerX},${centerY}) scale(${scale})`,
        "nodeUpdateTransform": ({ x, y, width, height }) => 
          `translate(${x - width / 2},${y - height})`,
        "swap": (d) => { d.y = -d.y; },
        "nodeFlexSize": ({ width, height, siblingsMargin, childrenMargin }) => 
          [width + siblingsMargin, height + childrenMargin],
        "diagonal": null, // Will be set by main class
        "compactDimension": {
          "sizeColumn": node => node.height,
          "sizeRow": node => node.width,
          "reverse": arr => arr.slice().reverse()
        }
      },
      "left": {
        "nodeLeftX": (node) => 0,
        "nodeRightX": (node) => node.width,
        "nodeTopY": (node) => -node.height / 2,
        "nodeBottomY": (node) => node.height / 2,
        "nodeJoinX": ({ x, width }) => x + width,
        "nodeJoinY": ({ y, height }) => y + height / 2,
        "linkJoinX": ({ x }) => x,
        "linkJoinY": ({ y, height }) => y + height / 2,
        "linkX": (node) => node.x,
        "linkY": (node) => node.y,
        "linkParentX": (node) => node.parent.x,
        "linkParentY": (node) => node.parent.y,
        "buttonX": ({ width }) => width - 40,
        "buttonY": ({ height }) => height / 2 - 20,
        "centerTransform": ({ root, centerY, scale, centerX }) => 
          `translate(${centerX},${centerY}) scale(${scale})`,
        "nodeUpdateTransform": ({ x, y, width, height }) => 
          `translate(${x},${y - height / 2})`,
        "swap": (d) => { 
          const temp = d.x; 
          d.x = d.y; 
          d.y = temp; 
        },
        "nodeFlexSize": ({ width, height, siblingsMargin, childrenMargin }) => 
          [height + siblingsMargin, width + childrenMargin],
        "diagonal": null, // Will be set by main class
        "compactDimension": {
          "sizeColumn": node => node.width,
          "sizeRow": node => node.height,
          "reverse": arr => arr
        }
      },
      "right": {
        "nodeLeftX": (node) => -node.width,
        "nodeRightX": (node) => 0,
        "nodeTopY": (node) => -node.height / 2,
        "nodeBottomY": (node) => node.height / 2,
        "nodeJoinX": ({ x }) => x,
        "nodeJoinY": ({ y, height }) => y + height / 2,
        "linkJoinX": ({ x, width }) => x + width,
        "linkJoinY": ({ y, height }) => y + height / 2,
        "linkX": (node) => node.x,
        "linkY": (node) => node.y,
        "linkParentX": (node) => node.parent.x,
        "linkParentY": (node) => node.parent.y,
        "buttonX": () => -40,
        "buttonY": ({ height }) => height / 2 - 20,
        "centerTransform": ({ root, centerY, scale, centerX }) => 
          `translate(${centerX},${centerY}) scale(${scale})`,
        "nodeUpdateTransform": ({ x, y, width, height }) => 
          `translate(${x - width},${y - height / 2})`,
        "swap": (d) => { 
          const temp = d.x; 
          d.x = -d.y; 
          d.y = temp; 
        },
        "nodeFlexSize": ({ width, height, siblingsMargin, childrenMargin }) => 
          [height + siblingsMargin, width + childrenMargin],
        "diagonal": null, // Will be set by main class
        "compactDimension": {
          "sizeColumn": node => node.width,
          "sizeRow": node => node.height,
          "reverse": arr => arr
        },
        "linkCompactXStart": node => node.x - node.width / 2
      }
    };
  }

  getBinding(layout) {
    return this.bindings[layout];
  }

  setDiagonal(layout, diagonalFunction) {
    this.bindings[layout].diagonal = diagonalFunction;
  }
}
```

### `src/layout/CompactLayout.js`
```javascript
import * as d3 from 'd3';
import { MathUtils } from '../utils/MathUtils.js';

export class CompactLayout {
  constructor(layoutBindings, state) {
    this.layoutBindings = layoutBindings;
    this.state = state;
  }

  calculateCompactFlexDimensions(root) {
    const attrs = this.state.getState();
    
    root.eachBefore(node => {
      if (node.children) {
        const compactChildren = node.children.filter(d => !d.children);
        
        if (compactChildren.length > 0) {
          compactChildren.forEach((child, i) => {
            child.compactEven = i % 2 === 0;
            child.row = Math.floor(i / 2);
          });

          const evenMaxColumnDimension = d3.max(
            compactChildren.filter(d => d.compactEven), 
            attrs.layoutBindings[attrs.layout].compactDimension.sizeColumn
          );
          const oddMaxColumnDimension = d3.max(
            compactChildren.filter(d => !d.compactEven), 
            attrs.layoutBindings[attrs.layout].compactDimension.sizeColumn
          );
          
          const columnSize = Math.max(evenMaxColumnDimension, oddMaxColumnDimension) * 2;
          const rowsMapNew = MathUtils.groupBy(
            compactChildren, 
            d => d.row, 
            reducedGroup => d3.max(reducedGroup, d => 
              attrs.layoutBindings[attrs.layout].compactDimension.sizeRow(d) + 
              attrs.compactMarginBetween(d)
            )
          );
          const rowSize = d3.sum(rowsMapNew.map(v => v[1]));

          compactChildren.forEach(node => {
            node.flexCompactDim = [
              columnSize + attrs.compactMarginPair(node),
              rowSize - attrs.compactMarginBetween(node)
            ];
          });
        }
      }
    });
  }

  calculateCompactFlexPositions(root) {
    const attrs = this.state.getState();
    
    root.eachBefore(node => {
      if (node.children) {
        const compactChildren = node.children.filter(d => d.flexCompactDim);
        
        if (compactChildren.length > 0) {
          compactChildren.forEach((child, i, arr) => {
            const fch = arr[0];
            
            if (i && i % 2 - 1) {
              child.x = fch.x + fch.flexCompactDim[0] * 0.25 - attrs.compactMarginPair(child) / 4;
            } else if (i) {
              child.x = fch.x + fch.flexCompactDim[0] * 0.75 + attrs.compactMarginPair(child) / 4;
            }
          });

          const fch = compactChildren[0];
          fch.x = fch.x + fch.flexCompactDim[0] * 0.25 - attrs.compactMarginPair(fch) / 4;

          const offsetX = node.x - fch.x;
          if (Math.abs(offsetX) < 10) {
            compactChildren.forEach(d => d.x += offsetX);
          }

          const rowsMapNew = MathUtils.groupBy(
            compactChildren, 
            d => d.row, 
            reducedGroup => d3.max(reducedGroup, d => 
              attrs.layoutBindings[attrs.layout].compactDimension.sizeRow(d)
            )
          );
          const cumSum = d3.cumsum(rowsMapNew.map(d => d[1] + attrs.compactMarginBetween(d)));

          compactChildren
            .filter(d => d.row > 0)
            .forEach((node, i) => {
              node.y = node.parent.y + cumSum[node.row - 1];
            });
        }
      }
    });
  }
}
```

### `src/layout/LayoutManager.js`
```javascript
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
          width, height, siblingsMargin, childrenMargin
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
}
```

## Current Code to Extract

From the main OrgChart class, extract these layout-related methods:
- Lines 209-228: Layout bindings object
- Lines 404-423: `calculateCompactFlexDimensions` method
- Lines 424-442: `calculateCompactFlexPositions` method
- Lines 302-312: Flex tree layout initialization
- Layout-specific positioning and transformation logic

## Implementation Steps

1. **Create LayoutBindings Module**
   - Create `src/layout/LayoutBindings.js`
   - Move all layout-specific binding configurations
   - Include positioning and transformation functions

2. **Create CompactLayout Module**
   - Create `src/layout/CompactLayout.js`
   - Move compact layout calculation methods
   - Include dimension and position calculations

3. **Create LayoutManager Module**
   - Create `src/layout/LayoutManager.js`
   - Coordinate layout operations
   - Manage flex tree layout initialization

4. **Update Main Class**
   - Import layout modules in OrgChart class
   - Replace direct layout calls with manager methods
   - Remove extracted layout methods

5. **Update Tests**
   - Create unit tests for layout modules
   - Test different layout configurations
   - Ensure layout calculations remain accurate

## Validation Criteria

- [ ] All layout types (top, bottom, left, right) work correctly
- [ ] Compact layout calculations produce correct positions
- [ ] Node positioning and transformations are accurate
- [ ] Layout switching maintains functionality
- [ ] Tests pass without modification

## Files Modified
- `src/d3-org-chart.js` (remove layout methods, add imports)
- New: `src/layout/LayoutBindings.js`
- New: `src/layout/CompactLayout.js`
- New: `src/layout/LayoutManager.js`

## Next Step
After completion, proceed to Step 5: Extract Rendering Logic