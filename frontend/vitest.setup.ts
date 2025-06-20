// global vitest setup file to make import.meta.env.DEV writable so tests can redefine it

// Ensure import.meta.env exists and is configurable
Object.defineProperty(import.meta, 'env', {
  value: { DEV: false },
  writable: true,
  configurable: true,
});

// Mock CSS imports to avoid parsing errors
import { vi } from 'vitest';

// Mock CSS files that cause parsing issues with @layer syntax
vi.mock('../app/app.css', () => ({}));
