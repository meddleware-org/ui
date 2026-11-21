// Type augmentation for the vitest-axe `toHaveNoViolations` matcher.
// vitest 5's Assertion interface is generic over <R, T>; the matcher is
// registered at runtime via expect.extend in the a11y tests.
import 'vitest'
import type { AxeMatchers } from 'vitest-axe'

declare module 'vitest' {
  /** Adds `toHaveNoViolations` to `expect(...)` for an axe result. */
  interface Assertion<R, T> extends AxeMatchers {}
  /** The same matcher inside asymmetric matchers (`expect.objectContaining`). */
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
