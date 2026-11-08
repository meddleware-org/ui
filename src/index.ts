// @meddleware/ui — shared Vue 3 component library.
// Consumers import the tokens and the element reset once at their entry:
//   import '@meddleware/design-tokens/tokens.css'
//   import '@meddleware/ui/reset.css'       // element defaults and utilities (required once per app)
// Each component brings its own CSS when it is imported, so a bundler keeps only what an app uses. `@meddleware/ui/base.css` (reset +
// every component) remains for consumers that want the single file.

export { default as AppHeader } from './components/AppHeader.vue'
export { default as AppSidebar } from './components/AppSidebar.vue'
export { default as AppFooter } from './components/AppFooter.vue'
export { default as AppToolShell } from './components/AppToolShell.vue'
export { default as BrandMark } from './components/BrandMark.vue'
export { default as ColorModeControl } from './components/ColorModeControl.vue'
export { default as UiButton } from './components/UiButton.vue'
export { default as UiCard } from './components/UiCard.vue'
export { default as UiSelect } from './components/UiSelect.vue'
export { default as UiNotice } from './components/UiNotice.vue'
export { default as SidebarItem } from './components/SidebarItem.vue'
export { default as SidebarGroup } from './components/SidebarGroup.vue'
export { default as AppTabNav } from './components/AppTabNav.vue'
export type { AppTab } from './components/AppTabNav.vue'
export { default as UiTabPanel } from './components/UiTabPanel.vue'
export { tabIds } from './tabs.js'
export type { TabIds } from './tabs.js'
export { default as UiDialog } from './components/UiDialog.vue'
export { default as CopyableAddress } from './components/CopyableAddress.vue'
export { default as ExplorerLink } from './components/ExplorerLink.vue'
export { default as CopyrightLine } from './components/CopyrightLine.vue'
export { default as UiStepper } from './components/UiStepper.vue'
export type { StepperStep, StepStatus } from './components/UiStepper.vue'
export { default as UiSegmentedControl } from './components/UiSegmentedControl.vue'
export type { SegmentedOption } from './components/UiSegmentedControl.vue'
export { default as UiFieldHint } from './components/UiFieldHint.vue'
export { default as UiFormField } from './components/UiFormField.vue'
export { default as UiToolIntro } from './components/UiToolIntro.vue'
export { default as UiInput } from './components/UiInput.vue'
export { default as UiTextarea } from './components/UiTextarea.vue'
export { default as UiFileField } from './components/UiFileField.vue'
export { default as UiTextField } from './components/UiTextField.vue'
export { default as UiSelectField } from './components/UiSelectField.vue'
export { default as UiCheckField } from './components/UiCheckField.vue'
export { default as UiDateTimeField } from './components/UiDateTimeField.vue'
export { default as UiMeter } from './components/UiMeter.vue'
export { default as UiPager } from './components/UiPager.vue'
export { default as UiLiveStatus } from './components/UiLiveStatus.vue'
export { default as UiEmptyState } from './components/UiEmptyState.vue'
export { default as UiCopyButton } from './components/UiCopyButton.vue'
export { default as UiCodeBlock } from './components/UiCodeBlock.vue'
export { default as UiSkipLink } from './components/UiSkipLink.vue'
export { default as UiAmount } from './components/UiAmount.vue'
export { default as UiAppShell } from './components/UiAppShell.vue'

// Desktop-console ("qt") primitives — panels, tables, stat grids, badges, toolbar,
// status bar, and activity feed. Design-token driven, scoped styles.
export { default as UiPanel } from './components/UiPanel.vue'
export { default as UiBadge } from './components/UiBadge.vue'
export type { BadgeTone } from './components/UiBadge.vue'
export { default as UiToolbar } from './components/UiToolbar.vue'
export type { ToolbarAction } from './components/UiToolbar.vue'
export { default as UiToolbarButton } from './components/UiToolbarButton.vue'
export { default as UiStatGrid } from './components/UiStatGrid.vue'
export { default as UiStatRow } from './components/UiStatRow.vue'
export { default as UiDataTable } from './components/UiDataTable.vue'
export { default as UiStatusBar } from './components/UiStatusBar.vue'
export { default as UiStatusDot } from './components/UiStatusDot.vue'
export type { StatusDotStatus } from './components/UiStatusDot.vue'
export { default as UiActivityFeed } from './components/UiActivityFeed.vue'
export { default as UiActivityItem } from './components/UiActivityItem.vue'

export { default as StatusWidget } from './components/StatusWidget.vue'

// Framework-free helpers live in @meddleware/web-utils; they are re-exported here so this package's public API is unchanged.
export { suiExplorerUrl, walruscanBlobUrl, safeHref, safePath, safeIcon, truncateMiddle, DEFAULT_TRUNCATE_CHARS } from '@meddleware/web-utils'
export type { SuiNetwork, SuiExplorerKind } from '@meddleware/web-utils'
export { isStatusLevel, parseSnapshot, STATUS_LABEL, STATUS_HEADLINE } from '@meddleware/web-utils'
export type { StatusLevel, StatusComponent, StatusGroup, StatusSnapshot } from '@meddleware/web-utils'

export { useColorMode } from './composables/useColorMode.js'
export type { ColorMode } from './composables/useColorMode.js'
export { useSeason } from './composables/useSeason.js'
export { useNow } from './composables/useNow.js'
export { useStatusSnapshot, MIN_STATUS_POLL_MS } from './composables/useStatusSnapshot.js'
export type { UseStatusSnapshotOptions, StatusSnapshotState } from './composables/useStatusSnapshot.js'
export { usePager } from './composables/usePager.js'
export { useStickyOffset } from './composables/useStickyOffset.js'
export type { Pager, PageOf } from './composables/usePager.js'
export type { PanelVariant, PanelColors } from './internal/panel.js'

export {
  loadRuntimeConfig,
  runtimeEndpoints,
  withRuntimeEnv,
  parseRuntimeConfig,
  parseEndpoint,
  resetRuntimeConfigForTesting,
  RUNTIME_ENDPOINT_KEYS,
  RUNTIME_CONFIG_PATH,
} from './runtime-config.js'
export type { RuntimeEndpointKey, RuntimeEndpoints } from './runtime-config.js'
