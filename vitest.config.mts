import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
function tsconfigPaths(): import('vite').PluginOption {
  throw new Error('Function not implemented.');
}
