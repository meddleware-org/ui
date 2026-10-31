// Applies the saved (or default) colour mode and the season to <html> BEFORE first paint, so a page never flashes the wrong theme while
// the app's JavaScript loads. Load it as a plain, render-blocking script at the top of <head> (a same-origin file, so it needs no CSP
// hash or 'unsafe-inline'):
//   <script src="/theme-init.js" data-default="dark"></script>
// `data-default` is `light`, `dark` or `system` (default `system`) and only applies when the visitor has not chosen. It reads the same
// storage key as `useColorMode` and picks the season the way `useSeason` does (a test keeps all three in step). Never throws.
(function () {
  try {
    var root = document.documentElement
    var script = document.currentScript
    var fallback = (script && script.getAttribute('data-default')) || 'system'
    var stored = null
    try {
      stored = localStorage.getItem('mw-color-mode')
    } catch {
      /* storage blocked: use the default */
    }
    var mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : fallback
    var dark = mode === 'dark' || (mode === 'system' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
    root.setAttribute('data-theme', dark ? 'dark' : 'light')
    var month = new Date().getMonth()
    root.setAttribute('data-season', month >= 2 && month <= 4 ? 'spring' : month >= 5 && month <= 7 ? 'summer' : month >= 8 && month <= 10 ? 'autumn' : 'winter')
  } catch {
    /* leave the page on the tokens' defaults */
  }
})()
