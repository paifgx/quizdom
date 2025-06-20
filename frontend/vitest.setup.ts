// global vitest setup file to make import.meta.env.DEV writable so tests can redefine it

// Ensure import.meta.env exists and is configurable
Object.defineProperty(import.meta, 'env', {
  value: { DEV: false },
  writable: true,
  configurable: true,
});
