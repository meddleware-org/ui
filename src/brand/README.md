# Brand mark

The company mark is the Kopimi "K" (an isometric block K).

| | |
| --- | --- |
| Source | https://upload.wikimedia.org/wikipedia/commons/3/3f/Kopimi_k.svg (Wikimedia Commons, `File:Kopimi_k.svg`) |
| Licence | Public domain (Commons: the mark comes from Piratbyrån's kopimi.com; no author is named there) |
| Retrieved | 2026-11-08 |
| SHA-256 of `kopimi-k.svg` | `422b98c565b4dd381994d96ddc6617366448c83093250cff228d23a26cf713e4` |

`kopimi-k.svg` is the file exactly as downloaded: builds never fetch it. `npm run build:brand` derives everything else from it (`scripts/build-brand.mjs`):

- `mark.ts`: the path data `BrandMark.vue` draws. The source's white rhombus tops become real holes (one even-odd path), so the mark has no background and takes any colour.
- `files/favicon.svg`: the mark in the accent of the visitor's colour mode (terracotta 500 on light, 300 on dark), transparent background.
- `files/favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`: raster fallbacks (light accent inside a white outline, so they read on a light or a dark tab).

The files in `files/` are published as `@meddleware/ui/brand/*` and are what apps serve as their favicon (see `@meddleware/frontend-config`'s `brandIcons`). The footer's symbol (`CopyrightLine`) is separate and unchanged.
