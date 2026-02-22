import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/layout/index.tsx'],
  format: ['esm', 'cjs'],
  dts: { tsconfig: 'tsconfig.build.json' },
  splitting: true,
  treeshake: true,
  clean: true,
  external: [
    /^@giulio-leone\//,
    'react', 'react-dom', 'next', 'next/link', 'next/navigation', 'next/image',
    'framer-motion', /^@radix-ui\//, /^lucide-/,
    'zustand', 'class-variance-authority', 'clsx', 'tailwind-merge',
    'recharts', 'ai', 'ai/react', /^@ai-sdk\//,
    'zod', 'sonner', 'vaul',
  ],
});
