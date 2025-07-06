# Testing Structure

This directory contains all tests for the frontend application, organized by test type to support different testing strategies and levels.

## Directory Structure

```
tests/
├── unit/          # Unit tests - isolated component/function testing
├── integration/   # Integration tests - testing component interactions
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

## Running Tests

```bash
# Run all unit and integration tests (Vitest)
pnpm test

# Run specific test types
pnpm test:unit
pnpm test:integration

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

## File Naming

- Use descriptive names: `component-name.test.tsx`
- Match the component/module being tested
- Use `.test.` for standard tests
- Use `.spec.` for behavior specification tests (if needed)

## Migration from Co-located Tests

When moving tests from co-located (next to components) to this centralized structure:

1. **Unit tests**: Move to `tests/unit/`
2. **Integration tests**: Move to `tests/integration/`

Update import paths to reflect the new location relative to the source code.
