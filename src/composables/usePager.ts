import { ref, type Ref } from 'vue'
import { errorMessage } from '@meddleware/web-utils'

/** A page of a keyset-paginated list: the items and an opaque cursor for the next page (absent or null on the last). */
export interface PageOf<T> {
  items: T[]
  next_cursor?: string | null
}

export interface Pager<T> {
  items: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  /** Zero-based index of the page being shown. */
  index: Ref<number>
  hasNext: Ref<boolean>
  /** Start again from the first page (after a filter changes). */
  reset: () => Promise<void>
  /** Fetch the current page again. */
  reload: () => Promise<void>
  next: () => Promise<void>
  prev: () => Promise<void>
}

/**
 * Keyset pagination for a list API that returns a page and an opaque cursor for the next one. It keeps the cursors already seen so
 * Previous works, and drops answers that arrive out of order. Pair it with `UiPager`.
 *
 * @param load fetches the page at a cursor (`null` for the first page).
 * @param describeError turns a failure into the sentence shown to people (default: the error's message).
 */
export function usePager<T>(load: (cursor: string | null) => Promise<PageOf<T>>, describeError: (e: unknown) => string = errorMessage): Pager<T> {
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)
  const index = ref(0)
  const hasNext = ref(false)
  let cursors: Array<string | null> = [null]
  let ticket = 0

  async function at(i: number): Promise<void> {
    const mine = ++ticket
    loading.value = true
    try {
      const p = await load(cursors[i] ?? null)
      if (mine !== ticket) return
      items.value = p.items
      const nextCursor = p.next_cursor ?? null
      hasNext.value = nextCursor !== null
      if (nextCursor) cursors[i + 1] = nextCursor
      index.value = i
      error.value = null
    } catch (e) {
      if (mine === ticket) error.value = describeError(e)
    } finally {
      if (mine === ticket) loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    index,
    hasNext,
    reset() {
      cursors = [null]
      return at(0)
    },
    reload: () => at(index.value),
    next: () => (hasNext.value ? at(index.value + 1) : Promise.resolve()),
    prev: () => (index.value > 0 ? at(index.value - 1) : Promise.resolve()),
  }
}
