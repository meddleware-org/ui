import { getCurrentScope, onScopeDispose, ref, type Ref } from 'vue'

/**
 * The current time in milliseconds, refreshed every `intervalMs` (default 1 s) while the calling scope is alive. A relative-time label
 * ("Refreshed 12s ago") reads it so it ticks on its own; the timer stops with the component.
 */
export function useNow(intervalMs = 1000): Ref<number> {
  const now = ref(Date.now())
  if (typeof window === 'undefined') return now
  const id = setInterval(() => {
    now.value = Date.now()
  }, intervalMs)
  if (getCurrentScope()) onScopeDispose(() => clearInterval(id))
  return now
}
