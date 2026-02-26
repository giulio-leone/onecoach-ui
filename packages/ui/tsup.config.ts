import { defineConfig } from 'tsup';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// All UI entries are client components — inject 'use client' directive
// into entry files and chunks after build (tsup banner doesn't work with splitting)
async function injectUseClientDirective() {
  const distDir = join(import.meta.dirname, 'dist');
  const files = await readdir(distDir);
  const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.cjs'));

  await Promise.all(
    jsFiles.map(async (file) => {
      const filePath = join(distDir, file);
      const content = await readFile(filePath, 'utf-8');
      if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) {
        await writeFile(filePath, `"use client";\n${content}`);
      }
    })
  );
  console.log(`✅ Injected "use client" into ${jsFiles.length} dist files`);
}

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'index.web': 'src/index.web.ts',
    components: 'src/components/index.ts',
    memory: 'src/components/memory/index.ts',
    'visual-builder': 'src/visual-builder/index.ts',
    copilot: 'src/copilot/index.ts',
    features: 'src/features/index.ts',
    agenda: 'src/agenda/index.ts',
    analytics: 'src/analytics/index.ts',
    marketplace: 'src/marketplace/index.ts',
    layout: 'src/layout/index.ts',
    'layout/navigation': 'src/layout/navigation.ts',
    'layout/routing': 'src/layout/routing.ts',
    messages: 'src/messages/index.ts',
    auth: 'src/auth/index.ts',
    pricing: 'src/pricing/index.ts',
    core: 'src/core/index.ts',
    agent: 'src/agent/index.ts',
    coach: 'src/coach/index.ts',
    nutrition: 'src/nutrition/index.ts',
    workout: 'src/workout/index.ts',
    'workout/live': 'src/workout/live/index.ts',
    ai: 'src/ai/index.ts',
    flight: 'src/flight/index.ts',
    dashboard: 'src/dashboard/index.ts',
    admin: 'src/admin/index.ts',
    // Shared entries
    'drawer.shared': 'src/drawer.shared.ts',
    'tab-button.shared': 'src/tab-button.shared.ts',
    'date-picker-with-presets.shared': 'src/date-picker-with-presets.shared.ts',
    'date-picker.shared': 'src/date-picker.shared.ts',
    'button.shared': 'src/button.shared.ts',
    'loading-indicator': 'src/loading-indicator.tsx',
  },
  format: ['esm', 'cjs'],
  dts: false,
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
    /^expo-/,
    'tailwindcss',
    '@prisma/client', /^\.prisma\//,
    /^@\//, // App-level imports (Next.js alias)
  ],
  // Prefer .web.tsx/.web.ts variants for web build (React Native convention)
  esbuildOptions(options) {
    options.resolveExtensions = ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'];
  },
  async onSuccess() {
    await injectUseClientDirective();
  },
});
