import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          include: ['./__tests__/*.test.ts'],
          exclude: [...defaultExclude, './__tests__/publish.test.ts'],
          name: 'integration',
        },
      },
      {
        test: {
          include: ['__tests__/publish.test.ts'],
          name: 'publish',
        },
      },
      {
        test: {
          include: ['./src/lib/__tests__/*.test.ts'],
          name: 'unit',
        },
      },
    ],
  },
});
