import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Keep the retained node:test regressions and Playwright specs separate.
    include: ['{apps,packages,tests}/**/*.vitest.test.{ts,mjs}'],
    environment: 'node',
    allowOnly: false,
    passWithNoTests: false,
    retry: 0,
    testTimeout: 10000,
  },
});
