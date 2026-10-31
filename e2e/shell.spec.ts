// The sidebar is a column on wide screens and a Popover-API drawer on narrow ones, opened from the header's menu button. jsdom has no
// popover and no layout, so this is checked in a real browser, against the gallery's `panels` view.
import { test, expect } from '@playwright/test'

test.describe('narrow screen', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the sidebar is hidden until the menu button opens it, and Escape closes it', async ({ page }) => {
    await page.goto('/?view=panels')
    const menu = page.getByRole('button', { name: 'Menu' })
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(menu).toBeVisible()
    await expect(nav).toBeHidden()

    await menu.click()
    await expect(nav).toBeVisible()
    await expect(page.getByRole('button', { name: 'Treasury' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(nav).toBeHidden()
  })

  test('choosing an item closes the drawer, and the menu button works from the keyboard', async ({ page }) => {
    await page.goto('/?view=panels')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await page.getByRole('button', { name: 'Menu' }).focus()
    await page.keyboard.press('Enter')
    await expect(nav).toBeVisible()
    await page.getByRole('button', { name: 'Treasury' }).click()
    await expect(nav).toBeHidden()
  })

  test('the drawer fits the screen and does not scroll the page sideways', async ({ page }) => {
    await page.goto('/?view=panels')
    await page.getByRole('button', { name: 'Menu' }).click()
    const box = await page.locator('aside').boundingBox()
    expect(box!.width).toBeLessThanOrEqual(390 * 0.85 + 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
})

test.describe('wide screen', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('the sidebar is simply visible and there is no menu button', async ({ page }) => {
    await page.goto('/?view=panels')
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden()
  })
})
