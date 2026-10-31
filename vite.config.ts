import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { assetFileName, cssDelivery } from './vite/css-delivery'

export default defineConfig({
  plugins: [vue(), cssDelivery()],
  // Playwright specs (e2e/) run under `npm run test:e2e`, not vitest.
  test: { exclude: ['e2e/**', 'node_modules/**', 'gallery-dist/**'] },
  // No public dir: the legal documents live in /legal as source files for consuming apps to copy; they
  // are not part of the package (the kopimi PDF alone is 11.6 MB).
  publicDir: false,
  build: {
    emptyOutDir: false,
    // One CSS file per component (the plugin names and imports them) rather than one for the whole library.
    cssCodeSplit: true,
    lib: {
      // `index` is the barrel; `reset` exists only so Vite builds src/styles/reset.css as its own file.
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        'styles/reset': resolve(import.meta.dirname, 'src/styles/reset.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      // Don't bundle Vue (a peer dependency) or web-utils (a dependency): consumers resolve both
      external: ['vue', '@meddleware/web-utils'],
      output: {
        // One module per source file, so a bundler keeps only the components (and their CSS) a consumer imports.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: (asset) => assetFileName(asset.names?.[0] ?? ''),
      },
    },
  },
})
