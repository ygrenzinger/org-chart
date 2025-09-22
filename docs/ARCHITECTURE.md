# Architecture Documentation

## Overview
The d3-org-chart library uses a modular architecture that separates concerns into focused, testable modules.

## Design Principles

### Single Responsibility
Each module has one clear purpose:
- **DataProcessor**: Data transformation only
- **NodeRenderer**: Node rendering only
- **ZoomManager**: Zoom/pan functionality only

### Dependency Injection
Modules receive their dependencies through constructors, making them testable and flexible.

### Event-Driven Communication
Modules communicate through events and callbacks rather than direct coupling.

### Immutable State
State changes go through the ChartState module to ensure consistency.

## Module Dependencies

```
OrgChart (Main Orchestrator)
├── ChartState (Configuration & State)
├── DataProcessor (Data Transformation)
├── NodeManager (Node Operations)
├── LayoutManager (Layout Coordination)
│   ├── LayoutBindings (Layout Configurations)
│   └── CompactLayout (Compact Calculations)
├── Renderer (Rendering Coordination)
│   ├── NodeRenderer (Node Rendering)
│   ├── LinkRenderer (Link Rendering)
│   └── ConnectionRenderer (Connection Rendering)
├── ZoomManager (Zoom & Pan)
├── NavigationManager (Tree Navigation)
├── EventManager (Event Handling)
├── FullscreenManager (Fullscreen Mode)
└── ExportManager (Export Functionality)
    ├── ImageExporter (Image Export)
    └── PrintManager (Print Functionality)
```

## Extension Points

### Custom Layouts
```javascript
// Add custom layout binding
const customLayout = {
  nodeLeftX: (node) => /* custom logic */,
  nodeRightX: (node) => /* custom logic */,
  // ... other bindings
};

chart.layoutBindings().custom = customLayout;
```

### Custom Renderers
```javascript
// Replace node renderer
chart.renderer.nodeRenderer = new CustomNodeRenderer(chart.state);
```

### Custom Export Formats
```javascript
// Add custom export format
chart.exportManager.addFormat('pdf', new PDFExporter());
```