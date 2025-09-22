# Contributing Guide

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

## Code Style

- Use ES6 modules
- Follow existing naming conventions
- Add JSDoc comments for public methods
- Write tests for new functionality

## Adding New Features

### New Module
1. Create module in appropriate directory
2. Add unit tests
3. Update integration tests
4. Document in API docs

### New Layout
1. Add layout bindings in `LayoutBindings.js`
2. Add tests for layout calculations
3. Update documentation

### New Export Format
1. Create exporter class
2. Add to `ExportManager`
3. Add tests and documentation

## Testing

- Unit tests: Test individual modules
- Integration tests: Test module interactions
- E2E tests: Test complete workflows
- Performance tests: Test with large datasets

## Pull Request Process

1. Create feature branch
2. Write tests
3. Update documentation
4. Ensure all tests pass
5. Submit pull request