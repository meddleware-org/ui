#!/usr/bin/env node
// The brand files are derived from the vendored Kopimi K (src/brand/README.md): fail when the source changed without its recorded hash, or
// when a committed derived file is not what `npm run build:brand` writes now. Part of `npm test`.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { outputs, sourceHash } from './build-brand.mjs'

/** The brand folder. */
const dir = join(import.meta.dirname, '..', 'src', 'brand')
/** Everything wrong, so every problem is reported together rather than one per run. */
const errors = []
// 1. The vendored source must be the file the README's recorded hash describes (it is kept exactly as downloaded).
if (!readFileSync(join(dir, 'README.md'), 'utf8').includes(sourceHash())) errors.push('kopimi-k.svg does not match the SHA-256 in src/brand/README.md (the vendored file must stay as downloaded)')
// 2. Every derived file must be byte-identical to what the generator writes now (a stale mark or icon would ship silently otherwise).
for (const [name, data] of Object.entries(outputs())) {
  if (!readFileSync(join(dir, name)).equals(typeof data === 'string' ? Buffer.from(data) : data)) errors.push(`${name} is stale: run npm run build:brand`)
}
// Exit 1 on any problem, so `npm test` (which ends with this check) fails.
if (errors.length) {
  for (const e of errors) console.error(`brand check: ${e}`)
  process.exit(1)
}
console.log('brand check: the vendored mark matches its recorded hash and the derived files are current')
