import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    threads: false,
    coverage: {
      reporter: ['text', 'html'],
    },
    typecheck: {
      tsconfig: './tsconfig.vitest.json',
    },
  },
});
