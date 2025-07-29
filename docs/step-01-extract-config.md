# Step 1: Extract Configuration and Constants

## Objective
Extract all configuration properties and constants from the monolithic OrgChart class into dedicated modules.

## Files to Create

### `src/utils/Constants.js`
```javascript
// Default configuration constants
export const DEFAULT_CONFIG = {
  svgWidth: 800,
  svgHeight: window.innerHeight - 100,
  container: "body",
  defaultFont: "Helvetica",
  rootMargin: 40,
  nodeWidth: 250,
  nodeHeight: 150,
  neighbourMargin: 80,
  siblingsMargin: 20,
  childrenMargin: 60,
  compactMarginPair: 100,
  compactMarginBetween: 20,
  nodeButtonWidth: 40,
  nodeButtonHeight: 40,
  nodeButtonX: -20,
  nodeButtonY: -20,
  linkYOffset: 30,
  pagingStep: 5,
  minPagingVisibleNodes: 2000,
  scaleExtent: [0.001, 20],
  duration: 400,
  imageName: 'Chart',
  setActiveNodeCentered: true,
  layout: "top",
  compact: true
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
```

### `src/core/ChartState.js`
```javascript
import { DEFAULT_CONFIG } from '../utils/Constants.js';

export class ChartState {
  constructor(initialConfig = {}) {
    this.attrs = { ...DEFAULT_CONFIG, ...initialConfig };
    this.setupGettersSetters();
  }

  setupGettersSetters() {
    Object.keys(this.attrs).forEach((key) => {
      this[key] = (value) => {
        if (!arguments.length) return this.attrs[key];
        this.attrs[key] = value;
        return this;
      };
    });
  }

  getState() {
    return this.attrs;
  }

  updateState(updates) {
    Object.assign(this.attrs, updates);
    return this;
  }
}
```

## Current Code to Extract

From the main OrgChart class, extract these configuration properties:
- Lines 58-101: All configuration properties in the attrs object
- Lines 234-237: Getter/setter pattern implementation

## Implementation Steps

1. **Create Constants Module**
   - Create `src/utils/Constants.js`
   - Move all default configuration values
   - Add layout types and node state constants

2. **Create ChartState Module**
   - Create `src/core/ChartState.js`
   - Implement state management with getter/setter pattern
   - Add state update methods

3. **Update Main Class**
   - Import ChartState in OrgChart class
   - Replace attrs object initialization with ChartState instance
   - Update all property access to use state methods

4. **Update Tests**
   - Ensure all existing tests still pass
   - Add tests for ChartState module

## Validation Criteria

- [ ] All configuration properties are accessible via getter/setter methods
- [ ] Existing functionality remains unchanged
- [ ] Tests pass without modification
- [ ] No breaking changes to public API

## Files Modified
- `src/d3-org-chart.js` (remove configuration, add imports)
- New: `src/utils/Constants.js`
- New: `src/core/ChartState.js`

## Next Step
After completion, proceed to Step 2: Extract Utility Functions