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
export { default as CopyableAddress } from './components/CopyableAddress.vue'

export { default as StatusWidget } from './components/StatusWidget.vue'

export { useColorMode } from './composables/useColorMode.js'
export type { ColorMode } from './composables/useColorMode.js'
export type { PanelVariant, PanelColors } from './internal/panel.js'

export { isStatusLevel, parseSnapshot } from './status.js'
export type { StatusLevel, StatusComponent, StatusGroup, StatusSnapshot } from './status.js'
