// Where a floating tip goes, next to the element that opened it. A pure function (numbers in, numbers out) so every case is tested
// without a browser; `UiFieldHint` measures, calls it and writes the result.

/** A rectangle in viewport coordinates (what `getBoundingClientRect()` returns, reduced to what is needed here). */
export interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** Which side of the anchor the tip is on. */
export type Side = 'bottom' | 'top' | 'right' | 'left'

export interface Placement {
  /** The tip's left edge in DOCUMENT coordinates (the page's own, so the tip scrolls with the page). */
  left: number
  /** The tip's top edge in document coordinates. */
  top: number
  side: Side
  /** False when no side keeps the whole tip inside the viewport: the default side is used and the page grows to hold it. */
  fits: boolean
}

/** The order the sides are tried in: below the anchor is the default, then above, then beside it. */
export const SIDE_ORDER: readonly Side[] = ['bottom', 'top', 'right', 'left']

/** Keeps `start .. start + size` inside `min .. max` by moving it, as far as the room allows (it starts at `min` if it is larger). */
function clamp(start: number, size: number, min: number, max: number): number {
  return Math.max(min, Math.min(start, max - size))
}

/** The tip's top-left corner (viewport coordinates) for one side, shifted along that side to stay on screen. */
function corner(side: Side, anchor: Box, tip: { width: number; height: number }, viewport: { width: number; height: number }, gap: number, margin: number): { left: number; top: number } {
  const alongX = clamp(anchor.left, tip.width, margin, viewport.width - margin)
  const alongY = clamp(anchor.top, tip.height, margin, viewport.height - margin)
  switch (side) {
    case 'bottom':
      return { left: alongX, top: anchor.top + anchor.height + gap }
    case 'top':
      return { left: alongX, top: anchor.top - gap - tip.height }
    case 'right':
      return { left: anchor.left + anchor.width + gap, top: alongY }
    case 'left':
      return { left: anchor.left - gap - tip.width, top: alongY }
  }
}

/**
 * Chooses the side and position of a tip. Each side is tried in {@link SIDE_ORDER}; on each, the tip is first slid along the side to
 * stay on screen, and the side is taken when the whole tip then fits inside the viewport (less `margin` on every edge). If no side fits,
 * the default side (below) is used, and because the result is in document coordinates the tip extends the page's own scroll area, so
 * the person can scroll to read all of it. Nothing outside the table or panel that holds the anchor is affected.
 *
 * @param anchor The anchor's rectangle in viewport coordinates.
 * @param tip The tip's measured size.
 * @param viewport The visible area (`innerWidth`, `innerHeight`; the root element's client size where scrollbars take room).
 * @param scroll The page's scroll offsets (`scrollX`, `scrollY`), added to turn viewport coordinates into document coordinates.
 * @param gap The space between the anchor and the tip.
 * @param margin The space kept clear at the viewport's edges.
 */
export function placeTip(
  anchor: Box,
  tip: { width: number; height: number },
  viewport: { width: number; height: number },
  scroll: { x: number; y: number },
  gap: number,
  margin: number,
): Placement {
  const fitsOnScreen = (c: { left: number; top: number }): boolean =>
    c.left >= margin && c.top >= margin && c.left + tip.width <= viewport.width - margin && c.top + tip.height <= viewport.height - margin

  let chosen: Side | null = null
  let at = corner('bottom', anchor, tip, viewport, gap, margin)
  for (const side of SIDE_ORDER) {
    const c = corner(side, anchor, tip, viewport, gap, margin)
    if (fitsOnScreen(c)) {
      chosen = side
      at = c
      break
    }
  }
  return { left: Math.round(at.left + scroll.x), top: Math.round(at.top + scroll.y), side: chosen ?? 'bottom', fits: chosen !== null }
}
