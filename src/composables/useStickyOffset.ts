// Lets a sticky header or strip tell the page how tall it is, so the scroll area can leave room for it (WCAG 2.4.11). See the doc comment on
// `useStickyOffset` for the full reasoning.
import { onBeforeUnmount, onMounted, type Ref } from 'vue'

/** An element, or a component instance (whose root element is read). */
type Target = HTMLElement | { $el?: unknown } | null

/**
 * The DOM element of a target.
 * @param target - an element, or a component instance whose root element is read
 * @returns the element, or `null` when there is none (not mounted yet, or a fragment root)
 */
function elementOf(target: Target): HTMLElement | null {
  if (!target) return null
  const el = target instanceof HTMLElement ? target : (target as { $el?: unknown }).$el
  return el instanceof HTMLElement ? el : null
}

/**
 * Publish the height of a sticky element as a custom property on `<html>`, so the page can leave room for it when focus or a scroll moves
 * something into view (WCAG 2.4.11 *focus not obscured*): `reset.css` pads the scroll area with `--mw-header-offset` (the sticky
 * `AppHeader` does this itself) plus `--mw-sticky-extra` (a second sticky layer under the header, such as a tab strip: call
 * `useStickyOffset(strip, '--mw-sticky-extra')`).
 *
 * The height is not fixed: a header or strip wraps onto more rows on a phone or at a large text size. It is measured with a
 * `ResizeObserver` and written on the next animation frame (never inside the observer callback: a write that changes the layout there
 * ends in "ResizeObserver loop completed with undelivered notifications"), only when it changed, from the size the observer itself reports, through the CSSOM so no inline style is
 * rendered. The property is removed when the component unmounts. Must be called from a component's `setup`.
 */
export function useStickyOffset(target: Ref<Target>, property: `--${string}`): void {
  let observer: ResizeObserver | null = null
  // The last height written, so an unchanged height does not write again (-1: none yet).
  let last = -1
  // Set on unmount, so a frame that was already queued does not write after the property was removed.
  let gone = false
  onMounted(() => {
    const el = elementOf(target.value)
    if (!el || typeof ResizeObserver === 'undefined') return
    observer = new ResizeObserver((entries) => {
      // The size the observer reports (its border box), not a fresh measurement: reading layout inside the callback can resize the very
      // element being observed and ends in the loop error above.
      const entry = entries[entries.length - 1]
      if (!entry) return
      const height = Math.ceil(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
      // 0 is an element that is not laid out yet (or is hidden): keep what the page has (the reset's fallback) until it has a size.
      if (height === 0 || height === last) return
      last = height
      // Written on the next frame, never inside the observer callback (see the doc comment): that is what avoids the loop error.
      requestAnimationFrame(() => {
        if (!gone) document.documentElement.style.setProperty(property, `${height}px`)
      })
    })
    observer.observe(el)
  })
  onBeforeUnmount(() => {
    gone = true
    if (!observer) return
    observer.disconnect()
    document.documentElement.style.removeProperty(property)
  })
}
