// Vite configuration for the component gallery (`npm run build:gallery`): a plain app build of gallery/, which the Playwright and axe sweeps load
// through `vite preview` (playwright.config.ts). Not part of the package.
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The gallery is its own Vite root; its output goes beside it (gallery-dist/, git-ignored) and is cleared on each build.
export default defineConfig({
  root: 'gallery',
  plugins: [vue()],
  build: { outDir: '../gallery-dist', emptyOutDir: true },
})
