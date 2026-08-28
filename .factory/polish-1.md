# Perfection-loop polish 1

Base reviewed: `9cbc19cdb4d32e8dd72496b8a9bc17981231b7d3`. This table closes every finding in `.factory/review-1.md` and the two earlier independent verification reports. Browser evidence is generated from a production build; screenshots are `/tmp/s3-console-polish-1-home-390.png`, `/tmp/s3-console-polish-1-demo-390.png`, and `/tmp/s3-console-polish-1-404-390.png`. Live checks are recorded after deployment below.

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1 | Rewrote the first screen with the job-first h1, named self-hosters and small ops teams, visible sample action, real-connect action, and three facts. | `first screen states the job, audience, action, and facts`; home screenshot; live `/` |
| B2 | Added `/demo` and `?demo=1`, an in-memory realistic three-bucket sample, persistent banner, reset, and exit to real mode. | `@claim:demo-sandbox`; demo screenshot; live `/demo` |
| B3 | Added the complete claims manifest and one tagged observable test for each retained claim. | Every command in `.factory/claims.json`; clean-clone log below |
| B4 | Added direct demo routing, client unknown-route state, and host 404 document/override. | `routes update title, metadata, focus, history, and 404 state`; 404 screenshot; live `/missing-aisle` and `/404.html` |
| M1 | Added required first-screen facts, sample entry, three-step explanation, connection path, and privacy/scope boundary. | `first screen states the job, audience, action, and facts`; live `/` |
| M2 | Added per-route title, description, canonical, Open Graph/Twitter fields, social art, and touch icon. | `every route keeps the shared navigation, footer, and route metadata`; live route metadata checks |
| M3 | Made the header and footer shared across landing, demo, legal, and not-found states; footer carries one-liner, legal links, source, provenance, Param Factory, and build ID. | `every route keeps the shared navigation, footer, and route metadata`; live route crawl |
| M4 | History navigation now resets scroll, focuses the new h1, and announces it through the persistent polite live region. | `routes update title, metadata, focus, history, and 404 state`; live keyboard check |
| M5 | Raised visible links, form controls, checkbox labels, and footer controls to 44 px minimum. | `390px layouts do not overflow and visible controls meet touch targets`; 390px screenshots |
| M6 | Replaced the metaphor-led connection copy and defined unavoidable URL/CORS terminology in context. | `.factory/copy-audit.md`; home screenshot |
| m1 | Rewrote README sentences to the plain-language audit limit. | `.factory/copy-audit.md` |
| m2 | Standardized product, object-store, endpoint, signed-link, storage, and URL-format terms. | `.factory/copy-audit.md` terminology table |
| U01 | Removed broad architecture copy; retained direct-request privacy behavior with an intercepted configured-endpoint test. | `@claim:credential-routing` |
| U02 | Removed “any” compatibility promise; copy now says S3-compatible storage. | `.factory/copy-audit.md`; `@claim:credential-routing` |
| U03 | Removed unverified provider badges and compatibility matrix. | Home/README copy audit |
| U04 | Split operational/privacy wording into separately testable actions and request-routing claim. | `@claim:object-browser`, `@claim:policy-edit`, `@claim:presigned-download`, `@claim:credential-routing` |
| U05 | Replaced credential assertion with observable routing/secret-header test. | `@claim:credential-routing` |
| U06 | Made no-cookie/no-off-origin demo privacy behavior explicit and intercepted it. | `@claim:privacy-boundary` |
| U07 | Linked source and MIT license and tests both. | `@claim:open-source` |
| U08 | Removed undefined speed/self-hosting marketing. | README copy audit |
| U09 | Added sample create/delete test and retained real version-cleanup integration. | `@claim:bucket-management`; `npm run test:minio` |
| U10 | Added realistic prefix/filter sample test. | `@claim:object-browser` |
| U11 | Narrowed public copy to tested upload/download/delete outcomes. | `@claim:object-upload`, `@claim:object-download`, `@claim:object-delete` |
| U12 | Added metadata and tags round-trip tests. | `@claim:metadata-edit`, `@claim:tag-edit` |
| U13 | Split policy, browser-access, and lifecycle into separate claims/tests. | `@claim:policy-edit`, `@claim:cors-edit`, `@claim:lifecycle-edit` |
| U14 | Added versioning save/reload proof. | `@claim:versioning-edit` |
| U15 | Added separately asserted GET and PUT signed-link flows with a 900-second expiry. | `@claim:presigned-download`, `@claim:presigned-upload` |
| U16 | Split retained storage, theme, offline, keyboard, and mobile behavior into tested paths; removed untested wording. | `@claim:credential-storage`, `@claim:theme-choice`, `@claim:offline-shell`, keyboard/mobile suites |
| U17 | Kept and guarded the explicit product boundary. | `@claim:scope-boundary` |
| U18 | Removed the unsupported Node-version marketing assertion. | README copy audit |
| U19 | Registered and tests the `dist/` build-output assertion. | `@claim:build-output` |
| U20 | Removed the old “proves” description; retained opt-in disposable MinIO regression evidence. | `npm run test:minio` |
| U21 | Added mixed-content validation and actionable browser-access failure text. | `@claim:connection-diagnostics` |
| U22 | Added and tests the HTTPS-to-HTTP corrective error. | `@claim:connection-diagnostics` |
| U23 | Changed comparative wording to “Path-style URLs are the default.” | README copy audit |
| U24 | Added session-only storage test. | `@claim:credential-storage` |
| U25 | Added opt-in local-storage test. | `@claim:credential-storage` |
| U26 | Added dual-store disconnect test. | `@claim:credential-disconnect` |
| U27 | Removed unverified protocol implementation marketing from public copy. | README copy audit; unit protocol suite |
| U28 | Removed pinned-MinIO success marketing; kept disposable integration as a verification command. | `npm run test:minio` |
| U29 | Removed unverified AWS wording. | README copy audit |
| U30 | Removed the unverified error-fidelity promise; errors remain visible with corrective text. | connection error browser flow |
| U31 | Narrowed deployment copy to this static build and tested configuration/cache output. | `@claim:build-output`; `static deployment cache policy` |
| U32 | Kept product-art disclosure with source/design link and provenance test. | `@claim:artwork-provenance` |
| P1 | Implemented paged `ListObjectVersions`, delete-marker/version deletion, stop-on-error semantics, and version-aware bucket deletion. | `npm run test:minio`; `src/s3.test.ts` |
| P2 | Configured immutable fingerprinted assets while HTML, manifest, and worker revalidate. | `static deployment cache policy`; live header check |
| P3 | Added runnable ESLint configuration/command alongside existing browser and MinIO test commands. | `npm run lint`; `npm run test:browser`; `npm run test:minio` |

## Final deployment recheck

Application commits `2fc3d5675a89546b946609e3022f05714bb4da54` and `cdef0ae0943ccdada295f825de257a1e19d374fc` were deployed with:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh s3-console /work/repo/dist
```

Cold Chromium checks against `https://s3-console.sociobot.in` confirmed these client-rendered route results: `/` → `S3 Console — manage S3-compatible storage`, `/demo` and `/?demo=1` → `Demo — S3 Console`, `/privacy` → `Privacy — S3 Console`, `/terms` → `Terms — S3 Console`, and `/missing-aisle` → `Page not found — S3 Console`. The browser recorded zero console errors. Live 390px Axe scans reported zero serious/critical violations, zero undersized controls, and no horizontal overflow on all five routes. The live demo mutation/reset check recorded zero off-origin requests, zero cookies, no `s3-connection`, and no normal local-storage keys. Screenshots are `/tmp/s3-console-polish-1-live-home-390.png`, `/tmp/s3-console-polish-1-live-demo-390.png`, `/tmp/s3-console-polish-1-live-privacy-390.png`, `/tmp/s3-console-polish-1-live-terms-390.png`, and `/tmp/s3-console-polish-1-live-404-390.png`.
