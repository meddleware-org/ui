# Contributing to @meddleware/ui

Thank you for looking. @meddleware/ui is part of [Meddleware](https://meddleware.co.uk): open tools you can use, take everything when you leave,
and run yourself. This file says how to build it, test it and propose a change.

## Build and test

```bash
npm ci
npm run type-check   # vue-tsc over .ts and the <script> blocks of .vue files
npm run lint         # stylelint, eslint + vuejs-a11y, html-validate
npm test             # jsdom unit and axe tests, then the brand check
npm run build        # dist/
npm run check:dist   # each component brings exactly its own CSS
npx playwright install chromium firefox webkit
npm run test:e2e     # the gallery in real browsers, every theme × season
```

CI runs the same commands on every push and pull request (`.github/workflows/`). A change is ready when they all pass locally.

## Proposing a change

1. Open an issue first for anything larger than a fix, so the design can be agreed before the work.
2. Keep a change to one purpose. Write a short subject line in the imperative ("Fix the relay timeout"), and say why in the pull request.
3. Add or update tests with the behaviour they cover. A bug fix comes with a test that failed before it. A new component needs an entry in
   `gallery/ComponentGallery.vue` (the browser sweeps audit it in every theme and season), a behaviour test and an axe case. Text is never dimmed
   with `opacity`, and a control's edge uses `--control-border`: both are checked, and both are explained in `CLAUDE.md`.
4. Add a line to `CHANGELOG.md` under `Unreleased`.
5. Security problems go to the address in [`SECURITY.md`](SECURITY.md), never to a public issue.

## House rules

- **Licence.** Everything here is [0BSD](LICENSE). By contributing you agree your contribution is released under it.
- **Versions.** Until the platform's mainnet launch, every release is a patch bump, breaking changes included; the changelog says what broke.
- **No secrets, no personal data** in code, tests, fixtures, comments or commit messages.
- **Privacy.** Nothing is stored in a visitor's browser before they act, and nothing is sent to a host the project does not document. No telemetry, analytics or tracking.
- **Open standards.** Where a standard exists and fits, use it; [`INTEROP.md`](docs/INTEROP.md) lists the ones this project speaks.

## Documentation

Every file explains itself, line by line where the code is not self-evident:

- a header on every file saying what it is for;
- a doc comment on every declaration (TSDoc, `///` in Rust and Move, Go doc comments), private ones included;
- comments that say **why**, cite the decision, issue or standard behind a choice, and are updated with the code;
- no `TODO` or `FIXME` without an issue or follow-up reference on the same line;
- every command a document shows has been run, and every link resolves.
