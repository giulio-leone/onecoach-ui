import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    animations: 'src/animations.ts',
    'dark-mode-classes': 'src/dark-mode-classes.ts',
    tokens: 'src/tokens.ts',
    'tokens-complete': 'src/tokens-complete.ts',
  },
  format: ['esm', 'cjs'],
  dts: { tsconfig: './tsconfig.build.json' },
  splitting: true,
  treeshake: true,
  clean: true,
  external: ['react', 'react-native'],
});
