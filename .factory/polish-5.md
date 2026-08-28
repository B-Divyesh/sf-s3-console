# Polish 5 evidence map

Reviewed base: `cbbdf3ba149fd44c4ab609e95aa4d168b2fbe6f9` / review commit `a39d78df1003e89fb9983035a749f797c5d1f2ba`.
Product repair: `64375c51c9fde3cf8cfe0d6c58e86200eba046dc`. Static deployment: `3f2ed2d5-0259-4e45-b887-9e418045ad98` to [s3-console.sociobot.in](https://s3-console.sociobot.in).

## Evidence key

- **E1** — Fresh remote clone `/tmp/s3-console-polish-5-clean.NiqNOR/repo`: `npm ci` and all 34 exact commands in `.factory/claims.json` passed individually.
- **E2** — Same clone: `npm run lint`; `npm test` (16 passed, one endpoint-gated MinIO test skipped); `npm run build`; and pinned MinIO direct-client integration (1 passed). Built app JS is 61.38 kB raw / 18.81 kB gzip.
- **E3** — Same clone: `npm run test:browser` passed 38/38, including route/focus, 390 px, keyboard, privacy, offline, and Axe coverage.
- **E4** — Local production screenshots: `/tmp/s3-console-polish-5-home-390.png`, `/tmp/s3-console-polish-5-home-1440.png`, `/tmp/s3-console-polish-5-demo-390.png`, and `/tmp/s3-console-polish-5-404-390.png`.
- **E5** — Live verifier: `/tmp/s3-console-polish-5-live/verify.json` plus desktop/mobile screenshots; HTTP 200, no page/console errors, title, `lang=en`, one h1, main, alt, and button-label checks pass.
- **E6** — Live Axe: `/tmp/s3-console-polish-5-live/axe.json`; home, demo, privacy, terms, client 404, and host-served HTTP 404 each have zero violations.
- **E7** — Live finding recheck: `/tmp/s3-console-polish-5-live/finding-recheck.json`, `/tmp/s3-console-polish-5-live/offline-live.json`, `/tmp/s3-console-polish-5-live/home-390-findings.png`, and `/tmp/s3-console-polish-5-live/demo-1440-findings.png`.
- **E8** — Live mobile Lighthouse: `/tmp/s3-console-polish-5-live/lighthouse-clean.json` — performance/accessibility/best-practices/SEO 100/100/100/100; LCP 1.35 s, CLS 0, TBT 21 ms.

## Review 1

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1 | Job-first h1, named audience, and above-fold sample action/result remain. | E3 first-screen test; E4/E7 live `/`. |
| B2 | `/demo` and `?demo=1` remain isolated in-memory sample workspaces with banner, reset, and exit. | `@claim:demo-sandbox`, `@claim:privacy-boundary`, `@claim:offline-shell` in E1; E4/E7. |
| B3 | Claims manifest now has 34 public claims, each with one observable tagged test. | E1 command-by-command pass; E3. |
| B4 | Direct demo routing, route titles, designed SPA 404, and host-served static 404 remain. | E3 route tests; E5/E6 live routes. |
| M1 | Landing retains orientation, preview, steps, setup, and scope; facts now cover price, offline, and privacy. | E3 first-screen; E4/E7. |
| M2 | Route-specific title, description, canonical, OG/Twitter, icons, robots, and sitemap remain. | E3 metadata test; E5/E6. |
| M3 | Shared header/footer and 390 px console route menu remain. | E3 mobile-menu; E4 demo. |
| M4 | History navigation resets scroll, focuses h1, and announces the route. | E3 route/focus; E6. |
| M5 | 44 px controls and no-overflow mobile layout remain. | E3 responsive; E4/E7. |
| M6 | Concrete connection language and local technical help remain. | E4 home; E3. |
| m1 | All audited landing/README sentences remain at 22 words or fewer. | `.factory/copy-audit.md`; E3. |
| m2 | Vocabulary remains consistent: console, object store, endpoint, signed link, sample workspace. | `.factory/copy-audit.md`; E3. |
| U01 | Direct browser-to-chosen-endpoint behavior remains intercepted. | `@claim:credential-routing` in E1. |
| U02 | Unbounded “any object store” promise remains removed. | E4/E7 home copy. |
| U03 | Unverified provider badges/matrix remain removed. | README/copy audit; E1. |
| U04 | Bucket/object/settings/link capabilities remain split into outcome claims. | E1 operational claims; E3. |
| U05 | Precise secret-key-only privacy wording remains. | `@claim:credential-routing` in E1; E7 home. |
| U06 | Full demo flow checks requests, cookies, local, and session storage. | `@claim:privacy-boundary` in E1; E7 demo. |
| U07 | Source link and MIT license remain published and tested. | `@claim:open-source` in E1. |
| U08 | Undefined speed and broad hosting claims remain removed. | Copy audit; E2/E8 measured facts. |
| U09 | Bucket create/delete demo and version-aware real cleanup remain. | `@claim:bucket-management` in E1; E2 MinIO. |
| U10 | Prefix navigation/filtering remain tested; untested pagination promise remains removed. | `@claim:object-browser` in E1. |
| U11 | Upload, multipart upload, download, and delete remain separately tested. | Object and multipart claims in E1; E2. |
| U12 | Metadata/tag round trips remain tested. | `@claim:metadata-edit`, `@claim:tag-edit` in E1. |
| U13 | Policy, browser-access, and lifecycle round trips remain tested. | Settings claims in E1. |
| U14 / F-5-1 | `versioning-edit` now saves/reloads both Enabled and Suspended. | E1 `@claim:versioning-edit`; E7 live demo. |
| U15 | GET/PUT signed-link method and 900-second expiry remain tested. | Signed-link claims in E1. |
| U16 | Credential, theme, offline, keyboard, and mobile coverage remain. | E1; E3. |
| U17 | Explicit tested scope boundary remains. | `@claim:scope-boundary` in E1. |
| U18 | Untested minimum-Node guarantee remains removed. | README/copy audit. |
| U19 | Clean build remains in `dist/`. | `@claim:build-output` in E1; E2. |
| U20 | Pinned MinIO path was actually run. | E2. |
| U21 | CORS methods, connection diagnostic, and multipart ETag flow remain tested. | Matching claims in E1. |
| U22 | Mixed-content correction remains tested. | `@claim:connection-diagnostics` in E1. |
| U23 | Measurable path-style default remains; comparative wording stays removed. | `@claim:path-style-default` in E1. |
| U24 | Default session storage remains tested. | `@claim:credential-storage` in E1. |
| U25 | Local-storage opt-in remains tested. | `@claim:credential-storage` in E1. |
| U26 | Disconnect clears both stores. | `@claim:credential-disconnect` in E1. |
| U27 | Only exercised protocol behaviors are claimed. | E1 CORS, multipart, links, routing, credentials. |
| U28 | Pinned MinIO evidence replaces a broad provider matrix. | E2. |
| U29 | Unverified AWS compatibility wording remains absent. | README/copy audit. |
| U30 | Unsupported-success claim remains absent. | README/copy audit; E3 settings tests. |
| U31 / F-5-5 | `static-host-config` now asserts fallback, 404 override, headers, revalidation, and immutable assets. | E1 claim; E5/E6 live headers/404. |
| U32 | Original-art provenance record and disclosure remain. | `@claim:artwork-provenance` in E1. |

## Verification follow-ups and reviews 2–4

| Finding | Change made | Evidence |
| --- | --- | --- |
| P1 | Exhaustive version/delete-marker cleanup before bucket delete remains. | E2 MinIO. |
| P2 | Shell/worker revalidation and immutable hashed assets remain. | E1 static-host config; E5 headers. |
| P3 | Lint, unit, browser, claims, and integration commands remain reproducible. | E1–E3. |
| F-2-1 | `npm test` remains self-building from a clean clone. | E2. |
| F-2-2 | Complete noindex static 404 remains. | E3 static contract; E6 host 404. |
| F-2-3 / F-5-2 | First-screen facts now say “Free to use,” offline sample reload, and precise secret-key privacy; free use has a no-payment-flow claim. | E1 claims; E4/E7. |
| F-2-4 | 8 MiB-plus multipart protocol assertion remains. | E1 multipart; E2. |
| F-2-5 | Path-style default remains claimed and tested. | E1. |
| F-2-6 | Copy/move remain copy-before-delete safe. | E1 object-copy/object-move. |
| F-3-1 | Exact secret-key privacy copy remains. | E1 credential-routing; E7. |
| F-3-2 | Demo isolation inspects local and session stores. | E1 privacy boundary; E7. |
| F-3-3 | One request-method source and preflight coverage remain. | E1 CORS starter rule. |
| F-3-4 | Plain ETag response-header explanation remains. | E1 multipart; E4. |
| F-4-1 | 44 px mobile Menu, focus, and Escape behavior remain. | E3; E4 demo. |
| F-4-2 | Undefined “portable” wording remains removed. | Copy audit; E4/E7. |

## Review 5

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-5-1 | Versioning claim/test saves and reloads both states. | E1; E7. |
| F-5-2 | Price/offline/privacy fact set is above the fold. | E1 free/offline/routing claims; E4/E7. |
| F-5-3 | Mobile action order keeps sample caption with sample action, before real connect; a 390 px assertion guards it. | E3 first-screen; E4/E7. |
| F-5-4 | Bucket-subdomain browser claim proves signed bucket hostname and object-key path. | `@claim:bucket-subdomain-routing` in E1; E7 visible selector/help. |
| F-5-5 | Deployment config has a declared static-host contract claim. | `@claim:static-host-config` in E1; E5/E6. |
| F-5-6 | Workflow labels are self-contained h3 headings: Connect an object store, Browse buckets and objects, Upload files and edit settings. | E3 workflow-heading test; E4/E7. |

No finding remains unresolved.
