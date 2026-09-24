<script setup lang="ts">
/**
 * SidebarGroup — accessible section-header wrapper for sidebar navigation.
 *
 * Renders a visible group label and wraps its children in a WAI-ARIA `group` so
 * assistive technology announces the category before reading the contained items.
 * The visible label element carries `aria-hidden="true"` — its content is already
 * conveyed by `aria-label` on the group container, preventing double-announcement.
 *
 * Two visual levels are supported via the {@link SidebarGroupProps.level} prop:
 * - `1` — top-level category label (e.g. "Blockchain"): uppercase, wide tracking,
 *   subtle opacity, section gap above when following a sibling.
 * - `2` — sub-group label within a category (e.g. "Sui"): normal case, slightly
 *   more muted, items indented by `--space-3xs` to show nesting.
 *
 * Nest a level-2 group inside a level-1 group to build a two-tier hierarchy:
 *
 * @example
 * ```vue
 * <SidebarGroup label="Blockchain" :level="1">
 *   <SidebarGroup label="Sui" :level="2">
 *     <SidebarItem label="DAO" icon="🏛" :active="isDao" @click="navigate" />
 *     <SidebarItem label="Token Deployer" icon="🪙" :active="isToken" @click="navigate" />
 *   </SidebarGroup>
 * </SidebarGroup>
 * ```
 *
 * Screen-reader output for the above (abbreviated):
 * > "Blockchain, group; Sui, group; DAO, button, current page; Token Deployer, button"
 */
withDefaults(
  defineProps<{
    /**
     * Human-readable group name. Used as both the `aria-label` on the group
     * container and the rendered visible section header.
     */
    label: string
    /**
     * Visual hierarchy level.
     *
     * `1` — Top-level category. Rendered as an uppercase, wide-tracked, muted
     * micro-label. Adds a top gap when preceded by another sibling group.
     *
     * `2` — Sub-group within a category. Rendered in normal case with a slight
     * left indent; items inside gain `--space-3xs` of left padding.
     *
     * @default 1
     */
    level?: 1 | 2
  }>(),
  { level: 1 },
)
</script>

<template>
  <div
    class="sidebar-group"
    :class="`sidebar-group--l${level}`"
    role="group"
    :aria-label="label"
  >
    <div class="sidebar-group__label" aria-hidden="true">{{ label }}</div>
    <div class="sidebar-group__items"><slot /></div>
  </div>
</template>

<style scoped>
/* Separate consecutive top-level groups with a leading gap. */
.sidebar-group--l1 + .sidebar-group--l1 {
  margin-block-start: var(--space-2xs);
}

.sidebar-group__label {
  padding: var(--space-3xs) var(--space-xs);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--muted);
  user-select: none;
}

/* Level-1: "BLOCKCHAIN" — uppercase, wide tracking, 75 % opacity. */
.sidebar-group--l1 > .sidebar-group__label {
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  opacity: 0.75;
}

/* Level-2: "Sui" — normal case, indented, slightly more muted. */
.sidebar-group--l2 > .sidebar-group__label {
  padding-inline-start: calc(var(--space-xs) + var(--space-3xs));
  opacity: 0.6;
}

/* Level-2 items: left indent to visually nest under the chain label. */
.sidebar-group--l2 > .sidebar-group__items {
  padding-inline-start: var(--space-3xs);
}
</style>
