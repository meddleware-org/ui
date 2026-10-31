import { vueApp } from '@meddleware/frontend-config/eslint'

// The fleet's Vue + TypeScript + accessibility + browser-compat config, with the template URL rules (`sui: true` also enforces the chain
// boundary, which ui has no business crossing).
export default vueApp({
  name: 'ui',
  sui: true,
  extra: [
    {
      // UiInput, UiTextarea and UiSelect are single-root wrappers around one native control: the label comes from their context
      // (UiFormField's label[for], or an aria-label passed as an attribute), so the rule cannot see it inside the primitive.
      name: 'ui/labelled-by-context',
      files: ['src/components/{UiInput,UiTextarea,UiSelect}.vue'],
      rules: { 'vuejs-accessibility/form-control-has-label': 'off' },
    },
  ],
})
