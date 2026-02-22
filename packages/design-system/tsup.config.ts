import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  splitting: true,
  treeshake: true,
  clean: true,
  external: [/^@giulio-leone\//, 'react', 'react-dom', 'react-native', 'tailwindcss'],
});
