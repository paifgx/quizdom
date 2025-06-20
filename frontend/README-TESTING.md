# Testing Setup for Frontend

This document describes the testing setup for the QuizDom frontend application.

## Overview

The frontend uses **Vitest** as the testing framework, which is optimized for Vite-based projects. We also use **React Testing Library** for component testing.

## Installed Dependencies

### Testing Framework

- `vitest` - Fast unit test framework built for Vite
- `@testing-library/react` - Simple and complete testing utilities for React components
- `@testing-library/jest-dom` - Custom Jest matchers for DOM testing
- `@testing-library/user-event` - Fire events the same way the user does
- `jsdom` - DOM implementation for Node.js (used as test environment)

## Configuration Files

### `vitest.config.ts`

Main configuration file for Vitest that:

- Sets up jsdom environment for browser simulation
- Configures global test utilities
- Sets up test file patterns and exclusions
- Configures coverage reporting

### `app/test/setup.ts`

Test setup file that:

- Extends expect with jest-dom matchers
- Configures automatic cleanup after each test
- Mocks browser APIs (matchMedia, IntersectionObserver, etc.)

## Available Scripts

```bash
# Run tests in watch mode (development)
pnpm test

# Run tests once (CI/production)
pnpm test:run

# Run tests with UI interface
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## Test File Structure

Test files should be placed alongside the source files they test:

```
app/
├── components/
│   ├── navigation/
│   │   ├── main-nav.tsx
│   │   └── main-nav.test.tsx
│   └── ...
├── utils/
│   ├── format.ts
│   ├── format.test.ts
│   └── ...
└── test/
    ├── setup.ts
    └── test-utils.tsx (planned)
```

## Testing Guidelines

### Unit Tests

- Test individual functions and components in isolation
- Mock external dependencies
- Focus on testing behavior, not implementation details
- Use descriptive test names that explain the expected behavior

### Example Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentName } from './component-name'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeDefined()
  })
})
```

### Mocking

- Mock external modules using `vi.mock()`
- Mock React Router hooks for component tests
- Mock authentication context for protected components

## Current Test Coverage

### Utility Functions

- ✅ `formatDisplayName` - Tests user name formatting logic
- ✅ `capitalize` - Tests string capitalization
- ✅ `formatDate` - Tests date formatting with German locale

### Components (Planned)

- 🔄 `MainNav` - Navigation component tests
- 🔄 `ProtectedRoute` - Route protection tests
- 🔄 Quiz components tests

## Running Tests

1. **Development**: Use `pnpm test` to run tests in watch mode
2. **CI/CD**: Use `pnpm test:run` for single test runs
3. **Coverage**: Use `pnpm test:coverage` to generate coverage reports

## Troubleshooting

### Common Issues

1. **TypeScript errors**: Ensure `vitest/globals` is included in tsconfig.json types
2. **Component testing**: Mock React Router and authentication contexts
3. **CSS/Tailwind**: CSS is enabled in test environment via vitest config

### Tips

- Use `screen.debug()` to see rendered DOM during test development
- Use `vi.fn()` for creating mock functions
- Test user interactions with `@testing-library/user-event`

## Next Steps

1. Set up component testing utilities
2. Add integration tests for critical user flows
3. Set up visual regression testing
4. Configure automated test runs in CI/CD pipeline
