# Security Audit — `ui`

**Classification:** Internal security review (re-verified; awaiting external review)
**Project:** ui (`@meddleware/ui`) — the shared Vue 3 component library for every Meddleware UI.

| Area | Contents |
| --- | --- |
| Layout shell | `AppHeader`, `AppSidebar`, `AppFooter` |
| Navigation | `SidebarItem`, `SidebarGroup`, `AppTabNav` + `UiTabPanel` |
| Primitives | dialog, form field, select, segmented control, stepper, notice, button, card |
| Desktop-console ("qt") set | panels, toolbars, data table, stat grid, status bar, activity feed |
| Chain-display helpers | `CopyableAddress`, `ExplorerLink`, `suiExplorerUrl` |
| Live status widget | `StatusWidget` (polls `status.meddleware.co.uk`) |
| Composables | `useColorMode`, `useSeason` |
| URL sanitisers | `safeHref`, `safePath` (0.1.31) |
| Display helper | `truncateMiddle` (0.1.31) |

**Project type:** Vue 3 component library (Vite library build → `dist/`).
**Template:**

- AUDIT_TEMPLATE.md (2026-10-08)
- AUDIT_TEMPLATE_VUE.md (2026-10-08) — mandatory; names `ui`
- AUDIT_TEMPLATE_TS.md (2026-10-08)

Not triggered: SUI, SUI_CLIENT (no chain access; `suiExplorerUrl` only builds links), SEAL, WALRUS,
AUTH, OPS, IMG (no image; consumers host it), SITE.

**Deployment status:**

- npm `@meddleware/ui` **0.1.31**, published by trusted publishing (OIDC) with an SLSA v1 provenance
  attestation; 47 files, about 112 kB unpacked (0.1.30 was 49 files, 11.8 MB). Tag `v0.1.31` =
  `19d0855`; `main` HEAD `fe87de4` adds only Dependabot merges (jsdom 30.1.2, the npm-minor-patch
  group) (2026-10-09).
- Requires `@meddleware/design-tokens` `^0.1.9` (per-theme seasons, `--warning-text`).
- Consumers: every Meddleware app — dashboard, landing, status-page, walrus-ui, access-gate-ui,
  seal-ui, dao-ui, treasury-ui, token-deployer-ui — plus walrus-relay and wallet-adapter (peer).

**Review date:** 2026-10-03; re-verified 2026-10-09
**Reviewer:** Internal review
**Severity ceiling:** Medium.

- It holds no secrets, signs nothing and reads no chain state.
- But it renders, in every app, the strings and links users act on:
  - addresses that users copy;
  - explorer links;
  - the global link and focus styling;
  - the modal dialog used for blocking upload progress;
  - the theme and season state.
- A defect can mislead users about what they copy or click, or make status and actions illegible.
  It cannot move funds by itself.
- Realised ceiling at this pass: **Low**; after the 0.1.31 fixes no finding is open at any severity.

**Status:** re-verified 2026-10-09 (first-pass baseline 2026-10-03, `v0.1.30`; fixes released in `v0.1.31`).

**Front matter (VUE lens):**

| Field | Value |
| --- | --- |
| Build tool | Vite 8.3.2 (library mode, ES only), `@vitejs/plugin-vue` 6.0.9, Vue 3.5.43 (dev; peer `^3.5.0`, externalised) |
| Hosting | none (a library). The legal documents live in `legal/` (repository only, not in the package) for apps to copy into their own `public/legal/` |
| Embedding hosts | every app above; tool views embed in dashboard |
| `VITE_*` inventory | none. Network-facing defaults are props: `StatusWidget.apiUrl` = `https://status.meddleware.co.uk/api/status`, `href` = `https://status.meddleware.co.uk` |

**Front matter (TS lens):**

| Field | Value |
| --- | --- |
| Package manager / lockfile | npm; `package-lock.json` committed |
| Module format | ESM (`dist/ui.js`) + declarations (`dist/**/*.d.ts`, `vue-tsc`) + `dist/base.css` |
| Publish model | bundled library (`files: ["dist"]`, `prepublishOnly` absent; built in the publish job) |
| Runtime targets | browsers through consumers' Vite builds |
| Peer dependencies | `vue ^3.5.0` |
| Runtime dependencies | `@meddleware/design-tokens ^0.1.9` (0.1.9) |

**Location:** `ui/docs/audit/ui-audit.md`.

> **Access note:** the 2026-10-09 re-verification used the local clone `repos/ui` at `main`
> (`fe87de4`). Nothing was changed, committed or pushed; the coverage plugin was installed
> `--no-save` and the generated `coverage/` removed afterwards.

---

## Executive summary

The library is 33 SFCs plus the TS modules (`safe-href`, `truncate`, `explorer`, `status`, `tabs`,
`internal/panel`) and two composables: about 3,700 lines including 10 test files. The first pass
(2026-10-03, `v0.1.30`) recorded nine findings, none above Low. **All of them were fixed in 0.1.31
(2026-10-08) and re-verified on 2026-10-09**; the re-verification added one further finding, fixed in
the same release (F11, the real-browser contrast gate's own catches).

**What holds (verified 2026-10-09):**

- **No dynamic HTML sinks.** No `v-html` or `innerHTML` anywhere.
- **Every external link sanitised.** External `href`s pass through `safeHref` (`https:` plus `http:`
  on localhost; no credentials, control characters, spaces or backslashes; returns the normalised
  `URL.href`) or, for root-relative paths, `safePath`. Links carry `target="_blank" rel="noopener noreferrer"`.
- **Explorer URLs.** `suiExplorerUrl` encodes the ID as one path segment against fixed SuiVision
  origins.
- **Status fetch.** `StatusWidget` has a 10-second timeout and validates the snapshot
  (`parseSnapshot`): unknown levels → `unknown`, names stripped of `<>&"`, rendered as text. It
  claims nothing before the first answer, polls at most every 15 s and not in a hidden tab.
- **Colour overrides.** Panel overrides flow through SFC CSS `v-bind()` into custom properties
  (`style.setProperty`), with no declaration breakout.
- **Dialog.** `UiDialog` uses the native modal `<dialog>` (inert page, top layer), with `closedby` and
  a backdrop fallback.
- **Stored colour mode.** `useColorMode` accepts only known stored values, and its watcher lives in
  a detached effect scope.
- **Quality gates.** Lint (stylelint with `color-no-hex`, eslint with vuejs-accessibility,
  html-validate), 77 unit tests (including axe over all 33 components), a **real-browser axe gate
  over a component gallery for every theme × season** (30 Playwright tests), a package-contents
  check, an expiring audit allowlist, SHA-pinned actions, a pinned npm, OIDC trusted publishing with
  provenance, and a release job that runs the same workflow as CI.

**Findings and their dispositions:**

1. **F1 — URL helpers could be steered off-site: RESOLVED.** `safeHref` now refuses credentials,
   control characters, spaces and backslashes and returns the normalised `URL.href`; the new
   `safePath` closes the `/<TAB>/evil.com` bypass in `CopyrightLine`.
2. **F2 — accessibility of the global styling: RESOLVED.** Links are underlined by default;
   `UiStepper` uses `--accent-contrast`; jsdom axe mounts all 33 components; a real-browser axe gate
   covers every theme × season (design-tokens 0.1.9 fixes the token-level contrast).
3. **F3 — address truncation helped address-poisoning: RESOLVED.** Default `[12, 10]`, a value that
   fits is shown whole, a zero count is handled, and `:truncate="false"` is used in the dao-ui and
   treasury-ui treasury views. The default itself is still `OQ1` for the maintainer.
4. **Info (F4–F9): RESOLVED**, except the Kopimi PDF's source and licence (F6 / `OQ2`, maintainer):
   - `useColorMode`'s watcher no longer dies with the first caller;
   - `StatusWidget` starts in "Checking status…";
   - the PDF left the package (tarball 11.8 MB → 112 kB) and other emitted assets keep hashed names;
   - `base.css` still bundles the global resets with the component styles — ACCEPTED-RISK, now
     documented as required;
   - CI has no `--if-present`, lint and a package-contents check run, and the release reuses CI;
   - no hard-coded colour fallbacks (stylelint `color-no-hex`);
   - SECURITY.md, CLAUDE.md and AGENTS.md describe the current behaviour.
5. **F11 — the contrast gate's own catches (new): RESOLVED.** The real-browser gate found shell-slot
   link, opacity-dimmed text and badge-tint failures that no earlier check could see; all fixed in 0.1.31.

**Posture:**

- The rendering surface is clean: no HTML sinks, sanitised links, validated remote data.
- The guarantees that tests could not exercise at the first pass (contrast, URL edge cases,
  truncation edges) now have tests that do, and CI runs them on every tag.
- What remains is maintainer-side: the Kopimi PDF's source and licence (`OQ2`), the truncation
  default (`OQ1`) and external review before mainnet.

---

## Threat model / trust boundaries

### Frontend actor matrix (VUE lens)

| Actor | What it controls | Bounded by |
| --- | --- | --- |
| End user | clicks, copies, theme choice | the components' rendering; underlined links and the contrast gate (F2, F11), long default truncation (F3) |
| Embedding host / consuming app | props (URLs, colours, labels, chars), slots, global CSS order | `safeHref` / `safePath` (F1); CSS `v-bind` custom properties; SECURITY.md invariant 2 |
| **Authors of on-chain data the apps render through these components** (event senders, object IDs, coin types) | the strings shown in `CopyableAddress` / `ExplorerLink` | text rendering only; `encodeURIComponent` in `suiExplorerUrl`; `[12, 10]` truncation and `:truncate="false"` (F3) |
| Status endpoint (`status.meddleware.co.uk`) | the snapshot JSON | `parseSnapshot` (validated, text-rendered); 10-second timeout; starts in "Checking status…" (F5) |
| design-tokens | every colour and spacing role | consumed as CSS variables; contrast is inherited and now gated per theme × season (F2, F11; design-tokens 0.1.9) |
| Static host | headers | consumers (VUE-M8 is theirs) |

### Supply chain & input matrix (TS lens)

| Actor / source | Controls | Bounded by |
| --- | --- | --- |
| Dependency authors | runtime: `@meddleware/design-tokens`; peer: `vue`; dev: Vite, plugin-vue, vue-tsc, eslint, stylelint, html-validate, vitest, axe, Playwright | lockfile; `npm ci`; audit gate (1 allowlisted dev advisory); `npm audit --omit=dev` clean; weekly grouped Dependabot |
| Untrusted inputs | status JSON; on-chain strings passed by apps | `parseSnapshot`; text interpolation |
| Third-party content | `legal/powr.broccoli-kopimi.pdf` (11.6 MB; repository only since 0.1.31, apps copy it) | SHA-256 recorded in `legal/README.md`; source and licence still unrecorded (F6, `OQ2`) |

---

## Severity scale

Critical / High / Medium / Low / Info / Positive.

## Scope

**In scope (first pass `1c74afb` = tag `v0.1.30`; re-verified at tag `v0.1.31` = `19d0855` and `main` `fe87de4`):**

- `src/**`: 33 SFCs, `safe-href.ts`, `explorer.ts`, `status.ts`, `tabs.ts`, `internal/panel.ts`,
  `composables/{useColorMode,useSeason}.ts`, `styles/base.css`, `index.ts`, and the tests
- `legal/*` (moved out of `public/` in 0.1.31), `gallery/**`, `e2e/**`, `playwright.config.ts`
- `vite.config.ts`, `tsconfig*.json`, eslint, stylelint and html-validate configs
- `package.json`, the lockfile
- `.github/**`
- `README.md`, `CLAUDE.md`, `AGENTS.md`, `SECURITY.md`, `CHANGELOG.md`

**Cross-repo evidence (read-only, local clones):**

- consumers' use of `useColorMode`, `useSeason`, `CopyableAddress`/`ExplorerLink` and `base.css`;
- design-tokens role values (contrast).

**Out of scope:** design-tokens' own values (its audit); consumers' hosting headers (their audits).

**Environment / commands (first pass 2026-10-03, Node 22.22.2; re-verified 2026-10-09, Node 24.13.0, `main` `fe87de4`):**

| Command | Result 2026-10-09 (first pass in brackets) |
| --- | --- |
| `npm ci` | clean |
| `npm run type-check` (`vue-tsc`) | clean |
| `npm run lint` (stylelint + eslint + html-validate) | exit 0 |
| `npx vitest run` | **77 passed** (10 files) [49 passed, 7 files] |
| `npx vitest run --coverage` (coverage plugin installed `--no-save`) | **84.43% statements / 72.17% branches / 75.78% functions / 91.53% lines** [66.48 / 58.48 / 64.44 / 73.22]. `safe-href.ts` 90.5 / 95.7; `StatusWidget` 100 / 87.5; `ExplorerLink` 85.7 / 75; `UiStepper` 76.9 / 80; `useColorMode` 77.4 / 58.8 |
| `npx playwright test` (Chromium, gallery served by `vite preview`) | **30 passed**: `all`, `panels` and `dialog` views × light/dark × default/spring/summer/autumn/winter |
| `node .github/audit-gate.mjs` | 1 high (GHSA-vfj7-8cjw-p6xm, braces via stylelint/eslint tooling; allowlisted to 2027-01-01), 0 not allowlisted |
| `npm run build` | `dist/ui.js` 34.2 kB, `dist/base.css` 24.7 kB, declarations; no `dist/legal` |
| `npm pack --dry-run` | **47 files, 28 kB packed / 112 kB unpacked** [49 files, 1.6 MB packed / 11.8 MB unpacked, 11.6 MB of it the PDF] |
| `npm view @meddleware/ui` | 0.1.31; SLSA v1 provenance attestation |
| First-pass scratch probes (jsdom; deleted) | `CopyrightLine` `symbolHref` variants; `safeHref` edge inputs; truncation with `chars` edge values; `useColorMode` after the first caller unmounts. These are now permanent tests (`safe-href.test.ts`, `safety.test.ts`, `truncation.test.ts`, `truncate.test.ts`) |
| PDF inspection (first pass) | no `/JavaScript`, `/OpenAction`, `/Launch`, `/EmbeddedFile`, `/URI`, `/AcroForm`; the `/AA` hits are base64 inside XMP thumbnails. Adobe Illustrator/Photoshop CS3 artwork; SHA-256 `6887d78b…1480` (unchanged; recorded in `legal/README.md`) |

The clone was left clean (`dist/`, `gallery-dist/`, `test-results/` are ignored by git; the
generated `coverage/` was removed). Coverage was not re-measured by the maintainer's CI: it is a
local figure.

---

## Findings

### F1 — URL helpers can be steered off-site: a whitespace bypass in `CopyrightLine`, and userinfo accepted by `safeHref`

**Severity:** Low (needs a consumer-supplied value; the helpers' stated guarantees fail)
**Disposition:** RESOLVED (0.1.31, `10d822b`)
**Where (first pass, `v0.1.30`):** `src/components/CopyrightLine.vue:46-48` (`symbolLink`:
`/^\/(?![/\\])/.test(href) ? href : safeHref(href)`); `src/safe-href.ts:8-19`. Now `src/safe-href.ts` and
`CopyrightLine.vue:45-47`.

**Issue (probe-verified):**

`symbolLink` is documented as "a root-relative path (never `//host` or `/\host`, which leave the
site)". The regex inspects only the second character. Probe results, resolved against
`https://dash.meddleware.co.uk/x`:

| `symbolHref` | Rendered `href` | Resolves to |
| --- | --- | --- |
| `/legal/x.html` | itself | same site ✓ |
| `//evil.com`, `/\evil.com` | default `/legal/copyright.html` | same site ✓ |
| **`/\t/evil.com`** | `"/\t/evil.com"` | **`https://evil.com/`** |
| **`/\n/evil.com`** | `"/\n/evil.com"` | **`https://evil.com/`** |

The URL parser removes ASCII tab and newline before resolution, so `/<TAB>/evil.com` becomes
`//evil.com`.

`safeHref` problems:

- **Userinfo accepted.** It allows `https://suivision.xyz@evil.com/account/0x1` (host `evil.com`).
  The visible prefix looks like the explorer — a classic deceptive link. A backslash form
  (`https://evil.com\@good.com`) is also accepted.
- **Raw input returned.** It returns the original string rather than the parsed `URL.href`, so
  leading whitespace and odd casing pass through un-normalised.
- **No test coverage.** `safe-href.test.ts` covers the schemes but none of these cases.

**Impact:**

- Values come from consumer props, which SECURITY.md declares trusted. But the components advertise
  these checks as the safety boundary, and consumers rely on them: `ExplorerLink` and `StatusWidget`
  pass `href` straight to `safeHref`.
- A config- or data-derived value (for example an `href` built from an untrusted host string)
  becomes an off-site or deceptive link.

**Remediation / evidence:**

- `symbolLink`: parse with `new URL(href, location.origin)` and require `u.origin === location.origin`,
  or reject any C0 control character and whitespace before the regex.
- `safeHref`: reject `u.username || u.password`; return `u.href` (normalised); optionally reject
  backslashes.
- Add the probe cases to `safe-href.test.ts` and a `CopyrightLine` test.

**Resolution (2026-10-09 re-verification):** fixed as proposed in 0.1.31 (`10d822b`, CHANGELOG
*Security*). `safe-href.ts` rejects `[\u0000-\u0020\u007f\\]` anywhere in the input (`UNSAFE_CHARS`),
rejects `u.username || u.password`, and returns the normalised `u.href`. New exported `safePath`
accepts only a single-slash root-relative path that resolves to the same origin (checked against a
stand-in origin), returning `pathname + search + hash`. `CopyrightLine.symbolLink` is now
`href.startsWith('/') ? safePath(href) : safeHref(href)`. Pinned by `safe-href.test.ts` (userinfo,
backslash, control-character and normalisation cases; `safe-href.ts` 90.5% statements, 95.7% branches)
and `__tests__/safety.test.ts` (the `/<TAB>/evil.com` and `//host` cases fall back to the default
link). SECURITY.md invariant 2 states the new behaviour. The helpers are in the public exports
(`safeHref`, `safePath`; AGENTS.md exports table).

### F2 — Accessibility: colour-only links, a hard-coded badge colour, and a11y tests that cannot see contrast

**Severity:** Low (accessibility across every app)   **Disposition:** RESOLVED (0.1.31, `10d822b`)
**Where (first pass, `v0.1.30`):** `src/styles/base.css:76-83` (`a { color: var(--accent); text-decoration: none }`,
underline on hover only); `src/components/UiStepper.vue:117-120` (`color: #fff` on
`background: var(--accent)`); `src/components/ExplorerLink.vue:41`; `src/__tests__/a11y.test.ts`.

**Issue:**

- **Links rely on colour alone.** With underlines removed globally, in-text links are distinguished
  from body text only by colour until hover. WCAG 1.4.1 (technique G183) requires ≥ 3:1 between link
  and surrounding text **plus** a non-colour cue on focus and hover. Computed link vs `--text`:

| Theme · season | Link vs text |
| --- | --- |
| light, default | 3.18:1 (passes narrowly) |
| **dark, default** | **2.54:1** (fails) |
| light, winter | **2.51:1** (fails) |
| light, spring | 4.30:1 |
| light, autumn | 5.16:1 |

  Link colours also inherit the seasonal accent-on-canvas failures in design-tokens F1 (about 3.0:1
  for autumn links on light).
- **Hard-coded badge colour.** `UiStepper` done-badges render `#fff` on `--accent`: 5.36:1 in light,
  but **3.01:1** in dark, where `--accent` is `#e07850` and the token's `--accent-contrast` is
  `#201b19` (5.66:1). `UiButton` and `UiSegmentedControl` use `--accent-contrast` correctly.
- **The tests cannot check contrast.**
  - axe runs in jsdom, which has no layout or computed colours, so the `color-contrast` rule cannot
    evaluate.
  - The tests load no design-token CSS and set no `data-theme` or `data-season`.
  - 11 of 33 components are not mounted at all: `CopyableAddress`, `ExplorerLink`, `StatusWidget`,
    `UiBadge`, `UiDataTable`, `UiFieldHint`, `UiNotice`, `UiStatusDot`, `UiStepper`, `UiToolIntro`,
    `UiToolbarButton`.
  - CLAUDE.md states that `a11y.test.ts` "runs axe over every component".

**Impact:**

- In dark mode, the default for most apps (`useColorMode('dark')`), links in prose are not reliably
  perceivable.
- Seasonal palettes compound this.
- The test suite gives false assurance on contrast.

**Remediation / evidence:**

- Underline links in running text (`a:where(:not([class]))`, or underline by default with opt-out
  classes for nav and buttons). Or make sure link vs text is ≥ 3:1 in every theme × season, keeping
  the focus and hover cue.
- Use `var(--accent-contrast)` in `UiStepper`.
- Add a Playwright + axe run (real browser) over a component gallery loaded with `tokens.css` +
  `seasons.css`, across `data-theme` × `data-season`.
- Mount the 11 missing components in `a11y.test.ts`.

**Resolution (2026-10-09 re-verification):** all four remediation items landed in 0.1.31
(`10d822b`).

- **Underlined links.** `base.css:78-87` now sets `text-decoration: underline` (thickness and offset
  tokens, thicker on hover), so links no longer rely on colour alone (WCAG 1.4.1 non-colour cue). The
  link/text ratio table above is the first-pass measurement; the token-level seasonal failures are
  fixed in design-tokens 0.1.9 (per-theme seasons, contrast gate).
- **`UiStepper`** uses `--accent-contrast` instead of `#fff`.
- **Real-browser gate.** `gallery/ComponentGallery.vue` + `e2e/contrast.spec.ts` run Playwright +
  axe (`wcag2a/aa`, `wcag21a/aa`, `wcag22aa`, best-practice, including `color-contrast`) over the
  `all`, `panels` and `dialog` views for light/dark × default/spring/summer/autumn/winter: **30 tests,
  all pass on 2026-10-09**. CI runs them as the `e2e` job (Chromium) in `node-ci.yml`, and the release
  workflow reuses that file, so a tag cannot ship what the gate rejects.
- **jsdom axe** now mounts all 33 components (`a11y.test.ts`); CLAUDE.md states plainly that jsdom
  cannot run `color-contrast` and points at `npm run test:e2e`. The gate's own catches are F11.

### F3 — Address truncation aids address-poisoning; truncation edge cases misrender

**Severity:** Low   **Disposition:** RESOLVED (0.1.31, `10d822b`; the default itself is `OQ1`)
**Where (first pass, `v0.1.30`):** `src/components/CopyableAddress.vue:13-27`; `src/components/ExplorerLink.vue:12-28`
(`chars` default `[6, 4]`, `` `${v.slice(0, pre)}…${v.slice(-suf)}` ``).

**Issue (probe-verified):**

- **Default display.** For a 66-character Sui address the default shows `0xabab…abcd`: **4 hex
  characters of prefix and 4 of suffix**.
  - Address-poisoning attacks generate vanity addresses matching the first and last few characters,
    then plant them in a user's history.
  - These components display exactly such histories: dao-ui `HistoryTab` renders every
    `AccessMinted`/`Consumed` sender. They also show the treasury address (dao-ui Treasury,
    Overview and Governance tabs) and the connected account (dashboard, access-gate-ui).
  - Copying copies the full value of the row, but the *row choice* is made from the truncated text.
  - Only walrus-ui raises it (`[8, 6]`, for blob IDs).
- **`chars: [n, 0]`.** `slice(-0)` returns the **whole** string, so the label prints the prefix,
  then `…`, then the full value (probe: `0xabab…0xabab…cd`).
- **Short values.** A value shorter than `pre + suf` is duplicated (probe: `0x1…0x1`).

**Impact:** a user who copies an address from history or overview screens by eye can pick an
attacker's look-alike. The edge cases misrender.

**Remediation / evidence:**

- Raise the default for 32-byte IDs (for example 10 hex characters each side after `0x`, i.e.
  `[12, 10]`).
- Offer a `full` mode for treasury and recipient contexts, and consider grouping characters for
  readability.
- Fix the edge cases: no truncation when `pre + suf >= length`, and handle `suf = 0`.
- Add tests (both components are at or near 0% coverage).

**Resolution (2026-10-09 re-verification):** `src/truncate.ts` adds the exported `truncateMiddle` and
`DEFAULT_TRUNCATE_CHARS = [12, 10]` (`0x` plus 10 hex characters, then the last 10). A value not
longer than `pre + suf` is returned whole; a zero count drops that side (no `slice(-0)`); counts are
clamped to non-negative integers. `CopyableAddress` and `ExplorerLink` both use it and take
`:truncate="false"` for contexts where a user chooses where funds go. Consumers: dao-ui and
treasury-ui pass `:truncate="false"` for the treasury address (`GovernanceTab`, `OverviewTab`,
`TreasuryTab`, `AccountsTab`); event-history senders (dao-ui `HistoryTab`, treasury-ui `ActivityTab`)
and the dashboard account use the longer default; walrus-ui keeps its own `[8, 6]` for blob IDs
(not account addresses). Pinned by `truncate.test.ts` and `__tests__/truncation.test.ts`
(default, `truncate=false`, short values, zero counts, `ExplorerLink` parity).
`OQ1` stays open: the maintainer has not been asked which contexts must always show the full value.

### F4 — `useColorMode`'s watcher is bound to the first caller's component

**Severity:** Info (latent: every current consumer calls it first in `App.vue` or `main.ts`)
**Disposition:** RESOLVED (0.1.31, `10d822b`)
**Where (first pass):** `src/composables/useColorMode.ts:35-73`.

**Issue (probe-verified):**

- The module-singleton initialisation runs `watch(mode, …)` inside whichever call comes first.
- Inside a component `setup`, that watcher belongs to the component's effect scope and **stops when
  the component unmounts**.
- Probe: the first call was in a component that then unmounted. A later `useColorMode().set('dark')`
  left `data-theme="light"` and stored nothing.
- The singleton promise ("import it anywhere; all callers share the same state") therefore depends
  on call order.
- The `matchMedia` listener is never removed (acceptable for a singleton).

**Impact:**

- If an embedded tool view (for example one inside a kept-alive dashboard tab) ever becomes the
  first caller and is unmounted, theme switching silently stops applying and persisting.
- Today, dashboard and token-deployer-ui call it in `main.ts`, and the others in `App.vue`.

**Remediation / evidence:** create the watcher in a detached `effectScope(true)` at module
initialisation, or watch outside any component. Add the probe as a test.

**Resolution (2026-10-09 re-verification):** done in 0.1.31: `useColorMode.ts` creates the `watch(mode, …)`
inside `effectScope(true).run(…)` with a comment explaining why. The probe is now the test "keeps
applying and persisting after the component that called it first unmounts" in
`__tests__/safety.test.ts`. The `matchMedia` listener is still never removed (a singleton; accepted).

### F5 — `StatusWidget` claims "All systems operational" before it knows

**Severity:** Info   **Disposition:** RESOLVED (0.1.31, `10d822b`)
**Where (first pass):** `src/components/StatusWidget.vue:36-58`.

**Issue / Impact:**

- The initial state is `ok` with the label "All systems operational" until the first fetch
  resolves. That shows during the up-to-10-second timeout window, and indefinitely in SSR or a
  pre-render.
- `pollInterval` is unvalidated (`0` or a tiny value hammers the endpoint), and polling continues
  in hidden tabs.
- The component has 0% coverage.

**Remediation / evidence:**

- Start in `unknown` ("Checking status…").
- Clamp `pollInterval` (e.g. ≥ 15 s) and pause on `document.hidden`.
- Add tests with a mocked `fetch`.

**Resolution (2026-10-09 re-verification):** the state starts as `checking` with the label "Checking status…"
(also what SSR renders); `pollInterval` is raised to at least `MIN_POLL_MS = 15_000`; polling skips
hidden tabs (`document.hidden`) and catches up on `visibilitychange`; the listener and timer are removed
on unmount. `__tests__/status-widget.test.ts` (mocked `fetch`): claims nothing before the first answer,
raises a tiny interval, no polling while hidden. `StatusWidget.vue` is at 100% statements.

### F6 — Packaging: an 11.6 MB third-party PDF in every install; the build's asset naming; coupled global CSS

**Severity:** Info   **Disposition:** RESOLVED for the PDF and the asset naming (0.1.31, `10d822b`); ACCEPTED-RISK for the coupled CSS (documented as required); the PDF's source and licence are `OQ2` (maintainer)
**Where (first pass):** `public/legal/powr.broccoli-kopimi.pdf` → `dist/legal/`; `vite.config.ts:21`
(`assetFileNames: () => 'base.css'`); `src/index.ts:5` + `src/styles/base.css`.

**Issue / Impact:**

- **The PDF.** It is 98% of the tarball (11.6 of 11.8 MB unpacked), installed in every consumer's
  `node_modules` and every CI cache.
  - It is third-party artwork (Adobe Illustrator/Photoshop CS3 metadata) with no recorded source,
    licence or checksum in the repo. Kopimi is permissive in spirit, but the provenance is
    undocumented.
  - It has no active content (no JavaScript, actions or embedded files).
  - It is linked from `CopyrightLine` (kopimi), and consumers copy it into their `public/` by hand
    (CLAUDE.md).
- **Asset naming.** `assetFileNames: () => 'base.css'` gives **every** emitted asset that name.
  Today only the CSS is emitted, but any future font or image import would overwrite it or collide
  silently.
- **Coupled CSS.** `dist/base.css` contains both global element rules (`html`, `body`, `a`,
  `:where(img, svg, …)`, `:where(menu)`, the focus ring) **and** every component's scoped styles.
  - Consumers cannot take the component styles without the global resets (VUE-M9 tension for
    embedded tool views).
  - CLAUDE.md and AGENTS.md describe `base.css` as "optional element defaults", but without it every
    component is unstyled. Nine consumers import it.

**Remediation / evidence:**

- Move the PDF out of the package (host it once on the docs or landing site, or ship a small
  optimised version), and record its source and licence and SHA-256.
- Use `assetFileNames: (a) => a.name?.endsWith('.css') ? 'base.css' : 'assets/[name]-[hash][extname]'`.
- Split `reset.css` (global, opt-in) from `components.css` (scoped), or document `base.css` as
  required.

**Resolution (2026-10-09 re-verification):**

- **PDF out of the package.** The legal files moved from `public/legal/` to `legal/` (repository
  only; `publicDir: false` in `vite.config.ts`). Tarball 11.8 MB → 112 kB unpacked, 47 files
  (`npm pack --dry-run` today). `legal/README.md` records the SHA-256 and says plainly that the
  source and licence were not recorded and the file has no active content. Apps copy the files they
  link to. The source and licence themselves are still unknown: `OQ2`, a maintainer item.
- **Asset naming.** `assetFileNames` now maps a CSS asset to `base.css` and any other emitted asset
  to `assets/[name]-[hash][extname]`, so nothing overwrites the stylesheet.
- **Coupled CSS: ACCEPTED-RISK.** `dist/base.css` still carries the global element rules and every
  component's scoped styles. This is now documented as required (CLAUDE.md, AGENTS.md: "required:
  element defaults + the components' scoped styles"), and all nine consumers import it. Splitting it
  would add an import for every consumer for no security gain; A10 stays a recorded GAP.

### F7 — CI and release details

**Severity:** Info   **Disposition:** RESOLVED (0.1.31, `10d822b`)
**Where (first pass):** `.github/workflows/node-ci.yml:35-47`, `npm-publish.yml:28-34`.

- Every CI step after type-check uses `--if-present`, so a renamed script would skip silently.
- Publish `verify` runs type-check, test and build only: **no lint** (stylelint, eslint with the a11y
  plugin, html-validate).
- No `npm pack --dry-run` file-list check (it would have flagged F6's PDF).
- Positives: SHA-pinned actions, npm pinned (`npm@11.20.0`), OIDC `--provenance`, tag = version,
  expiring audit allowlist.

**Remediation / evidence:** drop `--if-present`; run `npm run lint` in `verify`; add a pack-size and
file-list assertion.

**Resolution (2026-10-09 re-verification):** `node-ci.yml` runs `npm ci`, the audit gate, type-check,
lint, tests, build, a package-contents step (`npm pack --dry-run --json`: only `dist/`, `package.json`,
`LICENSE`, `README.md`, `CHANGELOG.md`; `dist/ui.js` and `dist/base.css` present; unpacked size under
1 MB) and the `e2e` job, with no `--if-present`. `node-ci.yml` also has `workflow_call`, and
`npm-publish.yml`'s `verify` job is `uses: ./.github/workflows/node-ci.yml`, so the tag runs exactly
CI (release gate equals CI). Dependabot (`.github/dependabot.yml`: npm and github-actions, weekly,
grouped) was added in `3a00e4b`; the 2026-10-09 grouped merges are `91bedaf` and `fe87de4`.

### F8 — Hard-coded colour fallbacks

**Severity:** Info   **Disposition:** RESOLVED (0.1.31, `10d822b`)
**Where (first pass):** `CopyableAddress.vue:109-118`, `ExplorerLink.vue:41-47` (`var(--accent, #6366f1)`,
`var(--text, #f0f0f0)`, `var(--muted, #6e635c)`); `UiStepper.vue:120` (`#fff`);
`internal/panel.ts:48-61` (token hexes duplicated as fallbacks).

**Issue / Impact:**

- CLAUDE.md says "Never hardcode rems/hexes". `#6366f1` is an indigo/purple outside the palette (the
  design philosophy excludes purple), and `#f0f0f0` hover text is near-white, which is invisible on
  light canvases if tokens fail to load.
- The `panel.ts` fallbacks duplicate design-token values and will drift silently when tokens are
  retuned.

**Remediation / evidence:** drop the fallbacks (tokens are a declared dependency), or use role-
consistent fallbacks. Add a stylelint rule (`color-no-hex` in components).

**Resolution (2026-10-09 re-verification):** the fallbacks are gone from `CopyableAddress`, `ExplorerLink`,
`UiStepper` and `internal/panel.ts` (which now reads `--mw-panel-*` tokens directly, relying on
design-tokens ^0.1.9); `stylelint.config.js` sets `'color-no-hex': true` and `npm run lint` passes.
The only hex literals left in `src/` are test fixtures in `internal/panel.test.ts`.

### F9 — Documentation drift

**Severity:** Info   **Disposition:** RESOLVED (0.1.31, `10d822b`)

| Document | Drift |
| --- | --- |
| SECURITY.md invariant 2 | "the kit does not currently reject `javascript:`/`data:` schemes — treat consumer-supplied URLs as trusted" (it now does, via `safeHref`; see F1 for the remaining gaps) |
| CLAUDE.md | "`src/__tests__/a11y.test.ts` runs axe over every component" (11 missing — F2); `base.css` "optional element defaults" (F6) |
| AGENTS.md | exports table lists 12 of about 40 exports; composables "(useColorMode)" only; publishing via `publish.yml` (actual `npm-publish.yml`) |
| `base.css:89-90` | "focus ring … blue — never reads as an error" (tokens: slate by default; red in summer, design-tokens F1) |

**Resolution (2026-10-09 re-verification):** SECURITY.md invariant 2 now describes `safeHref` / `safePath`
as implemented; CLAUDE.md says `a11y.test.ts` mounts every component in jsdom (structure and ARIA
only), points at `npm run test:e2e` for colour, and calls `base.css` required; AGENTS.md lists
`safeHref`/`safePath`/`truncateMiddle` and names `npm-publish.yml`. The `base.css` focus-ring comment
now reads "slate or blue, never red".

### F10 — Positive: a clean rendering surface with sanitised links and validated remote data

**Severity:** Positive

- **No HTML sinks.** No `v-html` or `innerHTML`; all content uses text interpolation.
- **Sanitised external links.** All go through `safeHref`, which allows only `https:` plus
  localhost `http:`, so `javascript:` and `data:` are rejected. All carry
  `rel="noopener noreferrer"`.
- **`suiExplorerUrl`.** Fixed SuiVision origins per network; the ID `encodeURIComponent`-ed into one
  path segment.
- **`StatusWidget` / `parseSnapshot`.** Strict top-level shape, coerced levels, sanitised names,
  drops nameless entries, an `AbortSignal.timeout(10_000)`, and the label is chosen from a fixed map.
- **Colour overrides.** Per-instance colours go through SFC CSS `v-bind()` (custom properties set via
  the CSSOM), so values cannot break out into other declarations. No `:style` string concatenation.
- **`UiDialog`.** A native modal `<dialog>` (inert background, focus restore, top layer). `closedby`
  plus a scripted backdrop fallback; non-dismissible mode blocks Escape.
- **`AppTabNav`.** The WAI-ARIA tabs pattern with roving tabindex.
- **`useColorMode`.** Stored values allow-listed; storage errors tolerated.
- **Gates.**
  - `vue-tsc`, eslint (including `eslint-plugin-vuejs-accessibility`), stylelint and html-validate.
  - 77 unit tests (axe over all 33 components, behaviour, safety, parsers, truncation, status widget)
    and 30 real-browser axe tests across every theme × season (re-counted 2026-10-09).
  - Vue externalised (peer).
  - npm provenance on 0.1.31.
- **`safePath`.** Root-relative links are validated against a stand-in origin and rejected if they
  contain control characters, a leading `//`, or resolve elsewhere (re-verified 2026-10-09).
- **Slim package.** 47 files, 112 kB unpacked, whitelisted by `files: ["dist"]` and asserted in CI.

### F11 — The real-browser contrast gate found and fixed contrast failures that no earlier check could see (added 2026-10-09)

**Severity:** Low (accessibility across every app)   **Disposition:** RESOLVED (0.1.31, `10d822b`)
**Where:** `src/components/AppHeader.vue`, `AppSidebar.vue`, `AppFooter.vue`, `SidebarGroup.vue`,
`UiStatusBar.vue`, `UiBadge.vue`, `src/internal/panel.ts`.

**Issue:** when the Playwright + axe gate (F2) was first run over every theme × season it reported
failures the jsdom suite could not compute:

- links slotted into the header, sidebar or footer drew the page accent on a panel of the *other*
  theme (a light header on a dark page);
- sidebar-group labels, pending status-bar items and footer links were dimmed with `opacity` (0.75,
  0.6, 0.7), taking them below 4.5:1;
- badge tints (`color-mix(... 20%, transparent)`) took the badge text below 4.5:1;
- the pending badge used the bright `--warning` as text colour.

**Impact:** text and links in the shared shell were hard to read in some theme × season combinations,
in every app that uses the shell.

**Remediation / evidence:** all fixed in 0.1.31 (`10d822b`, CHANGELOG *Fixed*): slotted shell links take
`color: inherit` (header) or the panel's own role; dimming by opacity is replaced by weight, italics or
the panel's muted role; badge tints are 10%; the pending badge uses `--warning-text` (design-tokens
0.1.9). The gate itself (F2) pins all of them: 30 tests pass on 2026-10-09. Recorded here because the
first pass could not have found them, and so that the gate is understood as a finding source, not
only a check.

---

## Section A — Invariant verification matrix

| # | Invariant (source) | Enforced at | Proven by | Status |
| --- | --- | --- | --- | --- |
| A1 | No dynamic HTML sinks (SECURITY.md 1) | components | grep; html-validate | HOLDS |
| A2 | External URLs sanitised; `noopener` (SECURITY.md 2; VUE-M1) | `safeHref`, `safePath`, components | `safe-href.test.ts`, `__tests__/safety.test.ts` | HOLDS — F1 |
| A3 | No secrets, wallet or chain; only the status fetch (SECURITY.md 3) | — | grep | HOLDS |
| A4 | Remote status rendered as validated text; nothing claimed before observed | `parseSnapshot`, `StatusWidget` | `status.test.ts`, `__tests__/status-widget.test.ts` | HOLDS — F5 |
| A5 | Displayed identifiers resist look-alikes; edge cases render correctly | `truncateMiddle`, `CopyableAddress`, `ExplorerLink` | `truncate.test.ts`, `__tests__/truncation.test.ts` | HOLDS — F3 (default is `OQ1`) |
| A6 | Accessible by default, including contrast in every theme × season | `a11y.test.ts` (jsdom: structure, ARIA), `e2e/contrast.spec.ts` (real browser) | 77 unit + 30 browser tests | HOLDS — F2, F11 |
| A7 | Colour-mode singleton independent of call order (CLAUDE.md) | `useColorMode` (detached `effectScope`) | `__tests__/safety.test.ts` | HOLDS — F4 |
| A8 | Tokens only; no hard-coded hex (CLAUDE.md) | stylelint `color-no-hex` | `npm run lint` | HOLDS — F8 |
| A9 | Vue a peer, not bundled | `vite.config.ts` external | build output | HOLDS |
| A10 | Embedded library free of global CSS (VUE-M9) | — | `dist/base.css` | GAP — F6 (ACCEPTED-RISK: global resets ship with the component styles; documented as required) |

---

## Section B — Supply-chain, publish-authority & capability matrix

### B.1 Dependency & CVE risk

| Dependency | Range (installed) | Shipped? | Status |
| --- | --- | --- | --- |
| `@meddleware/design-tokens` | `^0.1.9` (0.1.9) | yes (CSS variables consumed) | clean; see its audit |
| `vue` | peer `^3.5.0` (dev 3.5.43) | external | clean |
| Dev toolchain (vite 8.3.2, plugin-vue 6.0.9, vue-tsc 3.3, typescript 6.0.3, eslint 10, stylelint 17, html-validate 11, vitest 5.0.2, jsdom 30, axe, Playwright 1.63) | lockfile | no | 1 high via braces (allowlisted to 2027-01-01, repository-controlled globs); `npm audit --omit=dev` clean |

**Shared-dependency matrix (TS lens).** No `@mysten/*` dependency (the library has no chain access).
`vue` peer `^3.5.0` / dev `^3.5.43`; `typescript` `^6.0.0`; `vitest` `~5.0.2`. No deviation from the
workspace baseline (TypeScript 7 is deferred by decision; vitest 5 current).

### B.2 Publish authority & CI

| Authority | Where | Custody | Gates |
| --- | --- | --- | --- |
| npm publish `@meddleware/ui` | `npm-publish.yml` (tag `v*`) | OIDC trusted publishing + `--provenance`; npm 11.20.0; no long-lived token | `verify` = the full `node-ci.yml` (audit gate, type-check, lint, unit + axe tests, build, package-contents check, real-browser contrast) on the tagged commit |

#### CI & release integrity

| Item | Holds? | Evidence |
| --- | --- | --- |
| Actions pinned | Yes | full-SHA pins in both workflows |
| Least privilege | Yes | top-level `contents: read`; `id-token: write` on the publish job only |
| OIDC trusted publishing | Yes | `npm publish --provenance`; 0.1.31 carries an SLSA v1 attestation |
| Tag-gated, idempotent publish | Yes | `v*` tag; tag = `package.json` version check; registry 200 check and "already published" treated as success |
| Release gate equals CI | Yes | `verify: uses: ./.github/workflows/node-ci.yml` (`workflow_call`) |
| Automated dependency updates | Yes | `.github/dependabot.yml`: npm and github-actions, weekly, grouped; triage 2026-10-09 merged the minor/patch group |
| Audit gate with expiry | Yes | `.github/audit-gate.mjs`, one entry expiring 2027-01-01 |
| Lint in publish verify | Yes | F7 |
| Tarball content check | Yes | F6, F7 |
| Secrets never echoed; real funds manual; test-only modes | N/A | no secrets, no chain, no test build mode (the gallery is a separate Vite config, not shipped) |

### B.TS-1 Packaging

| Check | Result |
| --- | --- |
| `exports` / `types` | `.` → `dist/index.d.ts` / `dist/ui.js`; `./base.css` |
| `files` | `["dist"]` → 47 files, 112 kB unpacked; the PDF is gone (F6); content and size asserted in CI |
| `sideEffects` | `["*.css", "*.vue"]` — accurate (`index.ts` imports CSS) |
| Declarations for consumers | built by `vue-tsc -p tsconfig.build.json` |

### B.TS-2 Install-time code

No lifecycle scripts and no `overrides`. `build` runs in CI and publish.

### B.TS-3 Supply-chain gates

Lockfile; `npm ci` in every job; the audit gate (`node .github/audit-gate.mjs`) with an expiring
allowlist in CI and, through `verify`, in publish; publish npm pinned (11.20.0). Holds.

### B.VUE-1 Hosting

Not applicable to the library. Consumers' CSP must allow `connect-src https://status.meddleware.co.uk`
for `StatusWidget`, and `img-src data:` for `.mw-noise`; both are covered in consumer audits.

---

## Section C — Test-coverage & hermetic/live split

### C.1 Coverage grade — B+ (77/77 unit tests; 84% statements, 72% branches; a real-browser contrast gate)

| Dimension | Assessment |
| --- | --- |
| Happy path | Tabs keyboard; dialog open/close/return value; colour mode; panel vars; status parsing and polling; explorer URLs; `safeHref`/`safePath`; truncation |
| Error path | Malformed status JSON; unknown levels; bad stored modes; `StatusWidget` fetch failure (now covered); clipboard denial |
| Boundary | `safeHref` userinfo, backslash, control characters; `safePath` `//`, `/\`, TAB/newline; truncation edges (short value, zero counts); first-caller unmount; tiny `pollInterval`; hidden tab |
| Accessibility | axe over all 33 components in jsdom (structure and ARIA only), plus Playwright + axe with real tokens across 2 themes × 5 seasons × 3 views (30 tests) including `color-contrast` |

Re-counted 2026-10-09: Vitest 5.0.2 **77 passed, 10 files**; coverage 84.43 / 72.17 / 75.78 / 91.53
(statements / branches / functions / lines; local, not measured in CI); Playwright **30 passed**.

**Test layers:**

| Layer | Files | In CI? |
| --- | --- | --- |
| Unit / component (jsdom) | 10 files, 77 tests | yes |
| Static a11y (`eslint-plugin-vuejs-accessibility`, html-validate) | lint | yes |
| Real-browser contrast (Playwright + axe over `gallery/`) | `e2e/contrast.spec.ts`, 30 tests | yes (`e2e` job; also in the release `verify`) |

### C.2 Hermetic vs. live paths

| Path | Hermetic? | Deferred to | Tracking |
| --- | --- | --- | --- |
| Contrast under real CSS (themes × seasons) | yes (gallery with the real tokens, headless Chromium) | — | F2, F11 |
| `StatusWidget` against the live endpoint | no (tests mock `fetch`) | consumers (status check in the platform) | F5 |

---

## Section D — Deployment-readiness gates

### pre-localnet

- [x] no HTML sinks; sanitised external links; validated status data — F10
- [x] `safeHref` rejects userinfo and normalises; `safePath` same-origin check — F1 (0.1.31, `10d822b`)
- [x] truncation defaults and edge cases — F3 (0.1.31; `OQ1` for the default)

### pre-testnet *(consumers are live on testnet)*

- [x] links underlined (non-colour cue); `UiStepper` uses `--accent-contrast` — F2
- [x] a11y tests cover all components; real-browser contrast run across theme × season in CI — F2, F11, S1
- [x] `useColorMode` scope-independent — F4

### pre-mainnet

- [x] PDF removed from the package; asset naming fixed — F6. Reset/component CSS split not done, documented as required (ACCEPTED-RISK)
- [x] lint and pack checks in publish verify — F7
- [x] docs corrected (SECURITY.md first) — F9
- [ ] source and licence of the Kopimi PDF recorded — `OQ2` (maintainer; the repo-only copy carries a stated unverified-provenance note)
- [ ] external review — maintainer item (pre-mainnet, see `OPERATOR_TASKS.md` and the launch checklist)

---

## Cross-project themes

- **Supply chain & release integrity.** Lockfile; SHA-pinned actions; OIDC trusted publishing with
  provenance; `verify` = CI; weekly grouped Dependabot; one dev-only advisory under an expiring
  allowlist.
- **design-tokens ↔ ui contrast.** Token-level failures reached users through ui's global link
  styling, `UiBadge`, `ExplorerLink` and the stepper. design-tokens 0.1.9 adds per-theme seasons and
  its own contrast gate; this repo's gallery gate (F2, F11) checks the tokens as components consume
  them, so the two gates together cover the theme × season matrix.
- **Address display is a security surface.** dao-ui, treasury-ui, access-gate-ui, dashboard and
  token-deployer-ui show addresses and IDs through `CopyableAddress`/`ExplorerLink`. F3's new default
  reached them on their next `@meddleware/ui` bump; dao-ui and treasury-ui show the treasury in full.
- **`safeHref` is the workspace's URL allowlist** (the shared ESLint config's template rule trusts it
  by name), so F1's tightening protects every app.
- **On-chain-truth boundary.** The library holds no accounting; `CopyableAddress` copies what the
  host passes; nothing is computed or previewed.
- **Pre-v0.2 policy:** F1, F3, F4 and F6 changed behaviour and props without shims, released as the
  next patch (0.1.31) with consumers bumped in step.

---

## Normative requirements (MUST / MUST NOT)

1. MUST NOT produce an `href` that leaves the documented boundary: off-site for `symbolLink`;
   userinfo or non-normalised for `safeHref` — **holds** (F1).
2. MUST display chain identifiers with enough characters to resist look-alike addresses, and MUST
   render edge cases correctly — **holds** (F3; the default length is `OQ1`).
3. MUST meet WCAG AA for link affordance and for text on role colours in every shipped theme —
   **holds** (F2, F11; checked by the real-browser gate on every CI run and tag).
4. MUST NOT report a health state it has not observed — **holds** (F5).
5. MUST NOT ship third-party content without recorded provenance — **partly**: the PDF is out of the
   package and its checksum recorded, but its source and licence are unknown (`OQ2`).

**VUE lens baseline:**

| ID | Holds? | Evidence |
| --- | --- | --- |
| VUE-M1 | yes (no HTML sinks; URL sinks allow-listed by `safeHref` / `safePath`) | A1, A2 |
| VUE-M2 | N/A (no `VITE_*`; no IDs) | — |
| VUE-M3 | N/A (no test hooks in the library) | — |
| VUE-M4 | N/A here; supports consumers (F3's `:truncate="false"` serves the recipient display they build) | — |
| VUE-M5 | N/A (no irreversible actions) | — |
| VUE-M6 | N/A (no wallet state) | — |
| VUE-M7 | yes (`mw-color-mode` is an allow-listed value; not network-scoped by design) | F10 |
| VUE-M8 | N/A (consumers host) | — |
| VUE-M9 | no, accepted (global resets are bundled with the component styles; documented as required) | F6, A10 |

**TS lens baseline:**

| ID | Holds? | Evidence |
| --- | --- | --- |
| TS-M1 | yes (`vue-tsc`, `strict: true`; `noUncheckedIndexedAccess` not enabled — the only untrusted parser is `parseSnapshot`, which validates every field) | — |
| TS-M2 | yes for status JSON and URL props (F1) | — |
| TS-M3 / TS-M4 | N/A / yes (fetch errors caught and shown as unavailable) | — |
| TS-M5 | yes (status fetch 10-second timeout; URLs parsed) | — |
| TS-M6 | yes | — |
| TS-M7 | yes (whitelisted `dist`, 47 files, asserted in CI) | F6, F7 |
| TS-M8 | yes | B.TS-3 |
| TS-M9 | N/A (no `@mysten/*` dependency) | — |

## Implementation suggestions (SHOULD / MAY)

- **S1** *(done in 0.1.31)* A Playwright component gallery loaded with the real tokens, running axe
  (including `color-contrast`) for every `data-theme` × `data-season` in CI — `gallery/`,
  `e2e/contrast.spec.ts`, the `e2e` job. Keep adding each new component to the gallery.
- **S2** SHOULD export a `safeSameOriginHref` helper for consumers' internal links; `safePath` now
  covers the root-relative case and is exported.
- **S3** SHOULD add `CopyableAddress` `mode: 'full' | 'grouped' | 'truncated'` with
  context-appropriate defaults; `:truncate="false"` covers the full case today (F3).
- **S4** MAY render a non-colour indicator on external `target="_blank"` links (an icon), which also
  announces new-tab behaviour; links are underlined already.

## Open questions (`OQ#`)

1. **OQ1** F3: what truncation should be the default for 32-byte IDs, and which contexts (treasury,
   recipient, history) must show the full value? (Implemented 2026-10-08 as `[12, 10]` with the
   treasury shown in full in dao-ui and treasury-ui; the maintainer has not confirmed the choice.)
2. **OQ2** F6: where should the Kopimi PDF live, and what is its source and licence? (The PDF left
   the package in 0.1.31; the source is still unrecorded.)
3. **OQ3** F2: underline links globally (with opt-outs), or rely on a ≥ 3:1 link/text contrast in
   every theme × season? (Decided 2026-10-08 in code: links are underlined by default, and the
   contrast gate covers text on role colours — see F2.)

## Risks

- **Global reach:** every app inherits ui's link styling, focus ring, truncation and URL checks.
  Each defect here is multiplied across the product; each release needs consumer bumps.
- **Gallery coverage:** the real-browser gate sees only what the gallery renders; a new component or
  state absent from `gallery/ComponentGallery.vue` is unchecked. CLAUDE.md requires adding it.
- **Third-party artwork:** the Kopimi PDF's provenance stays unverified until the maintainer records
  a source (`OQ2`).
- **Dev-tool advisory:** one allowlisted high advisory (braces) expires 2027-01-01 and must be
  re-triaged or removed then.

---

## Re-verification log

- 2026-10-03 — first-pass baseline at `1c74afb` (tag `v0.1.30`, npm 0.1.30 with provenance).
  - **Lenses:** AUDIT_TEMPLATE.md (2026-10-02) + VUE (2026-09-30) + TS (2026-10-03).
  - **Measured:** type-check, lint and the audit gate clean; 49/49 tests; coverage 66.5 / 58.5 /
    64.4 / 73.2; build OK; pack 49 files, 11.8 MB unpacked.
  - **Probes:** a jsdom probe (deleted afterwards) confirmed F1, F3 and F4.
  - **Contrast:** computed for F2.
  - **PDF:** inspected for active content (none).
  - **Recorded:** F1–F10; OQ1–OQ3.
  - **No findings resolved:** by maintainer instruction this pass only records findings. Remediation,
    including single-solution fixes under the resolve-inline rule, is to be applied separately, with
    each disposition moved to RESOLVED and the diff cited.
- 2026-10-09 — re-verified against tag `v0.1.31` (`19d0855`; fixes in `10d822b`, 2026-10-08) and `main`
  `fe87de4` (Dependabot merges only); npm 0.1.31 with provenance.
  - **Lenses:** AUDIT_TEMPLATE.md, VUE and TS, all dated 2026-10-08 (the three lens files changed
    since the first pass; no disposition depends on the changes).
  - **Dispositions:** F1–F5, F7–F9 RESOLVED; F6 RESOLVED (PDF, asset naming) plus ACCEPTED-RISK
    (coupled CSS), `OQ2` open; F10 Positive updated; **F11 added** (the contrast gate's catches),
    RESOLVED. Totals: 10 findings plus 1 Positive: 9 RESOLVED (F1–F5, F7–F9, F11), F6 split
    (RESOLVED for the PDF and asset naming, ACCEPTED-RISK for the coupled CSS), 0 DEFERRED.
  - **Measured:** type-check and lint clean; 77/77 unit tests (10 files); 30/30 Playwright tests;
    coverage 84.4 / 72.2 / 75.8 / 91.5 (local); build `dist/ui.js` 34.2 kB, `dist/base.css` 24.7 kB;
    pack 47 files, 112 kB unpacked; `npm view` shows 0.1.31 with an SLSA v1 attestation; audit gate:
    1 allowlisted advisory.
  - **Stale facts corrected:** versions (0.1.30 → 0.1.31, design-tokens ^0.1.9, Node 24, Vite 8.3.2,
    vitest 5.0.2, TypeScript 6.0.3), test and coverage counts, tarball size and file count, the
    `public/legal` → `legal` move, the access note.
  - **Gates:** pre-localnet and pre-testnet all ticked; pre-mainnet open only for `OQ2` and external
    review (maintainer).
  - **Lens coverage:** A6 now includes the VUE lens "Colour & links" row (real-browser contrast across
    theme × season, links distinguishable without colour); the TS B.1 shared-dependency matrix row and
    TS-M9 (N/A) recorded.

## Pre-save consistency checklist (this pass)

- [x] Section A ↔ findings: all rows HOLDS except A10 (GAP, F6 ACCEPTED-RISK).
- [x] Finding header ↔ body: consistent; first-pass locations marked as such.
- [x] Template line: base + VUE + TS with the registry dates; untriggered lenses named.
- [x] Closing four-part structure present.
- [x] Section D ↔ dispositions.
- [x] Executive summary ↔ dispositions and ceiling (Medium; realised Low; nothing open).
- [x] C.1 counts measured 2026-10-09.
- [x] Re-verification log entry added.
