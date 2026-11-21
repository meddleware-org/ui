// PostCSS over the library's CSS (and the gallery's): autoprefixer for the browserslist in package.json, and the cascade layers.
//
// Cascade layers: the element reset is `@layer mw.reset` and every component's CSS is `@layer mw.components` (reset first). Layered
// CSS always loses to a consumer's UNLAYERED CSS, so an app overrides a component with an ordinary selector, never by out-specifying
// its internals. Every emitted file starts with the same `@layer mw.reset, mw.components;` statement so the order holds whichever
// file a bundler loads first.
import autoprefixer from 'autoprefixer'

/**
 * Which cascade layer a source file's CSS belongs in.
 * @param {string} [from] - the path of the CSS file being processed
 * @returns {string | null} `mw.components` for a component, `mw.reset` for the reset, else `null` (left unlayered)
 */
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
    // A file outside the two layered locations (the gallery's own CSS) is left as it is.
    if (!name) return
    // Wrap everything in the file in the layer, and put the order statement first.
    const nodes = root.nodes.slice()
    root.removeAll()
    const layer = new AtRule({ name: 'layer', params: name })
    layer.append(nodes)
    root.append(new AtRule({ name: 'layer', params: 'mw.reset, mw.components' }), layer)
  },
})
// Marks the function as a PostCSS plugin creator (the PostCSS 8 plugin API).
layers.postcss = true

// Autoprefixer first (it reads the browserslist in package.json), then the layers.
export default {
  plugins: [autoprefixer(), layers()],
}
