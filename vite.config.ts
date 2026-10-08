import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Playwright specs (e2e/) run under `npm run test:e2e`, not vitest.
  test: { exclude: ['e2e/**', 'node_modules/**', 'gallery-dist/**'] },
  // No public dir: the legal documents live in /legal as source files for consuming apps to copy; they
  // are not part of the package (the kopimi PDF alone is 11.6 MB).
  publicDir: false,
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'MeddlewareUi',
      fileName: 'ui',
      formats: ['es'],
    },
    rollupOptions: {
      // Don't bundle Vue — consumers provide it as a peer dep
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        // Emit the base CSS alongside the JS bundle
        // The one stylesheet is base.css; any other emitted asset keeps a hashed name instead of
        // overwriting it.
        assetFileNames: (asset) => (asset.names?.some((n) => n.endsWith('.css')) ? 'base.css' : 'assets/[name]-[hash][extname]'),
      },
    },
  },
})
