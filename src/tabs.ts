// Shared id scheme linking an AppTabNav tab to its UiTabPanel (aria-controls / aria-labelledby).
// Both components receive the same `idPrefix`; the tab id disambiguates within it.

export interface TabIds {
  /** id of the `role="tab"` button. */
  tab: string
  /** id of the `role="tabpanel"` region. */
  panel: string
}

/** Deterministic tab/panel ids for a tab `id` within a tab set identified by `prefix`. */
export function tabIds(prefix: string, id: string): TabIds {
  return { tab: `${prefix}-tab-${id}`, panel: `${prefix}-panel-${id}` }
}
