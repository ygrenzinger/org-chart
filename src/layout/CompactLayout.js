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
        const compactChildren = node.children
          .filter(d => !d.children);

        if (compactChildren.length < 2) return;
        
        compactChildren.forEach((child, i) => {
          if (!i) child.firstCompact = true;
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
        const rowsMapNew = this.groupBy(
          compactChildren, 
          d => d.row, 
          reducedGroup => d3.max(reducedGroup, d => 
            attrs.layoutBindings[attrs.layout].compactDimension.sizeRow(d) + 
            attrs.compactMarginBetween(d)
          )
        );
        const rowSize = d3.sum(rowsMapNew.map(v => v[1]));

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
        });
        
        node.flexCompactDim = null;
      }
    });
  }

  calculateCompactFlexPositions(root) {
    const attrs = this.state.getState();
    
    root.eachBefore(node => {
      if (node.children) {
        const compactChildren = node.children.filter(d => d.flexCompactDim);
        const fch = compactChildren[0];
        if (!fch) return;
        
        compactChildren.forEach((child, i, arr) => {
          if (i === 0) fch.x -= fch.flexCompactDim[0] / 2;
          if (i && i % 2 - 1) {
            child.x = fch.x + fch.flexCompactDim[0] * 0.25 - attrs.compactMarginPair(child) / 4;
          } else if (i) {
            child.x = fch.x + fch.flexCompactDim[0] * 0.75 + attrs.compactMarginPair(child) / 4;
          }
        });

        const centerX = fch.x + fch.flexCompactDim[0] * 0.5;
        fch.x = fch.x + fch.flexCompactDim[0] * 0.25 - attrs.compactMarginPair(fch) / 4;
        const offsetX = node.x - centerX;
        if (Math.abs(offsetX) < 10) {
          compactChildren.forEach(d => d.x += offsetX);
        }

        const rowsMapNew = this.groupBy(
          compactChildren, 
          d => d.row, 
          reducedGroup => d3.max(reducedGroup, d => 
            attrs.layoutBindings[attrs.layout].compactDimension.sizeRow(d)
          )
        );
        const cumSum = d3.cumsum(rowsMapNew.map(d => d[1] + attrs.compactMarginBetween(d)));

        compactChildren.forEach((node, i) => {
          if (node.row) {
            node.y = fch.y + cumSum[node.row - 1];
          } else {
            node.y = fch.y;
          }
        });
      }
    });
  }

  // Helper method for grouping (extracted from main class)
  groupBy(array, keyGetter, valueGetter) {
    const map = new Map();
    array.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    
    return Array.from(map.entries()).map(([key, group]) => [key, valueGetter(group)]);
  }
}