// With `prefers-reduced-motion: reduce` nothing moves, and nothing is caught half-way: a change of colour mode is complete the moment it
// is applied (a 0.001 ms transition still starts a transition on every property, so a read in the same frame sees the old colour).
import { test, expect } from '@playwright/test'

test('reduced motion: no transitions, and a colour-mode change is immediate', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?theme=light&view=all')
  await page.waitForSelector('main')
  // Every transition duration on links, buttons and the page frame must be 0s: the reset turns the duration tokens off under reduced motion.
  const durations = await page.evaluate(() => [...document.querySelectorAll('a, button, body, main')].map((e) => getComputedStyle(e).transitionDuration))
  expect(durations.length).toBeGreaterThan(0)
  expect(new Set(durations)).toEqual(new Set(['0s']))
  // Switch the theme and read the colour in the same frame: with any transition running, the read would still see the old colour.
  const colours = await page.evaluate(() => {
    const el = document.querySelector('main') as HTMLElement
    const before = getComputedStyle(el).color
    document.documentElement.setAttribute('data-theme', 'dark')
    const after = getComputedStyle(el).color
    return { before, after, running: document.getAnimations().length }
  })
  // The colour changed at once, and no animation is running.
  expect(colours.after).not.toBe(colours.before)
  expect(colours.running).toBe(0)
})

test('a table scrolls inside its own box: it is positioned, so a visually hidden cell cannot widen the page', async ({ page }) => {
  await page.goto('/?theme=light&view=all')
  await page.waitForSelector('main')
  // `position: relative` on the scroll box clips an absolutely placed (visually hidden) cell inside it, so it cannot add width to the page.
  const positions = await page.evaluate(() => [...document.querySelectorAll('.mw-data-table-wrap')].map((e) => getComputedStyle(e).position))
  expect(positions.length).toBeGreaterThan(0)
  expect(new Set(positions)).toEqual(new Set(['relative']))
})
