import { onMounted, onScopeDispose, ref, type Ref } from 'vue'
import { createGeneration, errorMessage, fetchJson, parseSnapshot, type StatusSnapshot } from '@meddleware/web-utils'

/** The shortest poll interval honoured, so a tiny `intervalMs` cannot hammer the status endpoint. */
export const MIN_STATUS_POLL_MS = 15_000

export interface UseStatusSnapshotOptions {
  /** URL of the `GET /api/status` endpoint. */
  url: string
  /** Poll interval in milliseconds (default 60 000; values below 15 000 are raised to it). */
  intervalMs?: number
  /** Time allowed for one request, headers and body (default 10 000). */
  timeoutMs?: number
}

export interface StatusSnapshotState {
  /** The latest valid snapshot, kept across a failed poll (null until the first success). */
  snapshot: Ref<StatusSnapshot | null>
  /** The last poll's failure, or null when it succeeded. */
  error: Ref<string | null>
  /** True until the first answer (or failure) arrives. */
  loading: Ref<boolean>
  /** Poll now. */
  refresh: () => Promise<void>
}

/**
 * Poll the platform status endpoint: once on mount, then every `intervalMs` while the tab is visible (a hidden tab catches up when it
 * becomes visible again). Renders exactly what the API returns: a response that is not a valid snapshot is an error, never "healthy".
 * An older, slower poll never overwrites a newer one. Must be called from a component's `setup`.
 */
export function useStatusSnapshot(options: UseStatusSnapshotOptions): StatusSnapshotState {
  const snapshot = ref<StatusSnapshot | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(true)
  const generation = createGeneration()

  async function refresh(): Promise<void> {
    const current = generation.begin()
    try {
      const snap = parseSnapshot(await fetchJson(options.url, { timeoutMs: options.timeoutMs ?? 10_000 }))
      if (!snap) throw new Error('unexpected response shape')
      if (!current()) return
      snapshot.value = snap
      error.value = null
    } catch (e) {
      if (!current()) return
      error.value = errorMessage(e)
    } finally {
      if (current()) loading.value = false
    }
  }

  const pollIfVisible = (): void => {
    if (!document.hidden) void refresh()
  }

  onMounted(() => {
    void refresh()
    const timer = setInterval(pollIfVisible, Math.max(options.intervalMs ?? 60_000, MIN_STATUS_POLL_MS))
    document.addEventListener('visibilitychange', pollIfVisible)
    onScopeDispose(() => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', pollIfVisible)
    })
  })

  return { snapshot, error, loading, refresh }
}
