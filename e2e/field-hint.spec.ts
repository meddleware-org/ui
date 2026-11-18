// A field hint's text is drawn in the browser's top layer, beside its button, whatever holds the button. jsdom has no layout, no popover
// and no top layer, so the real behaviour is checked here, against the gallery's `hints` views:
//   - in an EMPTY table (narrower than the text) the text neither widens the table nor adds a scrollbar anywhere;
//   - the background contains the text (it wraps, it is not nowrap/uppercase like the heading it sits in);
//   - near an edge it slides or flips to stay on screen, and when no side fits the PAGE (not the table) scrolls to hold it;
//   - it is drawn above an open modal dialog;
//   - hover, focus, a press and Escape open and close it.
import { test, expect, type Locator, type Page } from '@playwright/test'

/** The tip's box and whether its text is fully inside its own background. */
async function inspect(page: Page, tip: Locator) {
  return tip.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height,
      textFits: el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1,
      transform: cs.textTransform, whiteSpace: cs.whiteSpace, position: cs.position,
      topLayer: el.matches(':popover-open'),
    }
  })
}

test.describe('hints in an empty table, in a narrow column', () => {
  for (const viewport of [{ width: 320, height: 640 }, { width: 1280, height: 800 }]) {
    test(`do not widen the table or the page, and the text fits its background (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/?view=hints')
      const buttons = page.locator('.narrow').getByRole('button', { name: 'Help' })
      expect(await buttons.count()).toBe(2)
      for (let i = 0; i < 2; i++) {
        await buttons.nth(i).hover()
        const tip = page.locator('.narrow small[popover]:popover-open')
        await expect(tip).toBeVisible()
        const box = await inspect(page, tip)
        // The table's own scroll area is untouched (this was the bug: the text widened it, so it scrolled sideways), and so is the page.
        const metrics = await page.evaluate(() => {
          const wrap = document.querySelector('.mw-data-table-wrap') as HTMLElement
          const doc = document.documentElement
          return { wrapOverflow: wrap.scrollWidth - wrap.clientWidth, pageOverflow: doc.scrollWidth - doc.clientWidth }
        })
        expect(metrics.wrapOverflow).toBeLessThanOrEqual(0)
        expect(metrics.pageOverflow).toBeLessThanOrEqual(0)
        // Wrapped, normal case: the background contains the text.
        expect(box.textFits).toBe(true)
        expect(box.whiteSpace).toBe('normal')
        expect(box.transform).toBe('none')
        expect(box.topLayer).toBe(true)
        // And it is on screen.
        expect(box.left).toBeGreaterThanOrEqual(0)
        expect(box.right).toBeLessThanOrEqual(viewport.width)
        await page.mouse.move(0, 0)
        await expect(tip).toBeHidden()
      }
    })
  }
})

test('a hint at the right edge slides left to stay on screen', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 700 })
  await page.goto('/?view=hints')
  const button = page.locator('.edge-right').getByRole('button', { name: 'Help' })
  await button.hover()
  const tip = page.locator('.edge-right small[popover]:popover-open')
  await expect(tip).toBeVisible()
  const box = await inspect(page, tip)
  expect(box.right).toBeLessThanOrEqual(600)
  expect(box.left).toBeGreaterThanOrEqual(0)
})

test('a hint at the bottom of the screen opens above its button', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 700 })
  await page.goto('/?view=hints')
  const button = page.locator('.edge-bottom').getByRole('button', { name: 'Help' })
  await button.scrollIntoViewIfNeeded()
  await button.hover()
  const tip = page.locator('.edge-bottom small[popover]:popover-open')
  await expect(tip).toBeVisible()
  const t = await inspect(page, tip)
  const b = (await button.boundingBox())!
  expect(t.bottom).toBeLessThanOrEqual(b.y)
})

test('when no side fits, the page itself grows and scrolls to show all of the text (the table is not affected)', async ({ page }) => {
  // A screen only as tall as the text: no side has room, so the default (below) is used and the document must scroll to it.
  await page.setViewportSize({ width: 320, height: 150 })
  await page.goto('/?view=hints')
  const button = page.locator('.narrow').getByRole('button', { name: 'Help' }).first()
  await button.hover()
  const tip = page.locator('.narrow small[popover]:popover-open')
  await expect(tip).toBeVisible()
  const before = await page.evaluate(() => document.documentElement.scrollHeight)
  const docBottom = await tip.evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY)
  // The scrollable height reaches the bottom of the text, so scrolling to the end reveals all of it.
  expect(before).toBeGreaterThanOrEqual(Math.floor(docBottom))
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  const after = await inspect(page, tip)
  expect(after.bottom).toBeLessThanOrEqual(150 + 1)
  const wrapOverflow = await page.evaluate(() => {
    const wrap = document.querySelector('.mw-data-table-wrap') as HTMLElement
    return wrap.scrollWidth - wrap.clientWidth
  })
  expect(wrapOverflow).toBeLessThanOrEqual(0)
})

test('the text is drawn above an open modal dialog', async ({ page }) => {
  await page.goto('/?view=hints-dialog')
  const button = page.getByRole('button', { name: 'Help' })
  await button.focus()
  const tip = page.locator('small[popover]:popover-open')
  await expect(tip).toBeVisible()
  // The element at the middle of the text is the text (or inside it), not the dialog's backdrop or content behind it.
  const onTop = await tip.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!hit && el.contains(hit)
  })
  expect(onTop).toBe(true)
})

test.describe('opening and closing', () => {
  test('keyboard focus opens it, Escape dismisses it without moving focus, and it returns on the next visit', async ({ page }) => {
    await page.goto('/?view=hints')
    const button = page.locator('.edge-right').getByRole('button', { name: 'Help' })
    const tip = page.locator('.edge-right small[popover]')
    await button.focus()
    await expect(tip).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(tip).toBeHidden()
    await expect(button).toBeFocused()
    await page.locator('h1').click()
    await button.focus()
    await expect(tip).toBeVisible()
  })

  test('pressing the button toggles it (how a touch screen opens it), and a press elsewhere closes it', async ({ page }) => {
    await page.goto('/?view=hints')
    const button = page.locator('.edge-right').getByRole('button', { name: 'Help' })
    const tip = page.locator('.edge-right small[popover]')
    await button.click()
    await page.mouse.move(0, 0)
    await expect(tip).toBeVisible() // pinned: the pointer left, it stayed
    await button.click()
    await page.mouse.move(0, 0)
    await expect(tip).toBeHidden()
    await button.click()
    await expect(tip).toBeVisible()
    await page.locator('h1').click()
    await expect(tip).toBeHidden()
  })

  test('the pointer can move from the button onto the text without it closing', async ({ page }) => {
    await page.goto('/?view=hints')
    const button = page.locator('.edge-right').getByRole('button', { name: 'Help' })
    const tip = page.locator('.edge-right small[popover]')
    await button.hover()
    await expect(tip).toBeVisible()
    await tip.hover()
    await page.waitForTimeout(400)
    await expect(tip).toBeVisible()
  })
})
