<script setup lang="ts">
/**
 * SidebarGroup — accessible, labelled group of sidebar navigation items.
 *
 * Renders a native `<fieldset>` (implicit `group` role) whose visible `<legend>` is also
 * the group's accessible name, so assistive technology announces the category once
 * before reading the contained items — no ARIA attributes or hidden duplicates needed.
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
    /** Human-readable group name, rendered as the group's visible `<legend>`. */
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
  <fieldset class="sidebar-group" :class="`sidebar-group--l${level}`">
    <legend class="sidebar-group__label">{{ label }}</legend>
    <slot />
  </fieldset>
</template>

<style scoped>
.sidebar-group {
  margin: 0;
  padding: 0;
  border: 0;
  min-inline-size: 0;
}

/* Separate consecutive top-level groups with a leading gap. */
.sidebar-group--l1 + .sidebar-group--l1 {
  margin-block-start: var(--space-2xs);
}

/* Floated full-width so the legend lays out as an ordinary block row above the items
   instead of sitting in the (absent) fieldset border. */
.sidebar-group__label {
  float: inline-start;
  width: 100%;
  padding: var(--space-3xs) var(--space-xs);
  font-size: var(--font-size-xs);
  font-weight: 600;
  /* Inside a light/dark panel the panel's own muted colour; on the page, the page role. */
  color: var(--_muted, var(--muted));
  user-select: none;
}
.sidebar-group__label + :deep(*) {
  clear: both;
}

/* Level-1: "BLOCKCHAIN" — uppercase, wide tracking. (Opacity is not used to dim labels: it takes
   them below 4.5:1.) */
.sidebar-group--l1 > .sidebar-group__label {
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

/* Level-2: "Sui" — normal case, indented, lighter weight; its items gain a left
   indent to visually nest under the chain label. */
.sidebar-group--l2 {
  padding-inline-start: var(--space-3xs);
}
.sidebar-group--l2 > .sidebar-group__label {
  padding-inline-start: var(--space-xs);
  font-weight: 500;
}
</style>
