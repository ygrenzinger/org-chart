# Agent Guidelines for d3-org-chart

## Build/Test Commands
- `npm test` - Run all unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run build` - Build the project with Vite
- `npm run dev` - Start development server

## Code Style Guidelines
- Use ES6 modules with named imports from d3 submodules
- Class-based architecture with method chaining pattern
- Use arrow functions for callbacks and short functions
- Camel case for variables and methods (e.g., `nodeWidth`, `svgHeight`)
- Use `const` for immutable values, avoid `var`
- No semicolons required (project follows ASI)
- Use template literals for string interpolation
- Destructuring for object properties when appropriate

## Testing
- Use Vitest for unit tests with jsdom environment
- Test files use `.test.js` extension in `/test` directory
- Import test utilities: `describe`, `test`, `expect`, `beforeEach`
- Maintain 80%+ branch coverage, 90%+ function/line coverage
- Use descriptive test names and group related tests with `describe`