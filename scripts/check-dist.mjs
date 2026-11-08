#!/usr/bin/env node
// Delivery contract for the built package (run after `npm run build`; also a CI step). The point of the build plugin is that a consumer who
// imports one component gets that component's CSS and nothing else, so this asserts it on the output rather than trusting the plugin:
//   • every component module that has styles imports exactly its own stylesheet (`import "./UiButton.css"`);
//   • stylesheets carry component names, never Vite's hashed `…_scoped_…_lang.css` names, and none is orphaned;
//   • every stylesheet declares the layer order and puts its rules in a layer (reset: mw.reset; components: mw.components);
//   • `reset.css` (global) and `base.css` (reset + every component) exist, and the barrel imports no CSS (the reset is opt-in);
//   • the brand files (`brand/favicon.svg` …) are in the package;
//   • `theme-init.js` is a plain script, not a module; no entry stubs or hashed files were left behind.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(import.meta.dirname, '..', 'dist')
const errors = []
const fail = (m) => errors.push(m)
const read = (f) => readFileSync(join(dist, f), 'utf8')
const list = (d) => (existsSync(join(dist, d)) ? readdirSync(join(dist, d)) : [])

const css = list('components').filter((f) => f.endsWith('.css'))
if (css.length < 30) fail(`only ${css.length} component stylesheets (expected one per styled component)`)
for (const f of css) {
  const name = f.replace(/\.css$/, '')
  if (/_lang|_scoped|\.vue_vue/.test(f)) fail(`components/${f}: a hashed Vite name, not the component's`)
  const js = `components/${name}.js`
  if (!existsSync(join(dist, js))) fail(`components/${f}: no module ${js} to import it`)
  else if (!read(js).includes(`import "./${f}";`)) fail(`${js} does not import ./${f}, so its styles would not arrive with it`)
  const text = read(`components/${f}`)
  if (!/@layer mw\.reset/.test(text) || !/@layer mw\.components\s*\{/.test(text)) fail(`components/${f}: missing the layer order or the mw.components layer`)
}
for (const f of list('components').filter((x) => x.endsWith('.js') && !x.includes('.vue_vue_type_'))) {
  const imports = [...read(`components/${f}`).matchAll(/import "\.\/([^"]+\.css)";/g)].map((m) => m[1])
  if (imports.length > 1 || (imports.length === 1 && imports[0] !== f.replace(/\.js$/, '.css'))) fail(`components/${f} imports ${imports.join(', ')}: only its own stylesheet is allowed`)
}

for (const f of ['reset.css', 'base.css', 'theme-init.js', 'index.js', 'index.d.ts', 'brand/favicon.svg', 'brand/favicon.ico', 'brand/apple-touch-icon.png', 'brand/icon-192.png', 'brand/icon-512.png']) if (!existsSync(join(dist, f))) fail(`${f} is missing`)
if (existsSync(join(dist, 'reset.css')) && !/@layer mw\.reset\s*\{/.test(read('reset.css'))) fail('reset.css: rules are not in the mw.reset layer')
if (existsSync(join(dist, 'base.css'))) {
  const base = read('base.css')
  if (!base.startsWith('@layer mw.reset, mw.components;')) fail('base.css must start with the layer order')
  for (const f of css) {
    const cls = read(`components/${f}`).match(/\.(mw-[a-z0-9_-]+|ui-[a-z0-9_-]+|sidebar-[a-z0-9_-]+|status-[a-z0-9_-]+|ca-[a-z]+|el-[a-z]+)/)?.[0]
    if (cls && !base.includes(cls)) fail(`base.css lacks ${cls} from components/${f}`)
  }
}
if (existsSync(join(dist, 'index.js')) && /import "\.\/[^"]*\.css"/.test(read('index.js'))) fail('index.js imports CSS: the reset must be opt-in, and each component brings its own')
if (existsSync(join(dist, 'theme-init.js'))) {
  const t = read('theme-init.js')
  if (/^\s*(import|export)\s/m.test(t)) fail('theme-init.js must be a plain script, not a module')
  if (!t.includes('mw-color-mode')) fail('theme-init.js does not read the colour-mode storage key')
}
for (const stray of ['styles/reset.js', 'ui.js']) if (existsSync(join(dist, stray))) fail(`${stray} should not be in the package`)
const hashed = [...list('.'), ...list('components'), ...list('composables')].filter((f) => /[._-][0-9a-f]{8}[._-]/.test(f) && !f.endsWith('.d.ts'))
if (hashed.length) fail(`hashed files in dist: ${hashed.join(', ')}`)

if (errors.length) {
  console.error(`✗ ${errors.length} delivery problem(s):`)
  for (const e of errors) console.error('  ' + e)
  process.exit(1)
}
console.log(`✓ dist delivery check passed (${css.length} component stylesheets, reset.css, base.css, theme-init.js)`)
