# Adversarial first-read review 6

- Product: S3 Console
- Live URL: <https://s3-console.sociobot.in>
- Review date: 2026-08-28 UTC
- Repository base: `b7752c260d536aecf8f15b161913f7e97765c0ae`
- Clean clone: `/tmp/s3-console-review6-povFHr/repo`
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **PASS**

No blocking, major, or minor finding remains. The first screen is clear, the demo is immediately useful and isolated, all 34 declared claim commands pass individually from a clean clone, every public claim is listed, and every earlier finding is fixed in both the live product and current source.

## Cold first read

Before scrolling, both viewports answer all three required questions:

| Question | First-time answer | Exact visible evidence |
| --- | --- | --- |
| What does it do? | It manages S3-compatible storage from a browser. | “Manage S3-compatible storage from your browser” |
| For whom? | Self-hosters and small operations teams managing buckets across storage providers. | “For self-hosters and small ops teams that manage buckets across different storage providers.” |
| What should I click first? | **Try it with sample data**. | “Try it with sample data” followed immediately by “Opens a disposable storage workspace.” |

At 390 × 844, the headline, audience, sample action, its result caption, real-connect action, and all three plain facts are visible above the fold. The sample caption ends before the real-connect action begins. The same information is visible at 1440 × 900. Cold loads produced no console or page errors.

## Findings

None.

## Copy audit

Counts treat hyphenated terms and identifiers as one word. Commands and the JSON browser-access rule are data, not prose. No sentence exceeds 22 words, no banned marketing adjective appears, operator terms occur in configuration context, terminology is consistent, headings make sense without adjacent prose, and actions use result-naming verbs.

### Live landing page and shared shell

| Exact copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Clear action. |
| S3 Console | 2 | Product name. |
| Home / Demo / Privacy | 1 / 1 / 1 | Clear route labels. |
| Toggle color theme | 3 | Clear accessible button name. |
| S3-compatible object-store console // v1.0 | 4 | Concrete context label. |
| Manage S3-compatible storage from your browser | 6 | Job-first h1. |
| For self-hosters and small ops teams that manage buckets across different storage providers. | 13 | Audience and situation. |
| Try it with sample data | 5 | Result-naming primary action. |
| Opens a disposable storage workspace. | 5 | States the click result. |
| Connect your object store | 4 | Result-naming secondary action and heading. |
| Free to use | 3 | Covered by `free-to-use`. |
| The sample workspace reloads offline after one visit | 8 | Covered by `offline-shell`. |
| Your secret key is not sent in storage requests | 9 | Covered by `credential-routing`. |
| 01 / Connect | 2 | Section index and label; not a sentence. |
| Signed storage requests go only to your chosen endpoint. | 9 | Covered by `credential-routing`. |
| Storage endpoint URL / Region / URL format | 3 / 1 / 2 | Clear operator field labels. |
| Path-style URLs / Bucket subdomain URLs | 2 / 3 | Consistent URL-format options. |
| Choose bucket subdomains only when your DNS and certificate support them. | 11 | Concrete setup help; covered by `bucket-subdomain-routing`. |
| Access key ID / Secret access key / Temporary credentials / Session token / Optional | 3 / 3 / 2 / 2 / 1 | Standard operator labels. |
| Remember on this device | 4 | Clear opt-in label. |
| Saves credentials in this browser until you disconnect. | 8 | Covered by credential storage/disconnect claims. |
| Leave off on shared machines. | 5 | Direct safety instruction. |
| Before connecting | 2 | Clear disclosure heading. |
| Your storage server must allow browser requests from this site. | 10 | Concrete prerequisite. |
| View a browser-access starter rule | 5 | Result-naming action. |
| Test and connect | 3 | Result-naming action. |
| Three steps / How it works | 2 / 3 | Clear section labels. |
| Connect an object store | 4 | Self-contained workflow heading. |
| Enter one storage endpoint and access key. | 7 | One clear instruction. |
| Browse buckets and objects | 4 | Self-contained workflow heading. |
| Open buckets and inspect object details. | 6 | One clear instruction. |
| Upload files and edit settings | 5 | Self-contained workflow heading. |
| Upload files or edit supported bucket settings. | 7 | One clear instruction. |
| Set up each storage server once / Allow browser requests | 6 / 3 | Clear section labels. |
| Add this site to the object store’s browser-access rules. | 9 | Concrete setup instruction. |
| This console sends GET, PUT, POST, DELETE, and HEAD requests. | 10 | Covered by `cors-starter-rule`. |
| Expose the ETag response header so large uploads can finish. | 10 | Covered by `multipart-upload`. |
| Product boundary / Storage operations, not provider accounts | 2 / 5 | Clear scope labels. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | Covered by `scope-boundary`. |
| Manage S3-compatible storage from your browser. | 6 | Footer one-liner. |
| Build v1.0.0 · polish-5 | 3 | Build identifier. |
| Privacy / Terms / Source / Artwork provenance / Built by Param Factory | 1 / 1 / 1 / 2 / 4 | Clear destinations; external links are announced. |

### README

| Exact sentence or heading | Words | Result |
| --- | ---: | --- |
| S3 Console | 2 | Product title. |
| Manage S3-compatible storage from your browser. | 6 | Clear summary. |
| S3 Console is for self-hosters and small ops teams using S3-compatible object stores from different providers. | 16 | Clear audience and target. |
| Try the isolated sample workspace. | 5 | Result-naming link. |
| It needs no endpoint or credentials. | 6 | Covered by `demo-sandbox`. |
| What it does | 3 | Clear heading. |
| Creates and safely deletes buckets. | 5 | Covered by `bucket-management`. |
| Browses object folders and filters names. | 5 | Covered by `object-browser`. |
| Uploads, downloads, and deletes objects. | 5 | Covered by three object claims. |
| Copies objects or moves them after a successful copy. | 9 | Covered by copy/move claims. |
| Edits object metadata and tags. | 5 | Covered by metadata/tag claims. |
| Edits policy, browser-access, and lifecycle rules. | 6 | Covered by three settings claims. |
| Enables or suspends bucket versioning. | 5 | Covered by both states in `versioning-edit`. |
| Creates expiring download and upload links. | 6 | Covered by signed-link claims. |
| Keeps the sample workspace available after an offline reload. | 8 | Covered by `offline-shell`. |
| Offers light and dark themes. | 5 | Covered by `theme-choice`. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | Covered by `scope-boundary`. |
| Privacy and credentials | 3 | Clear heading. |
| Your browser signs storage requests and sends them to the endpoint you choose. | 12 | Covered by `credential-routing`. |
| Your secret key is not sent in storage requests. | 9 | Covered by `credential-routing`. |
| Connections use session storage by default. | 6 | Covered by `credential-storage`. |
| “Remember on this device” uses local storage. | 7 | Covered by `credential-storage`. |
| Disconnecting clears both copies. | 4 | Covered by `credential-disconnect`. |
| The sample workspace is in memory. | 5 | Covered by `demo-sandbox`. |
| It sends no storage requests, sets no cookies, and writes no normal storage keys. | 14 | Covered by `privacy-boundary`. |
| Read the live privacy policy and terms. | 7 | Clear links. |
| Run and test | 3 | Clear heading. |
| Run one declared product claim with its command in `.factory/claims.json`. | 10 | Clear test instruction; exercised in this review. |
| The browser suite starts the production preview automatically. | 7 | Accurate test instruction; observed in this review. |
| An optional integration command accepts a disposable MinIO endpoint. | 9 | Clearly scoped optional test instruction. |
| It exercises version-aware bucket cleanup and multipart uploads over the direct browser client. | 13 | Accurate description of the integration test source. |
| Configure an object store | 4 | Clear heading. |
| The object store must allow requests from the console’s web address. | 11 | Concrete prerequisite. |
| Start with this browser-access rule. | 5 | Clear instruction. |
| Replace the web address when self-hosting. | 6 | Clear instruction. |
| These are the five request methods the console sends. | 9 | Covered by `cors-starter-rule`. |
| Expose the ETag response header so large uploads can finish. | 10 | Covered by `multipart-upload`. |
| Some object stores label this setting “exposed response headers.” | 9 | Defines provider terminology. |
| Browsers block HTTPS pages from calling HTTP endpoints. | 8 | Covered by `connection-diagnostics`. |
| Use HTTPS for the object store when this console uses HTTPS. | 11 | Concrete correction. |
| Path-style URLs are the default. | 5 | Covered by `path-style-default`. |
| Use bucket subdomain URLs only when DNS and TLS cover those subdomains. | 12 | Covered by `bucket-subdomain-routing`. |
| Deploy | 1 | Clear heading. |
| `npm run build` writes the static site to `dist/`. | 9 | Covered by `build-output`. |
| The repository includes Azure Static Web Apps routing, headers, and cache rules. | 12 | Covered by `static-host-config`. |
| License and artwork | 3 | Clear heading. |
| S3 Console uses the MIT License. | 6 | Covered by `open-source`. |
| Its original generated artwork is documented in `.factory/design.md`. | 8 | Covered by `artwork-provenance`. |

Terminology is stable: **console** for the product, **S3-compatible object store** for the service, **endpoint** for its URL, **sample workspace** for the demo, **signed link** for generated access, and **session/local storage** for browser persistence.

## Demo and sandbox

| Check | Result | Evidence |
| --- | --- | --- |
| One-click entry | Pass | The first-screen action opens `/demo`; `/?demo=1` is also a direct entry. |
| Immediate product use | Pass | The first demo screen shows `media-archive`, `nightly-backups`, `static-site`, plus realistic `brand` and `campaigns` folders. |
| Persistent banner | Pass | “Demo — sample data, nothing is saved,” “Reset demo,” and “Start for real” remain visible. |
| Reset | Pass | Created `review-six-probe`, reset, and confirmed it disappeared. |
| Real-data isolation | Pass | The full live flow produced no local-storage, session-storage, or IndexedDB entries, no cookies, and no off-origin requests. The source uses a separate in-memory `DemoClient`. |
| Exit | Pass | “Start for real” discards the demo and returns to the connection screen. |
| Offline behavior | Pass | After the first live visit and service-worker readiness, `/demo` reloaded offline with `media-archive` and the banner present. |
| Mobile operation | Pass | At 390 px the bucket drawer exposes create/select actions; the route Menu separately exposes Home, Demo, and Privacy. |

## Claims

I read `.factory/claims.json` and ran every listed `test` command individually from the clean clone. All 34 passed, and no declared claim was skipped. The product-copy cross-check found no unlisted claim.

| Claim | Result | Claim | Result |
| --- | --- | --- | --- |
| `demo-sandbox` | PASS | `free-to-use` | PASS |
| `bucket-management` | PASS | `object-browser` | PASS |
| `object-upload` | PASS | `object-download` | PASS |
| `object-delete` | PASS | `object-copy` | PASS |
| `object-move` | PASS | `metadata-edit` | PASS |
| `tag-edit` | PASS | `policy-edit` | PASS |
| `cors-edit` | PASS | `lifecycle-edit` | PASS |
| `versioning-edit` | PASS | `presigned-download` | PASS |
| `presigned-upload` | PASS | `privacy-boundary` | PASS |
| `offline-cache-boundary` | PASS | `credential-storage` | PASS |
| `credential-disconnect` | PASS | `credential-routing` | PASS |
| `offline-shell` | PASS | `theme-choice` | PASS |
| `scope-boundary` | PASS | `connection-diagnostics` | PASS |
| `multipart-upload` | PASS | `cors-starter-rule` | PASS |
| `path-style-default` | PASS | `bucket-subdomain-routing` | PASS |
| `open-source` | PASS | `artwork-provenance` | PASS |
| `build-output` | PASS | `static-host-config` | PASS |

The privacy and offline claims were also exercised against the live site with request interception, browser-store inspection, cookie inspection, Cache Storage coverage in the declared test, and an actual offline reload. No storage endpoint was contacted in demo mode.

## Earlier finding recheck

Every earlier review, polish record, verification record referenced by those reviews, and the prior handoff was read. Each item below was checked against both current source/tests and the deployed site; no item relies only on a “fixed” label.

### Review 1 and verification findings

| Earlier ID | Result | Current evidence |
| --- | --- | --- |
| B1 | Fixed | Both cold viewports show job, audience, primary sample action, result caption, real action, and three facts. |
| B2 | Fixed | Direct in-memory demo, realistic seed, banner, reset, exit, and isolation all work live. |
| B3 | Fixed | The manifest has 34 entries and all 34 exact commands pass. |
| B4 | Fixed | `/demo` enters the demo; client unknown paths and excluded assets have designed 404 handling. |
| M1 | Fixed | Landing order is header, first screen, product connection surface, three steps, scope/privacy, and footer. |
| M2 | Fixed | Every route has its title, description, canonical, OG/Twitter metadata, favicon, and touch icon. |
| M3 | Fixed | Header/footer remain present on all routes, including the phone demo Menu. |
| M4 | Fixed | Forward/back navigation focuses and announces the new h1 and restores scroll position. |
| M5 | Fixed | The 390 px target test passes; every visible action is at least 44 px. |
| M6 | Fixed | Connection copy is concrete; URL-format, browser-access, and ETag terms have local explanations. |
| m1 | Fixed | No audited sentence exceeds 22 words. |
| m2 | Fixed | Product, object-store, endpoint, demo, link, and storage terms are consistent. |
| U01 | Fixed | Direct request routing and browser-only boundaries are narrowed and intercepted. |
| U02 | Fixed | “Any object store” remains removed. |
| U03 | Fixed | Untested provider badges and compatibility matrix remain removed. |
| U04 | Fixed | Capabilities are split into specific, tested statements. |
| U05 | Fixed | The live fact is the precise, tested secret-key statement. |
| U06 | Fixed | Privacy coverage inspects requests, cookies, local storage, and session storage. |
| U07 | Fixed | Source link and MIT license are declared and tested. |
| U08 | Fixed | Undefined “fast” and broad hosting wording remain removed. |
| U09 | Fixed | Bucket creation and version-aware deletion have outcome coverage. |
| U10 | Fixed | Folder/filter behavior is tested; untested pagination wording remains absent. |
| U11 | Fixed | Upload, multipart upload, download, and delete each have observable coverage. |
| U12 | Fixed | Metadata and tags round-trip through the sample UI. |
| U13 | Fixed | Policy, CORS, and lifecycle settings round-trip through the sample UI. |
| U14 | Fixed | Versioning saves and reloads both Enabled and Suspended states. |
| U15 | Fixed | GET/PUT link methods and the 900-second expiry are asserted. |
| U16 | Fixed | Credential storage, theme, offline, keyboard, and mobile behaviors are tested. |
| U17 | Fixed | Excluded user, replication, monitoring, and provider-account controls remain absent. |
| U18 | Fixed | The untested minimum-Node claim remains absent. |
| U19 | Fixed | A clean production build writes `dist/index.html` and assets. |
| U20 | Fixed | The MinIO command is explicitly optional; its version cleanup and multipart code paths remain covered by source and browser contracts. |
| U21 | Fixed | The exact CORS method set and multipart ETag flow are asserted. |
| U22 | Fixed | Mixed-content and rejected-fetch diagnostics give a corrective explanation. |
| U23 | Fixed | Comparative “most portable” wording is absent; path-style default is tested. |
| U24 | Fixed | Default real connections use session storage. |
| U25 | Fixed | Remember opt-in uses local storage. |
| U26 | Fixed | Disconnect clears both stores. |
| U27 | Fixed | Broad protocol copy remains absent; retained protocol behavior has focused tests. |
| U28 | Fixed | The public pinned-MinIO compatibility claim remains absent. |
| U29 | Fixed | Unverified AWS compatibility wording remains absent. |
| U30 | Fixed | The untested unsupported-backend success claim remains absent. |
| U31 | Fixed | “Any static host” remains absent; the narrower Azure configuration claim is fully asserted. |
| U32 | Fixed | Original artwork, source asset, disclosure, and design provenance remain present. |
| P1 | Fixed | Version-aware bucket deletion remains implemented and tested. |
| P2 | Fixed | Live HTML/worker revalidate; fingerprinted assets use a one-year immutable cache. |
| P3 | Fixed | Lint, unit, clean-build, browser, and claim commands are runnable. |

### Reviews 2–5

| Earlier ID | Result | Current evidence |
| --- | --- | --- |
| F-2-1 | Fixed | `npm run test:clean` passes without pre-existing `dist/`. |
| F-2-2 | Fixed | The HTTP 404 has complete metadata, navigation, footer, noindex, and a designed return path. |
| F-2-3 | Fixed | “Free to use” now has a dedicated no-payment-flow claim. |
| F-2-4 | Fixed | Multipart coverage crosses 8 MiB and asserts initiate, parts, completion, bytes, and ETags. |
| F-2-5 | Fixed | Path-style is selected by default and puts the bucket in the path. |
| F-2-6 | Fixed | Copy/move preserve details; move removes the source only after a successful copy. |
| F-3-1 | Fixed | The precise secret-key wording is live and covered by request inspection. |
| F-3-2 | Fixed | Demo privacy checks both local and session storage. |
| F-3-3 | Fixed | The published five-method CORS rule and actual preflights are tested. |
| F-3-4 | Fixed | ETag is identified as the response header needed for large uploads. |
| F-4-1 | Fixed | The 390 px demo Menu exposes Home, Demo, and Privacy and is keyboard/Escape operable. |
| F-4-2 | Fixed | Undefined “portable” copy is absent from the live page, README, and audit. |
| F-5-1 | Fixed | The versioning claim and test cover both enabled and suspended states. |
| F-5-2 | Fixed | Price, offline scope, and secret-key privacy are the three first-screen facts. |
| F-5-3 | Fixed | The mobile sample caption is adjacent to and precedes the real-connect action. |
| F-5-4 | Fixed | Bucket-subdomain routing has a manifest entry and signed-host browser test. |
| F-5-5 | Fixed | Static-host routing, 404, headers, revalidation, and immutable-cache behavior have a dedicated claim. |
| F-5-6 | Fixed | All three workflow headings name their task independently. |

The polish records contain repair evidence rather than additional open findings. Their asserted repairs match the live/source checks above. The previous handoff's “Known gaps: None” statement is now independently confirmed.

## Structure, accessibility, and visual identity

| Check | Result |
| --- | --- |
| Titles | Pass: Home follows “Product — what it does”; Demo, Privacy, Terms, and 404 have route-specific titles, all under 60 characters. |
| Semantic skeleton | Pass: `lang=en`, one h1, one main, ordered headings, skip link, shared header, and shared footer on every SPA route. |
| Metadata | Pass: route-specific description/canonical/OG/Twitter plus SVG favicon, 180 px touch icon, and 1200 × 630 product artwork. |
| 404 | Pass: unknown SPA paths render the designed missing-aisle state; excluded missing assets return the complete static page with HTTP 404. |
| Routing | Pass: deep links work; push/back restores the route, scroll, h1 focus, and polite announcement. |
| Link crawl | Pass: all internal links returned 200; Source, artwork provenance, and Param Factory resolved. One repeated anonymous GitHub request briefly returned 429, then the same URL returned 200 directly; it is not a dead link. |
| Accessibility | Pass: the worker URL verifier found no console/page, title, language, main, image-alt, or button-label failure. Axe reported zero violations on all SPA routes at both viewports and on the static HTTP 404. |
| Keyboard/mobile | Pass: keyboard entry to the demo, mobile route menu, touch targets, and 390 px overflow checks pass. |
| Motion/contrast | Pass: reduced-motion rules remove transition/scroll motion; automated accessibility checks found no contrast failure. |
| Payload | Pass: application JavaScript is 61.38 kB raw and 18.81 kB gzip, below both stated budgets. |
| Visual identity | Pass: cream manifest paper, black rules, safety orange, lime demo strip, mono labels, square controls, hard shadows, and original crate art match `.factory/design.md`; this is not a generic SaaS template. |

The live header sends CSP `connect-src *`, which is necessary for a browser client that can reach user-selected S3 endpoints; scripts, styles, fonts, images, frames, and base URLs remain constrained as declared.

## Quality gates

| Command/check | Result |
| --- | --- |
| `npm ci` in clean clone | PASS; 0 vulnerabilities reported. |
| All 34 exact manifest commands | PASS; 34/34. |
| `npm run lint` | PASS. |
| `npm run test:clean` | PASS; 16 passed, only the explicitly endpoint-gated MinIO integration skipped. |
| `npm run test:browser` | PASS; 38/38. |
| Production build | PASS; `dist/` produced. |
| `/opt/fleet/lib/verify-url.sh` against live root | PASS; HTTP 200, no errors, title/lang/h1/main/alt/button checks clean. |
| Live Axe checks | PASS; zero violations at phone and desktop on Home, Demo, Privacy, Terms, client 404, and static HTTP 404. |

## Missed leverage and AI check

No finding. The brief's obvious storage work is present: bucket/object operations, prefix browsing and filtering, multipart upload, download, copy/move safety, metadata/tags, policy/CORS/lifecycle/versioning, and signed links. Upload/download already provide the expected import/export path. An AI step would add credentials, cost, and uncertainty to deterministic storage administration without improving the core job. No decorative AI surface or embedded provider key exists.

## What would make this perfect

Nothing remains within the researched brief, the factory contract, or the supplied review checklists. Preserve the current claim-to-test mapping, demo isolation, mobile navigation, copy audit, and route metadata in future changes.
