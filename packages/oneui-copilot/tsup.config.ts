import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { tsconfig: 'tsconfig.build.json' },
  splitting: true,
  treeshake: true,
  clean: true,
  external: [/^@giulio-leone\//, 'react', 'react-dom', 'next', 'framer-motion', /^@radix-ui\//, /^lucide-/, 'next-intl'],
});
