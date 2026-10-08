// A real-browser component gallery: every component in representative states, loaded with the design
// tokens and the seasons. Playwright + axe (e2e/contrast.spec.ts) drive it across theme × season, which
// is what jsdom cannot do (it has no layout and no computed colours, so axe's colour-contrast rule never
// runs there). Not published: `files` ships `dist/` only.
import { createApp } from 'vue'
import '@meddleware/design-tokens/tokens.css'
import '@meddleware/design-tokens/seasons.css'
import '../src/styles/base.css'
import ComponentGallery from './ComponentGallery.vue'

const params = new URLSearchParams(location.search)
const root = document.documentElement
root.setAttribute('data-theme', params.get('theme') === 'dark' ? 'dark' : 'light')
const season = params.get('season')
if (season) root.setAttribute('data-season', season)
// Static fixtures: a status snapshot the widget fetches, so its settled (not "checking") state is audited.
window.fetch = (async () =>
  new Response(
    JSON.stringify({ generated_at: '2026-10-08T00:00:00Z', overall: 'degraded', groups: [] }),
    { headers: { 'Content-Type': 'application/json' } },
  )) as typeof fetch

createApp(ComponentGallery, { view: params.get('view') ?? 'all' }).mount('#app')
