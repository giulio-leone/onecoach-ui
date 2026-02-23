import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  splitting: true,
  treeshake: true,
  clean: true,
  external: [/^@giulio-leone\//, 'react', 'react-dom', 'next', 'framer-motion', /^@radix-ui\//, /^lucide-/, 'zustand', 'class-variance-authority', 'clsx', 'tailwind-merge', /^recharts/, /^@tanstack\//, /^@phosphor-icons\//, /^@ai-sdk\//, /^ai\//, 'next-intl', /^@prisma\//, /^date-fns/, 'sonner', /^app\//, /^hooks\//],
});
