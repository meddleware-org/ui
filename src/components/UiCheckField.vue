<script setup lang="ts">
// A checkbox with its label wrapped around it (a click on the text toggles it). The label is the `label` prop or, for rich content, the
// `label` slot; `hint` adds a muted aside inside the same label, so it is read with it.
const model = defineModel<boolean>({ default: false })
defineProps<{ label?: string; hint?: string; disabled?: boolean }>()
</script>

<template>
  <label class="mw-check">
    <input v-model="model" type="checkbox" class="mw-check__box" :disabled="disabled" />
    <span><slot name="label">{{ label }}</slot><span v-if="hint" class="mw-check__hint"> — {{ hint }}</span></span>
  </label>
</template>

<style scoped>
.mw-check {
  display: flex;
  gap: var(--space-xs);
  align-items: flex-start;
}
/* The native box is 13px: too small a target (WCAG 2.5.8 asks 24px, or space around it). */
.mw-check__box {
  flex-shrink: 0;
  inline-size: calc(var(--space-sm) + var(--space-3xs));
  block-size: calc(var(--space-sm) + var(--space-3xs));
  margin: 0;
  accent-color: var(--accent);
}
.mw-check__hint {
  color: var(--muted);
  font-size: var(--font-size-sm);
}
</style>
