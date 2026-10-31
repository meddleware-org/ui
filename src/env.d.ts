/// <reference types="vite/client" />

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
