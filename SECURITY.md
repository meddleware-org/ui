# Security Policy

## Scope

This policy covers security issues in the `@meddleware/ui` package source (`src/**`) — the layout
shell (AppHeader/AppSidebar/AppFooter), the colour-mode control, and the shared primitives.

It does not cover:

- `@meddleware/design-tokens` or Vue (report to their own channels)
- A consuming application's own code, or URLs/props a consumer passes into these components

## Security model (invariants)

These invariants are load-bearing. A report demonstrating that any is violated is in scope and
treated as high severity:

1. **No dynamic HTML sinks.** No component uses `v-html`/`innerHTML`; all content renders through
   text or attribute binding. A slot or prop that reaches an HTML sink would be a vulnerability.
2. **URLs render into `<a :href>` only**, with `target="_blank"` links carrying
   `rel="noopener noreferrer"`, and only after `safeHref` / `safePath` (both exported):
   - `safeHref` accepts `https:` (and `http:` on localhost/127.0.0.1), refuses credentials in the authority
     (`https://good.example@evil.example/`), control characters, spaces and backslashes, and returns the
     normalised `URL.href`, so what is rendered is what was checked;
   - `safePath` accepts a single-slash root-relative path that resolves to the same site (`//host`,
     `/\host` and `/<TAB>/host` are refused).
   Any other scheme renders no `href` at all.
3. **No secrets, keys, wallet, or chain interaction.** This is a presentation kit; it holds no
   authority and performs no network calls except an explicit, text-rendered status fetch.

## Supported versions

Only the latest published npm version receives security fixes.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report vulnerabilities by emailing **<security@meddleware.co.uk>**. Include:

- A description of the vulnerability and its impact
- Steps to reproduce or a proof-of-concept (if available)
- The package version or commit SHA you tested against

You will receive an acknowledgement within **3 business days** and a resolution plan within
**14 days** for confirmed issues. Critical issues (CVSS ≥ 9.0) are prioritised for same-day
acknowledgement.

## Disclosure

Once a fix is released, a security advisory will be published on the GitHub repository. Reporters
may be credited by name unless they prefer to remain anonymous.
