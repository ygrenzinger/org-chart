# OpenCode.md

## Build Commands
- `npm run build`: Builds the project using Vite.

## Lint Commands
- No specific lint command found. Consider adding a lint script in `package.json`.

## Test Commands
- `npm test`: Runs all unit tests with Vitest.
- `npm run test:watch`: Runs unit tests in watch mode.
- `npm run test:coverage`: Runs unit tests with coverage reporting.
- `npm run test:ui`: Starts the Vitest UI.
- `npm run test:e2e`: Executes end-to-end tests with Playwright.
- Run a single test (via Vitest): Use the `-t` option with a test's name, e.g., `vitest -t "test name here"`.

## Code Style Guidelines
### Imports
- Follow ES module syntax.
- Group imports: external libraries first, followed by internal modules.

### Formatting
- Use Prettier-compatible formatting.
- Indent with 2 spaces.

### Types
- Prefer TypeScript for type safety where available.
- Use explicit types for function arguments and return values.

### Naming Conventions
- Use camelCase for variables and functions.
- Use PascalCase for classes and React components.
- Use CONSTANT_CASE for constants.

### Error Handling
- Use `try/catch` blocks for async/await logic.
- Ensure proper error messages for debugging.

### Test Writing
- Use Vitest for unit tests and Playwright for end-to-end tests.
- Mock external dependencies where needed.

### Miscellaneous
- Avoid code in `build/` directory; this is generated during the build process.
- Use Vite for modern build configurations.