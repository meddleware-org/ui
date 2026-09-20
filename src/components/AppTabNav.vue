<script setup lang="ts">
// Shared underline-style tab navigation (v-model + typed tabs). Scoped styles are built in so
// consumers get the canonical appearance with zero extra CSS. Note: dao-ui's raised-tab TabBar is
// intentionally a separate, bespoke component and does not use this.
export interface AppTab {
  id: string
  label: string
}

defineProps<{
  tabs: AppTab[]
  modelValue: string
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<template>
  <nav class="mw-tab-nav" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="mw-tab-nav__tab"
      :class="{ 'mw-tab-nav__tab--active': modelValue === tab.id }"
      :aria-current="modelValue === tab.id ? 'page' : undefined"
      @click="emit('update:modelValue', tab.id)"
    >{{ tab.label }}</button>
  </nav>
</template>

<style scoped>
.mw-tab-nav {
  display: flex;
  gap: var(--space-3xs);
  border-bottom: 2px solid var(--border);
}

.mw-tab-nav__tab {
  appearance: none;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: var(--space-2xs) var(--space-sm);
  margin-bottom: -2px;
  cursor: pointer;
  font-size: var(--font-size-base);
  color: var(--muted);
  transition: color var(--transition-base), border-color var(--transition-base);
}

.mw-tab-nav__tab:hover {
  color: var(--text);
}

.mw-tab-nav__tab--active {
  border-bottom-color: var(--accent);
  color: var(--text);
  font-weight: 600;
}
</style>
