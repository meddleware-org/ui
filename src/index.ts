// @meddleware/ui — shared Vue 3 component library.
// Consumers must also import the tokens once at their entry:
//   import '@meddleware/design-tokens/tokens.css'
//   import '@meddleware/ui/base.css'        // element defaults + component styles
import './styles/base.css'

export { default as AppHeader } from './components/AppHeader.vue'
export { default as AppSidebar } from './components/AppSidebar.vue'
export { default as AppFooter } from './components/AppFooter.vue'
export { default as ColorModeControl } from './components/ColorModeControl.vue'
export { default as UiButton } from './components/UiButton.vue'
export { default as UiCard } from './components/UiCard.vue'
export { default as UiSelect } from './components/UiSelect.vue'
export { default as UiNotice } from './components/UiNotice.vue'
export { default as SidebarItem } from './components/SidebarItem.vue'
export { default as SidebarGroup } from './components/SidebarGroup.vue'
export { default as AppTabNav } from './components/AppTabNav.vue'
export type { AppTab } from './components/AppTabNav.vue'
export { default as CopyableAddress } from './components/CopyableAddress.vue'
export { default as ExplorerLink } from './components/ExplorerLink.vue'
export { default as CopyrightLine } from './components/CopyrightLine.vue'
export { default as UiStepper } from './components/UiStepper.vue'
export type { StepperStep } from './components/UiStepper.vue'
export { default as UiSegmentedControl } from './components/UiSegmentedControl.vue'
export type { SegmentedOption } from './components/UiSegmentedControl.vue'
export { default as UiFieldHint } from './components/UiFieldHint.vue'
export { default as UiFormField } from './components/UiFormField.vue'

// Desktop-console ("qt") primitives — panels, tables, stat grids, badges, toolbar,
// status bar, and activity feed. Design-token driven, scoped styles.
export { default as UiPanel } from './components/UiPanel.vue'
export { default as UiBadge } from './components/UiBadge.vue'
export { default as UiToolbar } from './components/UiToolbar.vue'
export { default as UiToolbarButton } from './components/UiToolbarButton.vue'
export { default as UiStatGrid } from './components/UiStatGrid.vue'
export { default as UiStatRow } from './components/UiStatRow.vue'
export { default as UiDataTable } from './components/UiDataTable.vue'
export { default as UiStatusBar } from './components/UiStatusBar.vue'
export { default as UiStatusDot } from './components/UiStatusDot.vue'
export { default as UiActivityFeed } from './components/UiActivityFeed.vue'
export { default as UiActivityItem } from './components/UiActivityItem.vue'

export { default as StatusWidget } from './components/StatusWidget.vue'

export { suiExplorerUrl } from './explorer.js'
export type { SuiNetwork, SuiExplorerKind } from './explorer.js'

export { useColorMode } from './composables/useColorMode.js'
export type { ColorMode } from './composables/useColorMode.js'
export { useSeason } from './composables/useSeason.js'
export type { PanelVariant, PanelColors } from './internal/panel.js'

export { isStatusLevel, parseSnapshot } from './status.js'
export { safeHref } from './safe-href.js'
export type { StatusLevel, StatusComponent, StatusGroup, StatusSnapshot } from './status.js'
