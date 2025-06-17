# Testing Structure

This directory contains all tests for the frontend application, organized by test type to support different testing strategies and levels.

## Directory Structure

```
tests/
├── unit/          # Unit tests - isolated component/function testing
├── integration/   # Integration tests - testing component interactions
├── e2e/          # End-to-end tests - full user journey testing
└── README.md     # This file
```

## Test Types

### Unit Tests (`unit/`)
- **Purpose**: Test individual components, functions, or modules in isolation
- **Scope**: Single component or utility function
- **Mocking**: Heavy use of mocks for dependencies
- **Speed**: Fast execution (< 100ms per test)
- **Examples**: Component rendering, utility functions, hooks

### Integration Tests (`integration/`)
- **Purpose**: Test how multiple components work together
- **Scope**: Multiple components or modules interacting
- **Mocking**: Minimal mocking, real implementations where possible
- **Speed**: Medium execution (100ms - 1s per test)
- **Examples**: Form submission flows, API integration, context providers

### End-to-End Tests (`e2e/`)
- **Purpose**: Test complete user workflows in a real browser environment using Playwright
- **Scope**: Full application features from user perspective
- **Mocking**: No mocking of frontend code, may mock external APIs
- **Speed**: Slower execution (1s+ per test)
- **Examples**: Login flow, quiz completion, navigation between pages
- **Framework**: Playwright (cross-browser testing with Chrome, Firefox, Safari)

## Running Tests

```bash
# Run all unit and integration tests (Vitest)
pnpm test

# Run specific test types
pnpm test:unit
pnpm test:integration

# Run e2e tests (Playwright)
pnpm test:e2e
pnpm test:e2e:ui          # Run with Playwright UI
pnpm test:e2e:debug       # Run in debug mode
pnpm test:e2e:headed      # Run with browser visible

# Run tests in watch mode (unit/integration only)
pnpm test:watch
pnpm test:watch:unit
pnpm test:watch:integration

# Generate coverage report
pnpm test:coverage
```

## Best Practices

### Unit Tests
- Focus on public API of components/functions
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Mock external dependencies and API calls
- Test both happy path and error scenarios

### Integration Tests
- Test realistic user interactions
- Verify data flow between components
- Test form validation and submission
- Verify context providers work correctly with consumers

### E2E Tests (Playwright)
- Write from the user's perspective
- Focus on critical user journeys
- Keep tests independent and idempotent
- Use semantic locators (getByRole, getByText) and data-testid when needed
- Test across multiple browsers (Chrome, Firefox, Safari)
- Use Page Object Model for complex flows
- Verify the complete user experience
- Automatically start dev server before tests

## File Naming

- Use descriptive names: `component-name.test.tsx`
- Match the component/module being tested
- Use `.test.` for standard tests
- Use `.spec.` for behavior specification tests (if needed)

## Migration from Co-located Tests

When moving tests from co-located (next to components) to this centralized structure:

1. **Unit tests**: Move to `tests/unit/`
2. **Integration tests**: Move to `tests/integration/`
3. **E2E tests**: Move to `tests/e2e/`

Update import paths to reflect the new location relative to the source code. 