<script setup lang="ts">
// Segmented control — radio-group–based selection between labelled options. Semantically distinct from AppTabNav (navigation): this is a
// form input control for switching between mutually exclusive modes within a single view. The hidden radio inputs keep keyboard and
// screen-reader semantics correct; a shared `name` makes them one native radio group (arrow keys move the selection). The selected
// option carries a ✓ as well as the fill, so the choice never rests on colour alone.
import { computed, useId } from 'vue'

/** One choice in a segmented control. */
export interface SegmentedOption {
  /** The value `v-model` takes when this option is chosen. */
  id: string
  /** The option's visible text. */
  label: string
  /** A disabled option cannot be chosen. */
  disabled?: boolean
  /** A tooltip for the option. */
  title?: string
}

const props = withDefaults(
  defineProps<{
    /** The choices, in order. */
    options: SegmentedOption[]
    /** The `id` of the chosen option (`v-model`). */
    modelValue: string
    /** Names the group (its `<legend>`). Required for a usable control: say what is being chosen. */
    label?: string
    /** Visually hide the legend (default true); it still names the group for assistive technology. */
    labelHidden?: boolean
    /** @deprecated Use `label`. */
    ariaLabel?: string
    /** `inline` (default): one row. `wrap`: wraps onto more rows. `grid`: two columns on a narrow screen, one row from 36em. */
    layout?: 'inline' | 'wrap' | 'grid'
  }>(),
  { labelHidden: true, layout: 'inline' },
)

const emit = defineEmits<{
  /** An option was chosen; the argument is its `id`. */
  'update:modelValue': [id: string]
}>()

// One `name` for every radio makes them a single native group: arrow keys move the selection and only the chosen one is in the tab order.
const groupName = useId()
// The legend text: `label`, or the deprecated `ariaLabel` for callers that have not moved yet.
const legend = computed(() => props.label ?? props.ariaLabel)

// Canonical radio-group markup: the fieldset carries the segmented-pill styling and the legend names the group.
// Template: A fieldset with a legend is the native name for a radio group; the legend is visually hidden by default but still names the group.
</script>

<template>
  <fieldset class="mw-seg" :class="`mw-seg--${layout}`">
    <legend v-if="legend" :class="{ 'mw-visually-hidden': labelHidden, 'mw-seg__legend': !labelHidden }">{{ legend }}</legend>
    <label
      v-for="opt in options"
      :key="opt.id"
      class="mw-seg__item"
      :class="{
        'mw-seg__item--active': modelValue === opt.id,
        'mw-seg__item--disabled': opt.disabled,
      }"
      :title="opt.title"
    >
      <!-- The radio is the real control (hidden visually, kept for keyboard and screen readers); the label around it is what is drawn. -->
      <input
        type="radio"
        :name="groupName"
        :value="opt.id"
        :checked="modelValue === opt.id"
        :disabled="opt.disabled"
        @change="emit('update:modelValue', opt.id)"
      />
      <span v-if="modelValue === opt.id" class="mw-seg__tick" aria-hidden="true">✓</span>
      {{ opt.label }}
    </label>
  </fieldset>
</template>

<style scoped>
/* One bordered pill; each option is a cell. `overflow: hidden` clips the cells to the rounded corners. */
.mw-seg {
  display: inline-flex;
  margin: 0;
  padding: 0;
  min-inline-size: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
/* A visible legend takes its own row above the options (floated full width, as a fieldset legend otherwise sits in the border). */
.mw-seg__legend {
  float: inline-start;
  width: 100%;
  padding: var(--space-3xs) var(--space-xs);
  font-size: var(--font-size-sm);
}
/* `wrap`: more rows instead of horizontal scrolling when there are many options. */
.mw-seg--wrap {
  flex-wrap: wrap;
}
@media (width < 36em) {
  /* Two columns, or fewer when a larger text size or a narrower screen leaves no room for two: a label wraps rather than overflows. */
  .mw-seg--grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 7rem), 1fr));
  }

  .mw-seg--grid .mw-seg__item {
    white-space: normal;
    padding-block: var(--space-4xs);
    text-align: center;
  }
}

.mw-seg__item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3xs);
  /* Fixed height + horizontal-only padding: background fills the full cell cleanly with no top/bottom gap artefacts from
     line-height + padding interaction. */
  min-height: var(--space-md);
  padding: 0 var(--space-sm);
  /* Reset any host-app label margin (e.g. form label rules): items in a continuous segmented group carry no external margin. */
  margin: 0;
  border-right: 1px solid var(--border);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text);
  background: transparent;
  transition: background var(--transition-base), color var(--transition-base);
  user-select: none;
  white-space: nowrap;
}
.mw-seg__item:last-child {
  border-right: none;
}
/* Hover tints an inactive cell; the active one keeps its fill and its tick. */
.mw-seg__item:hover:not(.mw-seg__item--active) {
  background: var(--lift);
}
/* The chosen cell: the accent fill with its AAA-checked label colour (and a ✓ in the markup, so the choice is not colour alone). */
.mw-seg__item--active {
  background: var(--accent);
  color: var(--accent-contrast);
}

/* The radio itself is hidden, so surface its keyboard focus on the segment. */
.mw-seg__item:has(input:focus-visible) {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
/* A disabled option is greyed with a filter and takes no pointer input. */
.mw-seg__item--disabled {
  filter: grayscale(0.6);
  pointer-events: none;
  cursor: not-allowed;
}
/* Visually hidden but still focusable and in the accessibility tree (not display:none, which would remove it). */
.mw-seg__item input[type='radio'] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
