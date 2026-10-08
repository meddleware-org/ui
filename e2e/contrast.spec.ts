// The accessibility gate jsdom cannot be: a real browser computes the colours, so axe's `color-contrast`
// rule runs. Every theme × season (and the modal dialog) must have no WCAG 2.2 AA violation.
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const THEMES = ['light', 'dark'] as const
const SEASONS = [null, 'spring', 'summer', 'autumn', 'winter'] as const

for (const theme of THEMES) {
  for (const season of SEASONS) {
    const name = `${theme}${season ? ` · ${season}` : ''}`
    for (const view of ['all', 'panels', 'dialog']) {
      test(`${view} view has no axe violations (${name})`, async ({ page }) => {
        const q = new URLSearchParams({ theme, view })
        if (season) q.set('season', season)
        await page.goto(`/?${q}`)
        await page.waitForSelector(view === 'dialog' ? 'dialog[open]' : 'main')
        // Let the status widget settle on its fixture instead of "checking".
        await page.waitForTimeout(150)
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .disableRules(view === 'dialog' ? ['region'] : [])
          .analyze()
        const summary = results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.slice(0, 6).map((n) => `${n.target.join(' ')} — ${n.failureSummary?.split('\n').slice(0, 3).join(' | ')}`),
        }))
        expect(summary, JSON.stringify(summary, null, 2)).toEqual([])
      })
    }
  }
}
