// Global Vitest setup file.
// Setup testing-library dom matchers
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Ensure import.meta.env exists and is configurable
Object.defineProperty(import.meta, 'env', {
  value: { DEV: false },
  writable: true,
  configurable: true,
});

// Mock CSS imports to avoid parsing errors
vi.mock('../app/app.css', () => ({}));
