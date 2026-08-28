# Perfection-loop polish 3

Reviewed base: `f04c771b34ddea04253ed16ff5815ac1e33fc89c`. Repair commits deployed: `105a066a2899514f95c82eb6660d9ff9f54a6a4c` and `8fefb4c`. Azure Static Web Apps deployment: `dcda400a-8ffe-4b16-b4ef-a6f0e450c4fb`.

## Evidence key

- Local screenshots: `/tmp/s3-console-polish-3-home-390.png`, `/tmp/s3-console-polish-3-home-1440.png`, `/tmp/s3-console-polish-3-demo-390.png`, `/tmp/s3-console-polish-3-404-390.png`.
- Cold-live screenshots: `/tmp/s3-console-polish-3-live-home-390.png`, `/tmp/s3-console-polish-3-live-home-1440.png`, `/tmp/s3-console-polish-3-live-demo-390.png`, `/tmp/s3-console-polish-3-live-404-390.png`, `/tmp/s3-console-polish-3-live-transfer-390.png`.
- Full-page live verifier screenshots: `/tmp/s3-console-polish-3-live/screenshot-desktop.png` and `/tmp/s3-console-polish-3-live/screenshot-mobile.png`.
- Machine-readable live evidence: `/tmp/s3-console-polish-3-live/verify.json`, `routes.json`, `behavior.json`, and `lighthouse.json`.
- Every live URL named below was opened in a fresh Chromium context after deployment. `/assets/missing-polish-3.webp` returned the complete static 404 with HTTP 404.

## Review 3 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 / prior U05 | Replaced the broad credential fact with “Your secret key is not sent in storage requests.” The connection card now describes signed request routing. | `@claim:credential-routing`; home screenshots; cold live `/` confirmed the exact fact and zero console errors. |
| F-3-2 | The privacy claim now navigates, mutates, resets, exits, and inspects every local- and session-storage key. It also checks cookies and request origins. | `@claim:privacy-boundary`; live demo screenshot; cold live `/?demo=1` recorded `{local:[], session:[]}`, zero cookies, and zero off-origin requests. |
| F-3-3 | Added one typed `S3_HTTP_METHODS` source used by the request client, sample rules, starter rule, and settings editor. Added a cross-origin harness that observes preflights and requests for GET, PUT, POST, DELETE, and HEAD. | `@claim:cors-starter-rule`; full-page verifier screenshot; cold live `/` parsed the exact five-method rule. |
| F-3-4 | Rewrote setup text to “Expose the `ETag` response header so large uploads can finish,” explained the provider label in README, and added landing setup to the multipart claim location. | `@claim:multipart-upload`; full-page verifier screenshot; cold live `/` confirmed the explanation and `ETag` rule. |

## Earlier review and polish findings

| Finding | Change retained or completed | Evidence |
| --- | --- | --- |
| B1 | Job-first h1, named audience, visible sample action, adjacent result, real-connect action, and three facts remain above the fold at 390 × 844 and 1440 × 900. | `first screen states the job, audience, action, and facts on phone and desktop`; home screenshots; cold live `/` action bottoms were 445 px and 570 px. |
| B2 | `/demo` and `?demo=1` use a fresh in-memory three-bucket client with banner, reset, and Start for real; demo mode reads/writes no real connection state. | `@claim:demo-sandbox`, `@claim:privacy-boundary`; demo screenshot; cold live `/demo` and `/?demo=1`. |
| B3 | `.factory/claims.json` now has 31 unique claims and exactly one tagged test per claim. | All 31 exact manifest commands passed from `/tmp/s3-console-polish3-clean.AGYuED/repo`; demo screenshot; cold live `/?demo=1`. |
| B4 | Direct demo routing, client not-found routing, and a complete host-served HTTP 404 remain in place. | `routes update title, metadata, focus, history, and 404 state`; `host-served static 404 contract`; 404 screenshot; cold live `/missing-polish-3` and `/assets/missing-polish-3.webp`. |
| M1 | Landing order retains orientation, facts, sample entry, real connection form, three steps, setup guidance, and product boundary. | first-screen site test; full-page verifier screenshot; cold live `/`. |
| M2 | Every route sets its title, description, canonical, OG/Twitter fields, social image, favicon, and touch icon. | `every route keeps the shared navigation, footer, and route metadata`; home/404 screenshots; cold live route matrix. |
| M3 | Home, demo, legal, client 404, and static 404 share navigation and the complete legal/build/footer links. | route metadata test and static 404 contract; 404 screenshot; cold live `/privacy`, `/terms`, and missing asset. |
| M4 | PushState and popstate navigation focus the new h1, announce it, and settle at scroll position zero. | `routes update title, metadata, focus, history, and 404 state`; home screenshot; cold live `/` → `/privacy` → Back recorded h1 focus/live text and `scrollY: 0`. |
| M5 | Mobile links, buttons, inputs, selects, summaries, and checkbox labels meet the 44 px target without horizontal overflow. | `390px layouts do not overflow and visible controls meet touch targets`; all phone screenshots; cold live six-route scan found zero undersized visible controls. |
| M6 | Connection and setup copy uses concrete object-store, endpoint, URL-format, request-method, and response-header wording. | `.factory/copy-audit.md`; home screenshot; cold live `/`. |
| m1 | Landing and README sentences remain at 22 words or fewer; the corrected sample-action count is five words. | `.factory/copy-audit.md`; home screenshot; cold live `/`. |
| m2 | Public terminology remains console, object store, endpoint, sample workspace, signed link, and session/local storage. | copy-audit terminology table; home/demo screenshots; cold live `/` and `/demo`. |
| U01 | Broad backend marketing remains removed; direct request behavior is declared narrowly. | `@claim:credential-routing`; home screenshot; cold live `/privacy`. |
| U02 | “Any object store” remains removed in favor of S3-compatible storage. | first-screen site test; home screenshot; cold live `/`. |
| U03 | Unverified provider badges and compatibility matrix remain removed. | `@claim:scope-boundary`; home screenshot; cold live `/`. |
| U04 | Operational capabilities are split into observable bucket, object, settings, and link claims. | claims `bucket-management` through `presigned-upload`; demo/transfer screenshots; cold live `/demo`. |
| U05 | Credential wording now states the tested secret-key boundary, while the access-key ID is correctly allowed in Authorization. | `@claim:credential-routing`; home screenshot; cold live `/`. |
| U06 | Tracking/cookie/network claims are intercepted; Cache Storage is separately inspected after a configured object-store flow. | `@claim:privacy-boundary`, `@claim:offline-cache-boundary`; demo screenshot; cold live `/privacy` and `/?demo=1`. |
| U07 | Source and MIT license links remain published. | `@claim:open-source`; home screenshot; cold live source link returned 200. |
| U08 | Undefined “fast” and overbroad self-hosting marketing remain absent. | copy audit and Lighthouse; home screenshot; cold live `/`. |
| U09 | Sample bucket create/delete and real version-aware cleanup remain exercised. | `@claim:bucket-management`; pinned-MinIO integration; demo screenshot; cold live `/demo`. |
| U10 | Prefix navigation and name filtering use realistic sample keys. | `@claim:object-browser`; demo screenshot; cold live `/demo`. |
| U11 | Small upload/download/delete and 8 MiB-plus multipart outcomes are separate claims; multipart now also round-trips against pinned MinIO. | `@claim:object-upload`, `object-download`, `object-delete`, `multipart-upload`; demo screenshot; cold live `/demo`. |
| U12 | Metadata and tag edits round-trip after reopening an object. | `@claim:metadata-edit`, `@claim:tag-edit`; transfer screenshot; cold live `/demo`. |
| U13 | Policy, browser-access, and lifecycle edits each save and reload independently. | `@claim:policy-edit`, `@claim:cors-edit`, `@claim:lifecycle-edit`; demo screenshot; cold live `/demo`. |
| U14 | Versioning state saves and reloads. | `@claim:versioning-edit`; demo screenshot; cold live `/demo`. |
| U15 | Download and upload links assert GET/PUT and 900-second expiry. | `@claim:presigned-download`, `@claim:presigned-upload`; demo screenshot; cold live `/demo`. |
| U16 | Credential storage, theme, offline shell, keyboard, and mobile layout remain separate tested behaviors. | matching claim/site/responsive tests; home/demo screenshots; cold live `/`, `/demo`, and offline reload. |
| U17 | Excluded account/replication/monitoring/provider scope remains explicit and guarded. | `@claim:scope-boundary`; full-page screenshot; cold live `/`. |
| U18 | Unsupported Node-version marketing remains absent. | copy audit plus clean-clone `npm ci`; home screenshot; cold live `/`. |
| U19 | The build-output claim remains self-contained; clean test removes `dist/` before rebuilding it. | `@claim:build-output`, `npm run test:clean`; home screenshot; live bundle hashes match `dist/`. |
| U20 | Unqualified MinIO “proof” wording remains absent; the optional integration now truly runs multipart plus version cleanup. | pinned-MinIO direct-client integration; demo screenshot; cold live `/demo`. |
| U21 | Mixed-content/browser-access diagnostics and multipart `ETag` handling remain actionable; exact methods are now contract-tested. | `@claim:connection-diagnostics`, `@claim:multipart-upload`, `@claim:cors-starter-rule`; full-page screenshot; cold live `/`. |
| U22 | HTTPS-to-HTTP endpoints receive corrective error text. | `@claim:connection-diagnostics`; home screenshot; cold live `/`. |
| U23 | Comparative wording remains removed; the actual path-style default is tested. | `@claim:path-style-default`; home screenshot; cold live `/`. |
| U24 | Default connection storage is session-only. | strengthened `@claim:credential-storage`; home screenshot; cold live `/privacy`. |
| U25 | Remember-on-device now has an explicit opt-in local-storage assertion in the same tagged test. | strengthened `@claim:credential-storage`; home screenshot; cold live `/privacy`. |
| U26 | Disconnect clears both stores. | `@claim:credential-disconnect`; home screenshot; cold live `/privacy`. |
| U27 | Broad protocol marketing remains absent; required signing/encoding behavior stays unit-tested. | AWS request encoding/presigned URL unit tests; home screenshot; cold live `/`. |
| U28 | Pinned-MinIO success marketing remains absent; acceptance evidence now records a real pinned run. | pinned-MinIO direct-client integration; demo screenshot; cold live `/demo`. |
| U29 | Unverified AWS compatibility wording remains absent. | copy audit; home screenshot; cold live `/`. |
| U30 | Unsupported-setting fidelity marketing remains absent; errors remain announced without false success. | connection diagnostic and settings error paths in browser/unit suite; demo screenshot; cold live `/demo`. |
| U31 | Deployment wording remains limited to this static build; SPA fallback, 404, headers, and cache rules are tested. | `@claim:build-output`, deployment-config tests; 404 screenshot; cold live root/asset headers. |
| U32 | Original generated art disclosure, source, and design provenance remain linked. | `@claim:artwork-provenance`; home screenshot; cold live artwork link returned 200. |
| P1 | Version pages/delete markers are enumerated before batch deletion; errors stop before bucket deletion. The real regression now also round-trips multipart bytes. | S3 version-cleanup unit tests and pinned-MinIO integration; demo screenshot; cold live `/demo`. |
| P2 | Hashed assets are immutable for one year; shell, manifest, and worker revalidate. | `static deployment cache policy`; home screenshot; cold live JS header `public, max-age=31536000, immutable`, root `no-cache`. |
| P3 | Lint, unit, browser, claim, clean-build, and real-MinIO commands are runnable. | clean-clone aggregate suite; home screenshot; cold live `/`. |
| F-2-1 | `npm test` builds first; `test:clean` proves no pre-existing `dist/` is needed. | clean-clone `npm run test:clean`; home screenshot; live `/`. |
| F-2-2 | Static 404 retains noindex, metadata, navigation, full footer, build ID, and HTTP 404. | static 404 contract; 404 screenshot; cold live missing asset. |
| F-2-3 | The untested “Free” price assertion remains removed; “Open source” is linked and tested. | `@claim:open-source`; home screenshot; cold live `/`. |
| F-2-4 | Multipart support crosses the 8 MiB threshold in browser and pinned-MinIO tests. | `@claim:multipart-upload`; full-page screenshot; cold live `/`. |
| F-2-5 | The default selector and generated bucket request path are asserted. | `@claim:path-style-default`; home screenshot; cold live `/`. |
| F-2-6 | Copy and move controls preserve metadata/tags; move deletes only after copy. The tagged claim now also proves a failed destination leaves the source intact. | `@claim:object-copy`, strengthened `@claim:object-move`, S3 transfer unit tests; transfer screenshot; cold live `/demo`. |

## Final verification

- Clean clone: `npm ci` found 0 vulnerabilities; all 31 exact claim commands passed; `npm run lint`, `npm run test:clean`, and `npm run test:browser` passed (34/34 browser tests).
- Real integration: pinned MinIO `RELEASE.2025-09-07T16-13-09Z` passed multipart round-trip plus version/delete-marker bucket cleanup.
- Build: JS 60.25 kB raw / 18.47 kB gzip; CSS 25.50 kB raw / 6.09 kB gzip; `dist/` produced.
- Local Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.7 s, CLS 0, TBT 0 ms.
- Cold-live Lighthouse mobile: 100/100/100/100; LCP 1.4 s, CLS 0, TBT 0 ms, total transfer 103 KiB.
- Live `index.html`, JS, and CSS SHA-256 values matched the deployed `dist/` files exactly. No finding of any recorded severity remains unresolved.
