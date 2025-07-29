# Step 2: Extract Utility Functions

## Objective
Extract utility functions and helper methods from the monolithic OrgChart class into dedicated utility modules.

## Files to Create

### `src/utils/DOMUtils.js`
```javascript
import * as d3 from 'd3';

export class DOMUtils {
  static patternify(container, selector, elementTag, data) {
    const selection = container.selectAll("." + selector).data(data, (d, i) => {
      if (typeof d === "object") {
        if (d.nodeId) return d.nodeId;
        if (d.id) return d.id;
      }
      return i;
    });
    
    selection.exit().remove();
    const merged = selection.enter().append(elementTag).merge(selection);
    merged.attr("class", selector);
    return merged;
  }

  static restyleForeignObjectElements(container, attrs) {
    container
      .selectAll(".node-foreign-object")
      .attr("width", ({ width }) => width)
      .attr("height", ({ height }) => height)
      .attr("x", ({ width }) => 0)
      .attr("y", ({ height }) => 0);

    container
      .selectAll(".node-foreign-object-div")
      .style("width", ({ width }) => `${width}px`)
      .style("height", ({ height }) => `${height}px`)
      .html(function (d, i, arr) {
        if (d.data._pagingButton) {
          return `<div class="paging-button-wrapper"><div style="pointer-events:none">${attrs.pagingButton(d, i, arr, attrs)}</div></div>`;
        }
        return attrs.nodeContent.bind(this)(d, i, arr, attrs);
      });
  }

  static isEdge() {
    return window.navigator.userAgent.includes("Edge");
  }
}
```

### `src/utils/MathUtils.js`
```javascript
export class MathUtils {
  static getTextWidth(text, { ctx, fontSize = 10, defaultFont = "Arial" }) {
    ctx.font = `${fontSize}px ${defaultFont}`;
    const measurement = ctx.measureText(text);
    return measurement.width;
  }

  static groupBy(array, accessor, aggregator) {
    const grouped = {};
    
    array.forEach(item => {
      const key = accessor(item);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    Object.keys(grouped).forEach(key => {
      grouped[key] = aggregator(grouped[key]);
    });

    return Object.entries(grouped);
  }

  static calculateBounds(nodes, layoutBindings, layout) {
    const minX = d3.min(nodes, d => d.x + layoutBindings[layout].nodeLeftX(d));
    const maxX = d3.max(nodes, d => d.x + layoutBindings[layout].nodeRightX(d));
    const minY = d3.min(nodes, d => d.y + layoutBindings[layout].nodeTopY(d));
    const maxY = d3.max(nodes, d => d.y + layoutBindings[layout].nodeBottomY(d));
    
    return { minX, maxX, minY, maxY };
  }
}
```

### `src/utils/ExportUtils.js`
```javascript
export class ExportUtils {
  static toDataURL(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  static saveAs(uri, filename) {
    const link = document.createElement('a');
    if (typeof link.download === 'string') {
      link.href = uri;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      location.replace(uri);
    }
  }

  static serializeString(svg) {
    const xmlns = "http://www.w3.org/2000/xmlns/";
    const xlinkns = "http://www.w3.org/1999/xlink";
    const svgns = "http://www.w3.org/2000/svg";
    
    svg = svg.cloneNode(true);
    const fragment = window.location.href + "#";
    const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT, null, false);
    
    while (walker.nextNode()) {
      for (const attr of walker.currentNode.attributes) {
        if (attr.value.includes(fragment)) {
          attr.value = attr.value.replace(fragment, '#');
        }
      }
    }
    
    svg.setAttributeNS(xmlns, 'xmlns', svgns);
    svg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns);
    
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  }
}
```

## Current Code to Extract

From the main OrgChart class, extract these utility functions:
- Lines 239-247: `initializeEnterExitUpdatePattern` method
- Lines 392-403: `groupBy` method
- Lines 720-722: `isEdge` method
- Lines 982-994: `toDataURL` method
- Lines 1047-1062: `serializeString` method
- Lines 1036-1046: `saveAs` function
- Lines 1099-1103: `getTextWidth` method
- Lines 733-747: `restyleForeignObjectElements` method

## Implementation Steps

1. **Create DOMUtils Module**
   - Create `src/utils/DOMUtils.js`
   - Move DOM manipulation utilities
   - Include patternify logic and foreign object styling

2. **Create MathUtils Module**
   - Create `src/utils/MathUtils.js`
   - Move mathematical calculations
   - Include text measurement and grouping functions

3. **Create ExportUtils Module**
   - Create `src/utils/ExportUtils.js`
   - Move export-related utility functions
   - Include serialization and file saving utilities

4. **Update Main Class**
   - Import utility modules in OrgChart class
   - Replace direct method calls with utility class calls
   - Remove extracted methods from main class

5. **Update Tests**
   - Create unit tests for utility modules
   - Ensure existing functionality tests still pass

## Validation Criteria

- [ ] All utility functions work as static methods
- [ ] No functionality is lost in the extraction
- [ ] Tests pass without modification
- [ ] Utility modules can be tested independently

## Files Modified
- `src/d3-org-chart.js` (remove utility methods, add imports)
- New: `src/utils/DOMUtils.js`
- New: `src/utils/MathUtils.js`
- New: `src/utils/ExportUtils.js`

## Next Step
After completion, proceed to Step 3: Extract Data Processing Logic