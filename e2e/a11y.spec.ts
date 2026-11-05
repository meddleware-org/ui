// The shared accessibility sweep over the component gallery: WCAG 2.2 AA and AAA (gating; 7:1 text) in every colour mode × season, reflow
// at 320 px, 200% text, forced colours, reduced motion and the keyboard pass. The library is where the palette is applied and where the
// components own their layout, so it is held to the highest level and to the same sweep every app runs.
import type { Page } from '@playwright/test'
import { defineA11ySuite } from '@meddleware/frontend-config/a11y'

const view = (name: string, ready = 'main') => async (page: Page) => {
  await page.goto(`/?view=${name}`)
  await page.waitForSelector(ready)
  // Let the status widget settle on its fixture instead of "checking".
  await page.waitForTimeout(150)
}

defineA11ySuite(
  {
    all: view('all'),
    panels: view('panels'),
    // A lone modal dialog has no page around it, so it has no landmarks.
    dialog: { open: view('dialog', 'dialog[open]'), disableRules: ['region'] },
  },
  { aaa: 'gate' },
)
