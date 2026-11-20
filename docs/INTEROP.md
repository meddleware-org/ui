# Open standards and interoperability: ui

The shared Vue component library and styles.

This page lists what the project speaks today, what is planned, what was considered and does not apply, where someone else can extend it, and what proves each claim. The platform-wide list is [Standards we use](https://meddleware.dev/platform/standards). A row appears there in the same change that turns a standard on.

## Spoken today

- WCAG 2.2 AA and AAA contrast across every theme and season (the gallery's e2e)
- Native HTML elements, no ARIA where HTML has the element
- The Popover API and :has() with a no-script fallback (UiRoleGuide, UiFieldHint)

## Planned

- An export button (JSON or CSV download) for portability, used by every tool that holds a person's data

## Considered, not applicable

- Network standards: a component library; it makes no requests of its own

## Extension points

- Every component takes plain props and slots; tokens are CSS custom properties (@meddleware/design-tokens)

## What proves it

- src/__tests__ (components, dismissals, a11y, role guide)
- the gallery's five-browser e2e

_Maintained centrally with the platform's interoperability map; changes go through it so every repository says the same thing._
