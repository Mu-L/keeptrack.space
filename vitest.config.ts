import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/polyfills.js', './test/vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'html', 'text'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'src/lib/external/**',
        'test/**',
        'dist/**',
        'src/engine/ootk/**',
        '**/*.test.ts',
        '**/*.test.js',
        '**/test.ts',
        '**/test.js',
        '**/*.stories.ts',
        '**/*.stories.js',
      ],
    },
    include: ['**/?(*.)+(spec|test).?(m)[jt]s?(x)'],
    exclude: [
      'node_modules/**',
      'offline/**',
      'dist/**',
      'src/admin/**',
      'src/engine/ootk/**',
    ],
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@ootk': path.resolve(__dirname, './src/engine/ootk'),
      '@public': path.resolve(__dirname, './public'),
      '@css': path.resolve(__dirname, './public/css'),
      '@test': path.resolve(__dirname, './test'),
    },
  },
});
