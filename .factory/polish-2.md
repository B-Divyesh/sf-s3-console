# Perfection-loop polish 2

Base: `98b1febd70abe1663332c027e68c67d50a986aa8`. Repair: `ff2cd1600f88daba9a45678a69f316e360e1c71d`. The deployed production bundle is `/assets/index-rWlEpJ-g.js`. Local screenshots: `/tmp/s3-console-polish-2-{home,demo,404}-390.png`; cold live screenshots: `/tmp/s3-console-polish-2-live-{home,demo,404}-390.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1 | Kept job-first h1, audience, first-screen demo action, and facts. | Live 390 screenshot; `tests/site.spec.ts`. |
| B2 | Kept isolated `/demo`/`?demo=1`, sample inventory, reset, and real-mode exit. | `@claim:demo-sandbox`; live demo screenshot. |
| B3 | Kept claim manifest and tagged outcomes; added four claim entries. | Clean clone `npm run test:claims` 25/25. |
| B4 | Kept SPA demo/not-found routes and completed host static 404. | Live missing-asset HTTP 404 check. |
| M1 | Kept landing orientation, facts, preview, three steps, and scope boundary. | Site test; live home screenshot. |
| M2 | Kept route metadata and added full static-404 metadata. | Static 404 contract test; live check. |
| M3 | Kept shared SPA chrome; added matching static-404 header/footer. | Live missing-asset 404 check. |
| M4 | Kept History API focus and polite route announcement. | Route/history browser test. |
| M5 | Kept 44px mobile controls; transfer actions wrap. | Responsive browser test. |
| M6 | Kept plain S3 wording and contextual configuration labels. | Copy audit. |
| m1 | Kept README within the copy audit limit. | Copy audit. |
| m2 | Kept console/object store/endpoint terminology consistent. | Terminology table. |
| U01 | Retained only direct-request behavior and tested routing boundary. | `@claim:credential-routing`. |
| U02 | Removed “any” compatibility promise. | Home/README copy audit. |
| U03 | Removed unverified backend badges/matrix. | Home/README copy audit. |
| U04 | Split capabilities into specific UI and claim outcomes. | Claims `bucket-management`–`presigned-upload`. |
| U05 | Tested configured-endpoint routing without secret leakage. | `@claim:credential-routing`. |
| U06 | Tested demo network, cookie, and storage boundary. | `@claim:privacy-boundary`. |
| U07 | Kept source/MIT claim with repository test. | `@claim:open-source`. |
| U08 | Removed undefined speed/self-hosting promise. | README copy audit. |
| U09 | Added version-aware bucket deletion/sample outcome. | Bucket claim; S3 tests. |
| U10 | Tested seeded prefix navigation/filtering. | `@claim:object-browser`. |
| U11 | Added 8 MiB multipart claim/protocol outcome. | `@claim:multipart-upload`. |
| U12 | Tested metadata/tags round trips. | Matching claims. |
| U13 | Tested policy/browser-access/lifecycle separately. | Three matching claims. |
| U14 | Tested versioning change/reload. | `@claim:versioning-edit`. |
| U15 | Tested GET/PUT signed-link method and expiry. | Presigned claims. |
| U16 | Tested storage, theme, offline, keyboard, and mobile separately. | Claims and browser suites. |
| U17 | Kept/tested explicit excluded scope. | `@claim:scope-boundary`. |
| U18 | Removed unsupported runtime marketing. | README copy audit. |
| U19 | Tested `dist/` and made default test self-building. | Build claim; `test:clean`. |
| U20 | Removed old unqualified MinIO proof claim. | README test section. |
| U21 | Tested CORS diagnostic and multipart ETag behavior. | Connection/multipart claims. |
| U22 | Tested mixed-content diagnostic. | Connection claim. |
| U23 | Added tested default path-style behavior. | `@claim:path-style-default`. |
| U24 | Tested session-default storage. | Credential-storage claim. |
| U25 | Tested opt-in local storage. | Credential-storage claim. |
| U26 | Tested disconnect cleanup. | Credential-disconnect claim. |
| U27 | Removed broad protocol marketing. | README copy audit. |
| U28 | Removed pinned-MinIO success marketing. | README test section. |
| U29 | Removed unverified AWS wording. | README copy audit. |
| U30 | Removed unverified error-fidelity promise. | README copy audit. |
| U31 | Narrowed deployment wording/tested static config. | Build claim; deployment test. |
| U32 | Kept artwork provenance disclosure/source link. | Artwork claim; live footer. |
| P1 | Kept version-list/multi-delete cleanup. | Version-aware S3 tests. |
| P2 | Kept/deployed immutable assets policy. | Live asset cache header. |
| P3 | Kept lint/browser targets and clean-clone default test. | Clean clone suite. |
| F-2-1 | `npm test` builds first; `test:clean` removes `dist/`. | Clean clone `test:clean` pass. |
| F-2-2 | Added full static-404 metadata/chrome/noindex. | Live 404 is 2,543 bytes with complete shell. |
| F-2-3 | Replaced untested “Free and open source” with “Open source.” | Open-source claim; live home. |
| F-2-4 | Added declared 8 MiB-plus multipart test. | Multipart claim pass. |
| F-2-5 | Added declared default selector/path request test. | Path-style claim pass. |
| F-2-6 | Added Copy/Move dialogs, S3 CopyObject headers, copy-before-delete safety, demo paths. | Copy/move claims; S3 tests; live demo. |

## Live re-check

Cold Chromium at 390px confirmed first-screen action, `/demo` isolation banner/reset, Copy object and Move object controls, no console errors, and zero serious/critical Axe violations. `https://s3-console.sociobot.in/assets/missing-review.webp` returned HTTP 404 with the complete static shell and metadata. No current review finding remains unresolved.
