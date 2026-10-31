// PostCSS over the library's CSS (and the gallery's): autoprefixer for the browserslist in package.json, and the cascade layers.
//
// Cascade layers: the element reset is `@layer mw.reset` and every component's CSS is `@layer mw.components` (reset first). Layered
// CSS always loses to a consumer's UNLAYERED CSS, so an app overrides a component with an ordinary selector, never by out-specifying
// its internals. Every emitted file starts with the same `@layer mw.reset, mw.components;` statement so the order holds whichever
// file a bundler loads first.
import autoprefixer from 'autoprefixer'

const layerFor = (from = '') => {
  if (/[\\/]src[\\/]components[\\/]/.test(from)) return 'mw.components'
  if (/[\\/]src[\\/]styles[\\/]reset\.css/.test(from)) return 'mw.reset'
  return null
}

/** @type {import('postcss').PluginCreator<void>} */
const layers = () => ({
  postcssPlugin: 'mw-layers',
  Once(root, { AtRule, result }) {
    const name = layerFor(result.opts.from)
    if (!name) return
    const nodes = root.nodes.slice()
    root.removeAll()
    const layer = new AtRule({ name: 'layer', params: name })
    layer.append(nodes)
    root.append(new AtRule({ name: 'layer', params: 'mw.reset, mw.components' }), layer)
  },
})
layers.postcss = true

export default {
  plugins: [autoprefixer(), layers()],
}
