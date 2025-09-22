# Migration Guide

## From Monolithic to Modular Architecture

The d3-org-chart library has been refactored to use a modular architecture. This guide helps you understand the changes and migrate if needed.

## What Changed

### Internal Structure
- Single file split into focused modules
- Better separation of concerns
- Improved testability and maintainability

### What Stayed the Same
- **Public API**: All existing methods work exactly the same
- **Method Chaining**: Fluent API is preserved
- **Configuration**: All options work as before
- **Backward Compatibility**: Existing code continues to work

## No Migration Required

If you're using the standard public API, no changes are needed:

```javascript
// This continues to work exactly as before
const chart = new OrgChart()
  .container('#chart')
  .data(data)
  .svgWidth(800)
  .render();
```

## Advanced Usage

If you want to leverage the new modular architecture:

```javascript
// Import individual modules
import { 
  OrgChart, 
  ExportManager, 
  LayoutManager 
} from 'd3-org-chart';

// Create custom implementations
const customExporter = new ExportManager(chartState);
```

## Benefits

- **Better Performance**: Potential for tree-shaking unused modules
- **Easier Testing**: Each module can be tested independently
- **Extensibility**: Easier to add new features or customize behavior
- **Maintainability**: Cleaner, more organized codebase