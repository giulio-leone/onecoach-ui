import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    components: 'src/components/index.ts',
    memory: 'src/components/memory/index.ts',
    'visual-builder': 'src/visual-builder/index.ts',
  },
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
    'react-markdown', 'react-syntax-highlighter',
    'react-native', 'react-native-web', 'expo-image', 'expo-linear-gradient',
    'tailwindcss',
  ],
});
