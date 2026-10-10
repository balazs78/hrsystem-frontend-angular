import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./src/test-setup.ts', 'vitest-canvas-mock'],
    sequence: {
      setupFiles: 'list' // 👈 Forces sequential, clean initialization of global frameworks
    },
    // Sets length threshold for actual and expected values in assertion errors
    chaiConfig: {
      truncateThreshold: 100, // Adjust this number (characters) to your preference
    },
  },
});