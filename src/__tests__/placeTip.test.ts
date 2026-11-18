// placeTip is arithmetic, so every case is checked here without a browser: the default side, each flip, sliding along a side to stay on
// screen, the page scroll offsets, and the fallback (below, which makes the page grow) when no side fits.
import { describe, expect, it } from 'vitest'
import { placeTip, SIDE_ORDER, type Box } from '../internal/placeTip'

const viewport = { width: 1000, height: 800 }
const tip = { width: 200, height: 80 }
const GAP = 6
const MARGIN = 8
const noScroll = { x: 0, y: 0 }
/** A 24 px button at the given viewport position. */
const button = (left: number, top: number): Box => ({ left, top, width: 24, height: 24 })

describe('placeTip', () => {
  it('goes below the button, aligned to its start, when there is room', () => {
    expect(placeTip(button(100, 100), tip, viewport, noScroll, GAP, MARGIN)).toEqual({ left: 100, top: 130, side: 'bottom', fits: true })
  })

  it('goes above when there is no room below', () => {
    // 760 + 24 + 6 + 80 = 870 > 792, so below does not fit; above is at 760 - 6 - 80 = 674.
    expect(placeTip(button(100, 760), tip, viewport, noScroll, GAP, MARGIN)).toEqual({ left: 100, top: 674, side: 'top', fits: true })
  })

  it('slides along the side to stay on screen instead of flipping, when that is enough', () => {
    // Near the right edge: below, shifted left so its right edge is 8 px inside the viewport (1000 - 8 - 200 = 792).
    expect(placeTip(button(950, 100), tip, viewport, noScroll, GAP, MARGIN)).toEqual({ left: 792, top: 130, side: 'bottom', fits: true })
    // Near the left edge: never closer than the margin.
    expect(placeTip(button(2, 100), tip, viewport, noScroll, GAP, MARGIN).left).toBe(MARGIN)
  })

  it('goes beside the button when neither below nor above fits, and slides vertically', () => {
    // A tall tip in a short viewport: only a side position keeps it all on screen.
    const tall = { width: 200, height: 300 }
    const short = { width: 1000, height: 320 }
    const right = placeTip(button(100, 150), tall, short, noScroll, GAP, MARGIN)
    expect(right.side).toBe('right')
    expect(right.left).toBe(130)
    expect(right.top).toBe(12) // slid up: 320 - 8 - 300
    // At the right edge the right side does not fit, so the left side is used.
    const left = placeTip(button(960, 150), tall, short, noScroll, GAP, MARGIN)
    expect(left.side).toBe('left')
    expect(left.left).toBe(960 - GAP - 200)
  })

  it('tries the sides in the order below, above, right, left', () => {
    expect(SIDE_ORDER).toEqual(['bottom', 'top', 'right', 'left'])
  })

  it('uses the default side, below, when the tip fits nowhere, and says so (the page then grows to hold it)', () => {
    const huge = { width: 600, height: 700 }
    const small = { width: 640, height: 600 }
    const result = placeTip(button(300, 300), huge, small, noScroll, GAP, MARGIN)
    expect(result.fits).toBe(false)
    expect(result.side).toBe('bottom')
    expect(result.top).toBe(330) // directly below the button, past the bottom edge of the viewport
    expect(result.top + huge.height).toBeGreaterThan(small.height)
  })

  it('returns document coordinates: the scroll offsets are added', () => {
    const at = placeTip(button(100, 100), tip, viewport, { x: 15, y: 400 }, GAP, MARGIN)
    expect(at).toEqual({ left: 115, top: 530, side: 'bottom', fits: true })
  })

  it('a hint in an empty table at the far right still fits on screen without moving the table', () => {
    // The case that started this: a heading near the right edge of a narrow, empty table, on a 320 px screen.
    const phone = { width: 320, height: 640 }
    const wide = { width: 304, height: 90 }
    const r = placeTip(button(280, 200), wide, phone, noScroll, GAP, MARGIN)
    expect(r.fits).toBe(true)
    expect(r.left + wide.width).toBeLessThanOrEqual(phone.width - MARGIN)
    expect(r.left).toBeGreaterThanOrEqual(MARGIN)
  })
})
