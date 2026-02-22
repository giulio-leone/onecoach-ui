import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { tsconfig: 'tsconfig.build.json' },
  splitting: true,
  treeshake: true,
  clean: true,
  external: [
    /^@giulio-leone\//,
    'react', 'react-dom', /^next/,
    'framer-motion', /^@radix-ui\//, /^lucide-/,
    'zustand', 'class-variance-authority', 'clsx', 'tailwind-merge',
    'recharts', 'ai', /^ai\//, /^@ai-sdk\//,
    'zod', 'sonner', 'vaul', /^@dnd-kit\//,
    /^@tanstack\//, 'stripe', /^@stripe\//,
    'react-day-picker', 'date-fns', 'react-hook-form', '@hookform/resolvers',
    'cmdk', 'embla-carousel-react', /^react-resizable/,
    /^@hello-pangea\//, 'input-otp', 'react-dropzone',
    'next-intl',
  ],
});
