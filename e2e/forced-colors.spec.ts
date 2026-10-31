// Windows High Contrast ("forced colors") replaces an author's colours with the user's system colours and drops backgrounds and shadows.
// What survives is borders, outlines and text. So every state that is drawn with a background or a shadow alone disappears unless it has
// a second cue. This checks the states that matter keep a visible border or outline, and that keyboard focus is visible.
import { test, expect, type Page } from '@playwright/test'

test.skip(({ browserName }) => browserName !== 'chromium', 'forced-colors emulation is checked on Chromium')

interface Edge {
  border: number
  outline: number
  ok: boolean
}

/** Whether an element has a border or outline that is drawn (a width, a style, and a colour that is not transparent). */
async function edge(page: Page, selector: string): Promise<Edge> {
  return page.locator(selector).first().evaluate((el) => {
    const s = getComputedStyle(el)
    const drawn = (w: string, st: string, c: string) => parseFloat(w) > 0 && st !== 'none' && st !== 'hidden' && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent'
    const sides = ['Top', 'Right', 'Bottom', 'Left'] as const
    const border = sides.filter((x) => drawn(s.getPropertyValue(`border-${x.toLowerCase()}-width`), s.getPropertyValue(`border-${x.toLowerCase()}-style`), s.getPropertyValue(`border-${x.toLowerCase()}-color`))).length
    const outline = drawn(s.outlineWidth, s.outlineStyle, s.outlineColor) ? 1 : 0
    return { border, outline, ok: border > 0 || outline > 0 }
  })
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto('/?view=all')
  await page.waitForSelector('main')
})

test('controls keep a visible edge when backgrounds are removed', async ({ page }) => {
  const selectors = [
    '.mw-btn--primary',
    '.mw-btn--secondary',
    '.mw-btn--danger',
    '.mw-btn--ghost',
    '.mw-input',
    '.mw-select',
    '.mw-textarea',
    '.mw-badge',
    '.mw-card',
    '.mw-notice',
    '.mw-seg',
    '.mw-code__pre',
    '.mw-toolbar-btn',
  ]
  const missing: string[] = []
  for (const s of selectors) if (!(await edge(page, s)).ok) missing.push(s)
  expect(missing).toEqual([])
})

test('the chosen state is not carried by a background alone', async ({ page }) => {
  // The ✓ in a segmented control is text, so it survives; these have no glyph, so they need a border or outline of their own.
  const missing: string[] = []
  for (const s of ['.mw-mode__btn.is-active', '.sidebar-item.is-active', '.mw-tab-nav__tab--active', '.ui-stepper__step.is-active .ui-stepper__badge']) {
    if (!(await edge(page, s)).ok) missing.push(s)
  }
  expect(missing).toEqual([])
  expect(await page.locator('.mw-seg__item--active .mw-seg__tick').first().textContent()).toBe('✓')
})

test('keyboard focus is visible', async ({ page }) => {
  await page.keyboard.press('Tab') // the skip link or the first control
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    const s = getComputedStyle(el)
    return { tag: el.tagName, width: parseFloat(s.outlineWidth), style: s.outlineStyle }
  })
  expect(focused.style).not.toBe('none')
  expect(focused.width).toBeGreaterThan(0)
})
