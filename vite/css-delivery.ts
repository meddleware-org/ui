// Build plugin: delivers each component's CSS with the component, a global `reset.css`, and an aggregate `base.css`.
//
// Vite's library mode extracts component CSS but leaves only an `/* empty css */` marker where the component imported it, so a
// consumer that imports a component gets no styles. Together with `assetFileName` (used as `assetFileNames`) this
//   1. names each component's stylesheet after the component (`components/UiButton.css`, not `…_scoped_bc33cc23_lang.css`);
//   2. replaces the marker in `components/UiButton.js` with `import "./UiButton.css"`, so the CSS arrives with the component and
//      is tree-shaken with it (the package declares `*.css` as a side effect, and the import lives in the component's own module);
//   3. publishes `theme-init.js` (the pre-paint colour-mode and season script) verbatim as a plain script, not a module;
//   4. writes `reset.css` (element defaults and utilities, required once per app) and `base.css` (reset + every component: the old
//      single-file entry point, kept so existing imports still work).
// Rolldown does not allow renaming files through the `bundle` object, which is why the names are decided in `assetFileNames`.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

const STYLE = /^(.*\/)?([^/]+)\.vue_vue_type_style_index_\d+(?:_scoped_[0-9a-f]+)?_lang\.css$/
const ORDER = '@layer mw.reset, mw.components;'

/** The published file name for an emitted asset: component styles become `components/<Name>.css`, the reset `reset.css`. */
export function assetFileName(name: string): string {
  const style = STYLE.exec(name)
  if (style) return `${style[1] ?? ''}${style[2]}.css`
  if (name === 'styles/reset.css') return 'reset.css'
  return '[name][extname]'
}

export function cssDelivery(): Plugin {
  return {
    name: 'mw-css-delivery',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const sources = new Map<string, string>()
      for (const [file, item] of Object.entries(bundle)) {
        if (item.type === 'asset' && file.endsWith('.css')) sources.set(file, String(item.source))
      }

      // The reset entry exists only so Vite builds reset.css as its own file; its (empty) JS is not part of the package.
      delete bundle['styles/reset.js']

      for (const [file, item] of Object.entries(bundle)) {
        if (item.type !== 'chunk') continue
        const css = file.replace(/\.js$/, '.css')
        if (sources.has(css) && item.code.includes('/* empty css')) {
          const base = css.slice(css.lastIndexOf('/') + 1)
          item.code = item.code.replace(/\/\* empty css[^*]*\*\//, `import "./${base}";`)
        }
      }

      const strip = (css: string) => css.replace(ORDER, '').trim()
      const parts = [ORDER, strip(sources.get('reset.css') ?? '')]
      for (const [file, css] of [...sources].sort(([a], [b]) => a.localeCompare(b))) {
        if (file.startsWith('components/')) parts.push(strip(css))
      }
      this.emitFile({ type: 'asset', fileName: 'theme-init.js', source: readFileSync(join(import.meta.dirname, '../src/theme-init.js'), 'utf8') })
      // The brand files (favicon set), published as `@meddleware/ui/brand/*`.
      const brandDir = join(import.meta.dirname, '../src/brand/files')
      for (const name of readdirSync(brandDir)) this.emitFile({ type: 'asset', fileName: `brand/${name}`, source: readFileSync(join(brandDir, name)) })
      this.emitFile({ type: 'asset', fileName: 'base.css', source: parts.filter(Boolean).join('\n') + '\n' })
    },
  }
}
