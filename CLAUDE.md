# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a D3.js-based organization chart library that provides highly customizable hierarchical data visualization. The main component is a single `OrgChart` class in `src/d3-org-chart.js` that handles rendering, data management, and user interactions.

## Development Commands

### Testing
- `npm test` - Run all unit tests using Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with UI interface
- `npm run test:e2e` - Run end-to-end tests using Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:debug` - Debug E2E tests
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run test:e2e:report` - Show E2E test report

### Building
- `npm run build` - Build the library using Vite (creates minified version)
- `npm run dev` - Start development server
- `npm run preview` - Preview built application

### Test Coverage Requirements
The project has strict coverage thresholds set in `vitest.config.js`:
- Branches: 80%
- Functions: 90%
- Lines: 90%
- Statements: 90%

## Architecture

### Core Structure
- **Single Class Design**: The entire library is built around one main `OrgChart` class
- **Configuration Object**: All settings are stored in an `attrs` object with getter/setter methods
- **Method Chaining**: Most methods return the chart instance to enable fluent API usage
- **D3.js Integration**: Uses D3 modules for DOM manipulation, hierarchy, zoom, and layout

### Key Components
- **Data Processing**: Uses D3's `stratify()` to convert flat data into hierarchical structure
- **Layout Engine**: Supports multiple layouts (top, bottom, left, right) with compact mode
- **Zoom & Pan**: Built-in zoom behavior with configurable scale extents
- **Node Rendering**: Customizable HTML content generation for each node
- **Export Functionality**: PNG and SVG export capabilities

### State Management
- **Node States**: Each node can be expanded/collapsed, highlighted, centered
- **Hierarchical Operations**: Support for expand/collapse all, node addition/removal
- **Event Callbacks**: Configurable callbacks for node clicks, expand/collapse events

### Test Structure
Tests are organized by functionality in the `test/` directory:
- Unit tests cover individual methods and features
- Integration tests verify complete workflows
- E2E tests validate browser behavior using Playwright
- Test specifications are documented in `TEST_SPECIFICATIONS.md`

## Key Files
- `src/d3-org-chart.js` - Main library implementation (single class)
- `test/` - Unit test files organized by functionality
- `e2e/` - End-to-end tests
- `sandbox/` - Development examples and testing
- `docs/API_DOCUMENTATION.md` - Complete API reference
- `TEST_SPECIFICATIONS.md` - Detailed test requirements

## Development Patterns
- All configuration properties follow getter/setter pattern
- Methods are chainable for fluent API usage
- HTML content generation is highly customizable via callback functions
- Error handling includes console logging for debugging
- Performance considerations for large datasets with paging support