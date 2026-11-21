// Type declarations the compiler needs but no source file provides: Vite's client types, `.vue` files as components, and `?raw` imports.
/// <reference types="vite/client" />

/** A `.vue` file imported from TypeScript is a component; its real types come from vue-tsc when the file is checked. */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

/** Vite's `?raw` import: a file's text, as a string. */
declare module '*?raw' {
  const text: string
  export default text
}
