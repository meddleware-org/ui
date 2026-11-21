// Source-level checks that the three text controls draw their edge in the 3:1 token (WCAG 1.4.11). axe cannot see this (it measures text), and
// the design-tokens contrast gate holds `--control-border`'s ratio, so the only thing left to prove is that each control actually uses it.
import { describe, expect, it } from 'vitest'
import input from '../components/UiInput.vue?raw'
import select from '../components/UiSelect.vue?raw'
import textarea from '../components/UiTextarea.vue?raw'

// WCAG 1.4.11: a text field is identified by its edge, so the edge needs 3:1 against the page. `--border` (a divider) is 1.3–1.4:1;
// `--control-border` is the token that the design-tokens contrast gate holds at 3:1 on every canvas in every theme × season.
describe('form-field boundaries', () => {
  for (const [name, source] of [['UiInput', input], ['UiTextarea', textarea], ['UiSelect', select]] as const) {
    it(`${name} draws its edge in --control-border, not in the divider colour`, () => {
      const css = source.split('<style')[1] ?? ''
      expect(css).toMatch(/border:\s*1px solid var\(--control-border\)/)
      expect(css).not.toMatch(/border:\s*1px solid var\(--border\)/)
    })
  }
})
