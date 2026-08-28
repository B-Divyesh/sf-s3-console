# Adversarial first-read review 1

- Product: S3 Console
- Live URL: https://s3-console.sociobot.in
- Review date: 2026-08-28 UTC
- Repository base: `1799db554ae6009f9446c0837a571d167d4ecef1`
- Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context
- Verdict: **FAIL**

The product has four blocking failures: the first screen does not identify its audience or show a first action, there is no demo, the required claims manifest and claim tests are absent, and unknown routes render the home page instead of a designed 404. The baseline unit tests and build pass, but they do not cure those acceptance failures.

## First-screen read

### 390 px, before scrolling

- What it does: I infer that it manages buckets, objects, policies, and presigned links for S3-compatible storage.
- For whom: I cannot tell. The screen names storage products but never says “self-hoster,” “operator,” or another audience.
- What to click first: I cannot tell. The only visible button is the color-theme control. The “01 / CONNECT” strip starts at 774 px, only the top of “Open a direct line” enters the 844 px viewport, and the connect button is farther down.

### Desktop, before scrolling

- What it does: I infer the same S3 administration job from the supporting sentence.
- For whom: I still cannot tell without outside context.
- What to click first: I cannot identify a usable first action. The connection card starts at 718 px, but its fields and “Test & connect” button are below the 900 px viewport.

The failing copy is “One console. Any object store.” and “Browse buckets, move objects, edit policies, and make presigned links—without a vendor admin API or a middleman server.” The first is not the job in the visitor’s words; the second says nothing about the intended user. Neither screen contains “Try it with sample data.”

## Findings, ordered by severity

### B1 — BLOCKING — The first screen omits the audience and a visible first action

**Quote:** “One console. Any object store.” / “Universal S3 workbench // v1.0”

**Why this loses a first-time visitor:** “Any object store” is broader than the actual S3-compatible scope, “workbench” does not name the task, and the visitor must infer the audience from product names. At both tested sizes, no useful primary action is visible before scrolling.

**Concrete fix:** Use “Manage S3-compatible storage from your browser” as the h1. Follow with “For self-hosters and small ops teams that manage buckets across different storage providers.” Put “Try it with sample data” in the first viewport, with “Opens a disposable storage workspace” beside it. Keep “Connect your object store” as the secondary action. Add three short facts: “Free and open source,” “Credentials stay in your browser,” and “Your endpoint must allow browser requests.”

### B2 — BLOCKING — There is no one-click demo or sandbox

**Quote:** The live page offers only “Test & connect.” `/demo` and `/?demo=1` both show the same credential form.

**Why this loses or risks a visitor:** A visitor cannot see the product without supplying a real endpoint and credentials. There is no realistic sample inventory, no “Demo — sample data, nothing is saved” banner, no “Reset demo,” and no “Start for real.” There is therefore no isolation boundary to verify and no way to establish that demo actions leave real storage untouched. The README has no demo URL, and `.factory/demo.md` is absent.

**Concrete fix:** Make `/demo` enter an in-memory client with, for example, `media-archive`, `nightly-backups`, and `static-site` buckets; realistic keys, versions, metadata, tags, policy, CORS, and lifecycle data; and working create/edit/delete/reset flows. Keep a persistent demo banner with “Reset demo” and “Connect your store.” Prevent every S3 network request and every non-`demo:` storage write while the banner is present. Add browser tests that seed, mutate, reset, and assert that normal local/session storage and configured endpoints were untouched. Document the URL and namespace in `.factory/demo.md`.

### B3 — BLOCKING — Claims cannot be verified

**Quote:** `.factory/claims.json` does not exist.

**Why this misleads a visitor:** The landing page and README make operational, compatibility, privacy, offline, and build claims, but none has a declared sandbox test. A clean reviewer cannot run “every listed test” because there is no list. The existing test command runs unit tests and skips the only real-backend integration test.

**Concrete fix:** Add `.factory/claims.json`. Give every retained claim one tagged test that exercises the observable result through `/demo`; split compound claims into separate entries. Run privacy tests with request interception and storage snapshots. Either add disposable-backend integration coverage for named stores or narrow the compatibility copy to what is tested.

Every row below is an unlisted-claim finding. Repeated wording with the same meaning is grouped; `where` identifies all occurrences.

| ID | Quote and where | Why it is presently unverified | Concrete fix |
| --- | --- | --- | --- |
| U01 | “Browser-only”; “The app has no backend”; “The image is a static nginx container. It does not proxy S3 traffic.” — landing/README | Architecture and request routing are privacy-relevant. | Intercept a full demo and configured-endpoint flow; assert app traffic is same-origin and S3 operations go only to the chosen endpoint. |
| U02 | “One console. Any object store.”; “for any S3-compatible object store” — landing/README | “Any” promises compatibility beyond the tested matrix. | Replace with “Connect to S3-compatible endpoints,” then test a declared compatibility matrix. |
| U03 | “Garage / RustFS / SeaweedFS / Ceph RGW / Versity / AWS S3”; the matching README sentence and table — landing/README | Product badges imply verified support, while five rows say “pending” and AWS was not exercised. | Remove unverified badges or add clean integration tests for each named backend and addressing mode. |
| U04 | “Browse buckets, move objects, edit policies, and make presigned links—without a vendor admin API or a middleman server.” — landing | Four capabilities and two architecture assertions are combined. | Split the copy and add one outcome test per capability plus request interception for the architecture claims. |
| U05 | “Credentials never leave this browser for our servers.” / “Credentials never transit Sociobot infrastructure.” — landing/README | This is a security promise with no declared interception test. | Test a connect and object flow; assert no Sociobot request contains the key, secret, session token, or authorization header. |
| U06 | “No telemetry.” / “The app has no cookies, trackers, analytics, credential proxy, or remote application database.” — landing/README | The visitor is asked to trust an untested privacy assertion. | Intercept page load and the full demo; assert no unexpected host, beacon, cookie, or storage key. |
| U07 | “Open-source utility.” — landing | The statement is not registered or checked. | Add a test for a reachable source link and MIT license, or remove the footer claim. |
| U08 | “A fast, self-hostable web console…” — README | “Fast” has no threshold; self-hosting is not exercised. | Remove “fast,” define a measurable load budget, and smoke-test the built static server. |
| U09 | “List, create, and delete buckets, including a deliberate version-history cleanup before deleting a versioned bucket” — README | Unit coverage is not a demo outcome and the live path needs credentials. | Add demo and disposable-MinIO claim tests for create, list, version cleanup, and delete. |
| U10 | “Browse object keys as prefix folders with pagination and filtering” — README | No declared browser test proves paging or filtering results. | Seed more than one page in the demo and assert folder, next-page, and filter outcomes. |
| U11 | “Upload small files and multipart-upload larger files; download and delete objects” — README | The size boundary and each transfer result are untested as claims. | State the multipart threshold and test small upload, multipart upload, downloaded bytes, and deletion. |
| U12 | “Read and replace object metadata and tags” — README | No browser claim test checks round-trip values. | Edit seeded metadata and tags, reopen the object, and assert the saved values. |
| U13 | “Edit bucket policy JSON, CORS rules, and lifecycle rules” — README | Three configuration features are asserted together. | Split into three claims and verify read/edit/reload for each in the sandbox. |
| U14 | “Enable or suspend bucket versioning” — README | No declared outcome test exists. | Toggle seeded versioning and assert the status after reload/reset. |
| U15 | “Create expiring GET and PUT presigned URLs” — README | No test checks method, expiry, or signature. | Generate both URL types and parse/assert signed method and expiration. |
| U16 | “Session-only credentials by default, optional device persistence, dark mode, offline app shell, keyboard and mobile layouts” — README | Five claims are hidden in one list and none is registered. | Split them; test session/local storage, persisted theme, offline reload, keyboard operation, and 390 px layout separately. |
| U17 | “This deliberately does not manage users/IAM, replication, metrics, or vendor-specific administration APIs.” — README | This defines product boundaries but is not guarded against UI/API drift. | Add a scope assertion or keep it as an explicit non-capability in the claims manifest. |
| U18 | “Requires Node.js 20 or newer.” — README | The supported runtime boundary is not tested. | Run install/test/build in the minimum declared Node version in CI. |
| U19 | “Production builds … always land in `dist/`.” — README | The build passed in this review, but there is no claim entry. | Register the build-output claim and assert `dist/index.html` plus referenced assets. |
| U20 | “This test creates a bucket, creates two object versions and a delete marker, then proves the browser client can remove all of them before bucket deletion.” — README | The described MinIO test was skipped in the clean run. | Make a disposable MinIO job mandatory for this claim or label it optional and remove “proves.” |
| U21 | “The endpoint must allow requests from the console origin.”; “Multipart uploads need `ETag` exposed.” — landing/README | These prerequisites affect whether the product works but have no executable check. | Add a connection diagnostic that detects missing CORS methods/headers and test each error state. |
| U22 | “A page served over HTTPS cannot call an HTTP endpoint…” — README | The mixed-content behavior is described but no product error path is verified. | Test an HTTP endpoint from the HTTPS build and assert a plain corrective error. |
| U23 | “Path-style addressing is the most portable default.” — README | “Most portable” is comparative and undefined. | Replace with “Path-style is the default” and document tested backends. |
| U24 | “By default, the connection is stored in `sessionStorage` and disappears with the browser session.” — README | Storage behavior is security-sensitive and unregistered. | Test a fresh context, connect without remember, close it, and assert no restored connection. |
| U25 | “‘Remember on this device’ moves it to `localStorage`.” — README | No declared test checks the opt-in storage boundary. | Test checked and unchecked flows and inspect both stores. |
| U26 | “Disconnecting removes both copies.” — README | A stale credential would be harmful. | Seed both keys, disconnect, and assert both are absent. |
| U27 | “The client uses AWS Signature Version 4, ListObjectsV2 continuation tokens, standard multipart upload, and public bucket configuration APIs.” — README | Four protocol claims are not registered. | Split into protocol tests that inspect signed requests and fixture responses. |
| U28 | “MinIO `RELEASE.2025-09-07` … End-to-end local validation completed” — README | The relevant test is skipped by default and no evidence is linked. | Register and run the pinned MinIO test in acceptance; record the artifact. |
| U29 | “AWS S3 … Standard API implementation; live account not exercised in this build” — README | “Standard API implementation” can read as compatibility despite the disclaimer. | Change to “Not verified against AWS S3” until a disposable-account test exists. |
| U30 | “Unsupported configuration calls surface the backend’s error without pretending the change succeeded.” — README | Error fidelity is a user-facing behavior with no claim test. | Mock an unsupported response and assert the visible error and unchanged UI state. |
| U31 | “Upload `dist/` to any static host”; configuration/header/cache statements in Deploy — README | “Any” host and cache/header behavior are broad deployment claims. | Narrow to tested hosts; test fallback, headers, and cache-control against the production server. |
| U32 | “The interface and generated artwork are original to this repository…” — README | Provenance is asserted but not linked from the live wording. | Keep the source prompt and asset history tracked; make the live disclosure link to the design record. |

### B4 — BLOCKING — Routing has no demo route or 404

**Quote:** `/demo` and `/not-a-real-route` both return status 200 with the home h1 “One console. Any object store.” and the home title.

**Why this loses a visitor:** A promised demo URL does not enter a demo, and a mistyped or stale link is silently presented as the home page. The visitor cannot tell the route failed. This is broken routing under the site-structure criteria.

**Concrete fix:** Implement `/demo` with title “Demo — S3 Console.” Implement a designed `/404` state with its own h1, a clear home action, and appropriate not-found hosting behavior where supported. Route unknown client paths to it; include `/demo` in the sitemap.

### M1 — Major — The landing structure omits required orientation and proof

**Quote:** After the hero, the page moves directly to a real-credential form and then “Browser access needs CORS.”

**Why this loses a visitor:** There are no three plain facts, live sample preview, three-step “How it works,” or clear “What it does not do” section. Limits appear only in the README.

**Concrete fix:** Follow the standard order: first-screen action and facts; live demo preview; “How it works” with Connect, Browse, Change; limitations/privacy; footer. Keep the existing connection form as the real-start path.

### M2 — Major — Required route metadata is missing

**Quote:** All routes have no canonical link, Open Graph tags, Twitter card, or apple-touch icon. Privacy and Terms reuse the home meta description. `/demo` reuses the home title.

**Why this misleads a visitor:** Shared and indexed links have no route identity or product artwork. Legal pages describe themselves as a console, and the demo route is not identified.

**Concrete fix:** Add a canonical URL and route-specific description/title for every route; add OG and Twitter metadata using a real 1200 × 630 product image; add a 180 px apple-touch icon. Verify the generated DOM after client navigation.

### M3 — Major — Header/footer structure is inconsistent

**Quote:** The home header has no navigation. Privacy and Terms have no navigation and no footer.

**Why this loses a visitor:** Navigation changes by route, the demo is undiscoverable, and legal pages drop Privacy, Terms, the product one-liner, Param Factory credit, and version/build information.

**Concrete fix:** Use one header and footer component on every route. Put Home/Demo/Privacy in the header; put the one-line description, Privacy, Terms, “Built by Param Factory,” and build ID in the footer.

### M4 — Major — Client navigation does not manage focus or route announcements

**Quote:** After activating “Privacy,” `document.activeElement` was `BODY`, not the new h1; the route had no live region and retained a 305 px scroll offset.

**Why this loses a visitor:** Keyboard and screen-reader users receive no reliable route-change cue and can arrive partway down a new page. Back navigation renders the prior route, but route focus is not restored or deliberately placed.

**Concrete fix:** On push/pop navigation, render, scroll new routes to the intended position, set `tabindex="-1"` on the h1, focus it, and announce its text in a persistent `aria-live="polite"` region. Add forward/back tests.

### M5 — Major — Several mobile interactive targets are below 44 px

**Quote:** On the 390 px page, the brand link is 140 × 30, the remember checkbox is 17 × 22, “See a starter rule” is 243 × 37, and footer links are about 20 px high.

**Why this blocks reliable touch use:** These controls do not meet the stated 44 px target baseline.

**Concrete fix:** Increase each link’s padded hit area to at least 44 × 44 and make the entire checkbox label a 44 px target. Add a browser assertion for interactive bounding boxes at 390 px.

### M6 — Major — Copy uses unexplained terms and a metaphor at the decision point

**Quote:** “Universal S3 workbench,” “Open a direct line,” “presigned links,” “vendor admin API,” “middleman server,” “Addressing,” “Path-style,” “Virtual-hosted,” “CORS,” and “ETag.”

**Why this loses a first-time visitor:** The form assumes protocol knowledge before explaining the first task. “Open a direct line” does not make sense as a standalone heading.

**Concrete fix:** Use “Connect your object store” and short help beside unavoidable terms. Replace the hero with the B1 wording. Use “Bucket subdomain URLs” as the visible alternative label and explain “virtual-hosted” in help text.

### m1 — Minor — The README has four overlong sentences

The exact rows and rewrites are in the copy audit below. They are 25, 27, 26, and 33 words.

### m2 — Minor — User-facing terminology drifts

The same product is called “console,” “UI,” “app,” “client,” and “interface”; the external service is “object store,” “store,” “endpoint,” “backend,” and “system”; generated links are “presigned links” and “presigned URLs.” Choose one term per concept and define technical alternatives only where configuration requires them.

## Demo and sandbox checks

| Check | Result | Evidence |
| --- | --- | --- |
| Visible first-screen “Try it with sample data” | **Fail** | No such link or button at 390 px or desktop. |
| `/demo` direct entry | **Fail** | HTTP 200, but renders the normal credential form. |
| `?demo=1` direct entry | **Fail** | Renders the same normal credential form. |
| Realistic data immediately visible | **Fail** | No buckets or objects; endpoint and credentials are required. |
| Persistent demo banner | **Fail** | No banner. |
| Reset demo | **Fail** | No reset action. |
| Start for real | **Fail** | No demo exit action. |
| Separate demo namespace | **Not testable** | There is no demo mode or `.factory/demo.md`. |
| Real storage untouched | **Not testable** | No sandbox boundary exists. |

The live app shell did reload after the context was switched offline following an initial online load. This does not pass a demo/offline claim because `?demo=1` is not a demo and the behavior has no claims entry. In a separate mocked connect flow, the signed S3 request went only to `https://storage.example.test/`; the access key and secret were written to `sessionStorage` under `s3-connection`, as documented for the real mode. No credential appeared in a Sociobot request. This useful observation is not a substitute for a declared privacy test.

## Claims execution

`.factory/claims.json` is absent, so the declared claim-test set is empty and the required tagged tests cannot be run.

A clean local clone was nevertheless checked:

```text
npm ci                    PASS
npm test                  PASS: 8 tests; 1 MinIO integration test skipped
npm run build             PASS: dist/ produced
main JavaScript           46.83 kB raw; 14.70 kB gzip
```

The skipped test is `src/s3.minio.integration.test.ts`. None of the executed tests has an `@claim:<id>` mapping because no claims manifest exists.

## Structure, links, and accessibility

| Check | Result |
| --- | --- |
| Home title pattern | Pass: “S3 Console — one console, any object store,” 42 characters, though “any” is overbroad. |
| Route titles | Partial: Privacy and Terms are distinct; Demo and unknown routes use Home. |
| `lang`, one h1, one main | Pass on Home, Privacy, and Terms. |
| Heading order | Pass on tested routes. |
| Meta description | Present but not route-specific. |
| Canonical / OG / Twitter / apple-touch | Fail: all absent. |
| SVG favicon / theme color | Pass. |
| Meaningful image alt | Pass. |
| `robots.txt`, sitemap, manifest, service worker | Reachable with HTTP 200; sitemap omits Demo. |
| Designed 404 | Blocking fail: arbitrary paths render Home with HTTP 200. |
| Deep links | Privacy and Terms open directly; Demo does not. |
| Back button | Route content restores, but route-change focus/scroll behavior fails. |
| Dead-link crawl | Pass for Home, Privacy, Terms, Source, favicon, manifest, robots, sitemap, and service worker; each returned 200. |
| Header/footer consistency | Fail on Privacy and Terms. |
| Console errors on load | None at either tested viewport. |
| Horizontal overflow | None at 390 or 1440 px. |
| Automated accessibility | Axe found zero violations on Home, Privacy, and Terms at both viewports. |
| Reduced motion | Pass: transition/animation duration computed to 0.01 ms and smooth scrolling was disabled. |
| Touch targets | Fail for the controls listed in M5. |
| Visual identity | Pass: the cream/ink/safety-orange palette, graph-paper crate artwork, square controls, heavy rules, and offset shadows are recognisably product-specific and match `.factory/design.md`; it is not a generic gradient-card SaaS template. |

## Copy audit

Counts treat hyphenated compounds as one word. Headings, labels, actions, and compatibility badges are included because they are part of the first-read vocabulary. `L` means over 22 words, `J` unexplained jargon, `M` unmeasured marketing/comparative wording, `H` heading unclear out of context, and `T` inconsistent term.

### Live landing page

| # | Copy | Words | Flag and proposed rewrite |
| ---: | --- | ---: | --- |
| 1 | S3 Console | 2 | — |
| 2 | Browser-only | 1 | Unlisted claim; test request routing. |
| 3 | Universal S3 workbench // v1.0 | 5 | J/H: “Manage S3-compatible storage in your browser.” |
| 4 | One console. | 2 | H: combine with row 5 as “Manage S3-compatible storage from your browser.” |
| 5 | Any object store. | 3 | M/H: same rewrite; remove unverified “Any.” |
| 6 | Browse buckets, move objects, edit policies, and make presigned links—without a vendor admin API or a middleman server. | 19 | J: “For self-hosters who manage buckets and files across S3-compatible storage.” |
| 7 | Garage | 1 | Unlisted compatibility claim. |
| 8 | RustFS | 1 | Unlisted compatibility claim. |
| 9 | SeaweedFS | 1 | Unlisted compatibility claim. |
| 10 | Ceph RGW | 2 | Unlisted compatibility claim. |
| 11 | Versity | 1 | Unlisted compatibility claim. |
| 12 | AWS S3 | 2 | Unlisted compatibility claim. |
| 13 | 01 / CONNECT | 2 | J: “Connect your store.” |
| 14 | Open a direct line | 4 | H/metaphor: “Connect your object store.” |
| 15 | Credentials never leave this browser for our servers. | 8 | Awkward/unlisted: “Your credentials go only to your chosen storage endpoint.” |
| 16 | Endpoint URL | 2 | J: retain with help, “Your storage URL.” |
| 17 | Region | 1 | — |
| 18 | Addressing | 1 | J: “URL format.” |
| 19 | Path-style | 1 | J: “Path-style URLs,” with an example. |
| 20 | Virtual-hosted | 1 | J: “Bucket subdomain URLs,” with technical help. |
| 21 | Access key ID | 3 | Technical but standard for the audience. |
| 22 | Secret access key | 3 | Technical but standard for the audience. |
| 23 | Temporary credentials | 2 | — |
| 24 | Session token | 2 | — |
| 25 | Optional | 1 | — |
| 26 | Remember on this device | 4 | — |
| 27 | Stores credentials in localStorage. | 4 | J/T: “Saves credentials in this browser until you disconnect.” |
| 28 | Leave off on shared machines. | 5 | — |
| 29 | Before connecting | 2 | — |
| 30 | Your endpoint must allow this site’s origin in its CORS configuration. | 11 | J: “Your storage server must allow browser requests from this site.” |
| 31 | See a starter rule | 4 | Action: “View a CORS starter rule.” |
| 32 | Test & connect | 2 | Result-naming verb; pass. Prefer “Test and connect.” |
| 33 | Required once per endpoint | 4 | J/T: “Set up each storage server once.” |
| 34 | Browser access needs CORS. | 4 | J: “Allow this site to reach your storage server.” |
| 35 | Add the console origin to your store’s CORS rules, allow GET, PUT, POST, DELETE and HEAD, and expose ETag for multipart uploads. | 22 | J/multiple ideas: “Allow this site in your store’s CORS rules. Allow the five listed methods, and expose ETag for large uploads.” |
| 36 | Open-source utility. | 2 | Unlisted claim; link “Open source” to the license/source. |
| 37 | No telemetry. | 2 | Unlisted privacy claim; add an interception test. |
| 38 | Generated illustration disclosed. | 3 | H: “Artwork provenance” linked to the design record. |
| 39 | Privacy | 1 | — |
| 40 | Terms | 1 | — |
| 41 | Source | 1 | —; the external-arrow marker is present. |

No visible landing button uses a generic “Submit,” “Go,” or “Continue.” The main action failure is absence and placement, not the wording of “Test & connect.”

### README

| # | Copy | Words | Flag and proposed rewrite |
| ---: | --- | ---: | --- |
| 1 | S3 Console | 2 | — |
| 2 | A fast, self-hostable web console for any S3-compatible object store. | 10 | M: “A self-hosted web console for S3-compatible object stores.” |
| 3 | It is for self-hosters and small operations teams who need one UI for Garage, RustFS, SeaweedFS, Ceph RGW, Versity, AWS S3, and other standards-based stores. | 25 | L/T: “Built for self-hosters and small ops teams managing S3-compatible stores.” Put the unverified matrix separately. |
| 4 | The app has no backend. | 5 | J/T and unlisted claim: “The console has no application server.” |
| 5 | It signs standard S3 REST requests in your browser with SigV4 and sends them directly to the endpoint you enter. | 20 | J/T: “Your browser signs each S3 request and sends it directly to your storage endpoint.” |
| 6 | Credentials never transit Sociobot infrastructure. | 5 | J: “Sociobot servers never receive your storage credentials.” |
| 7 | Features | 1 | Clear heading. |
| 8 | List, create, and delete buckets, including a deliberate version-history cleanup before deleting a versioned bucket | 15 | Unlisted claim; add a period. |
| 9 | Browse object keys as prefix folders with pagination and filtering | 10 | J: “Browse object keys as folders, load more results, and filter them.” |
| 10 | Upload small files and multipart-upload larger files; download and delete objects | 11 | J: “Upload, download, and delete files. Large files use multipart upload.” |
| 11 | Read and replace object metadata and tags | 7 | Add a period. |
| 12 | Edit bucket policy JSON, CORS rules, and lifecycle rules | 9 | J: split and briefly define policy, CORS, and lifecycle. |
| 13 | Enable or suspend bucket versioning | 5 | Add a period. |
| 14 | Create expiring GET and PUT presigned URLs | 7 | J/T: “Create expiring download and upload links.” |
| 15 | Session-only credentials by default, optional device persistence, dark mode, offline app shell, keyboard and mobile layouts | 16 | J/multiple claims: split into short, testable bullets. |
| 16 | This deliberately does not manage users/IAM, replication, metrics, or vendor-specific administration APIs. | 12 | J: “It does not manage users, replication, monitoring, or provider-specific settings.” |
| 17 | Run locally | 2 | Clear heading. |
| 18 | Requires Node.js 20 or newer. | 5 | — |
| 19 | Production builds use the factory work-order command and always land in dist/. | 12 | J: “`npm run build` writes the production site to `dist/`.” |
| 20 | To run the real MinIO regression (it is skipped by default so a normal test run does not need credentials), point it at a disposable MinIO instance. | 27 | L/J: “The MinIO regression is skipped by default, so normal tests need no credentials. Run it against a disposable MinIO instance.” |
| 21 | This test creates a bucket, creates two object versions and a delete marker, then proves the browser client can remove all of them before bucket deletion. | 26 | L/T: “The test creates a bucket, two object versions, and a delete marker. It removes that history before deleting the bucket.” |
| 22 | Configure your object store | 4 | Clear heading. |
| 23 | The endpoint must allow requests from the console origin. | 9 | J: “Your storage server must allow browser requests from the console’s web address.” |
| 24 | A starting CORS rule is: | 5 | J: “Start with this browser-access (CORS) rule:” |
| 25 | Use the actual origin when self-hosting. | 6 | J: “Replace the example with the web address where you host the console.” |
| 26 | Multipart uploads need ETag exposed. | 5 | J: “Large uploads require the server to expose its ETag response header.” |
| 27 | A page served over HTTPS cannot call an HTTP endpoint because browsers block mixed content; use HTTPS on the store or serve this console from a trusted HTTP origin inside the same network. | 33 | L/J: “Browsers block HTTPS pages from calling HTTP endpoints. Use HTTPS for the store, or serve this console over trusted HTTP on the same network.” |
| 28 | Path-style addressing is the most portable default. | 7 | M/J: “Path-style URLs are the default.” |
| 29 | Choose virtual-hosted addressing only when DNS and TLS cover bucket subdomains. | 11 | J: add a concrete URL example. |
| 30 | The selected access key needs permission for every operation you intend to use. | 13 | — |
| 31 | Credential model | 2 | H/J: “Where credentials are stored.” |
| 32 | By default, the connection is stored in sessionStorage and disappears with the browser session. | 14 | J: “By default, the connection lasts only for the current browser session.” |
| 33 | “Remember on this device” moves it to localStorage. | 8 | J: “Remember on this device saves it until you disconnect or clear site data.” |
| 34 | Disconnecting removes both copies. | 4 | T: “Disconnecting removes saved connection details from this browser.” |
| 35 | The app has no cookies, trackers, analytics, credential proxy, or remote application database. | 13 | J/T: “The console uses no cookies, tracking, analytics, or remote data store.” |
| 36 | See /privacy in the app. | 5 | Action/link: “Read the privacy policy.” |
| 37 | Anyone with access to an unlocked browser profile may be able to read locally stored credentials. | 16 | — |
| 38 | Prefer short-lived session credentials and least-privilege policies. | 7 | J: “Use temporary credentials with only the permissions you need.” |
| 39 | Compatibility notes | 2 | H: “Tested object stores.” |
| 40 | The client uses AWS Signature Version 4, ListObjectsV2 continuation tokens, standard multipart upload, and public bucket configuration APIs. | 18 | J/T: keep in a technical implementation section, not compatibility summary. |
| 41 | Backend behavior still varies: | 4 | T: “Object-store behavior varies:” |
| 42 | Backend \| Expected mode \| Validation status | 5 | T: “Object store \| URL format \| Test status.” |
| 43 | MinIO RELEASE.2025-09-07 \| Path-style \| End-to-end local validation completed; this release returns NotImplemented for bucket CORS | 14 | J: “MinIO … Tested locally; this release does not support bucket CORS.” |
| 44 | AWS S3 \| Virtual-hosted or path-style \| Standard API implementation; live account not exercised in this build | 15 | Misleading claim: “Not tested against a live AWS S3 account.” |
| 45 | Garage \| Path-style \| Standard API implementation; pending community matrix | 8 | Misleading claim: “Not yet tested.” |
| 46 | RustFS \| Path-style \| Standard API implementation; pending community matrix | 8 | Misleading claim: “Not yet tested.” |
| 47 | SeaweedFS \| Path-style \| Standard API implementation; pending community matrix | 8 | Misleading claim: “Not yet tested.” |
| 48 | Ceph RGW \| Path-style \| Standard API implementation; pending community matrix | 9 | Misleading claim: “Not yet tested.” |
| 49 | Versity \| Path-style \| Standard API implementation; pending community matrix | 8 | Misleading claim: “Not yet tested.” |
| 50 | Unsupported configuration calls surface the backend’s error without pretending the change succeeded. | 12 | T/unlisted: “The console shows the storage server’s error and leaves the setting unchanged.” |
| 51 | Docker | 1 | Clear heading. |
| 52 | The image is a static nginx container. | 7 | J: acceptable in the Docker section; unlisted claim. |
| 53 | It does not proxy S3 traffic. | 6 | Unlisted privacy/architecture claim. |
| 54 | Deploy | 1 | Clear heading. |
| 55 | Upload dist/ to any static host. | 6 | Overbroad “any”: “Upload `dist/` to a static host that supports SPA fallback.” |
| 56 | staticwebapp.config.json configures Azure Static Web Apps route fallback and security headers; _headers provides equivalent guidance for hosts supporting that convention. | 20 | J: split into two host-specific sentences. |
| 57 | Do not put credentials in build-time environment variables. | 8 | — |
| 58 | Fingerprint-named files under /assets/ are served with a one-year immutable cache policy. | 12 | J: acceptable deployment detail; unlisted claim. |
| 59 | The HTML shell, manifest, and service worker instead use no-cache, max-age=0, must-revalidate so new releases and service-worker updates are discovered promptly. | 22 | J: split the header value from its reason. |
| 60 | Keep these rules when adapting the deploy configuration to another static host. | 12 | — |
| 61 | License | 1 | Clear heading. |
| 62 | MIT. | 1 | — |
| 63 | The interface and generated artwork are original to this repository; asset provenance is documented in .factory/design.md. | 16 | T/unlisted: use “console” instead of “interface”; make the path a link. |

### Terminology table

| Concept | Terms currently used | Use consistently |
| --- | --- | --- |
| Product | console, UI, app, client, interface, workbench | console |
| Remote service | object store, store, endpoint, backend, system | object store; use endpoint only for its URL |
| Generated access | presigned link, presigned URL | presigned link |
| Saved browser data | device persistence, sessionStorage, localStorage, browser session | session-only / saved on this device; put API names in technical notes |
| URL mode | addressing, path-style, virtual-hosted, expected mode | URL format; define path-style and bucket subdomain |

## Positive checks that do not change the verdict

- The visual system is distinct and consistent with the repository’s neo-brutalist utility thesis.
- The live root produced no console errors in either fresh viewport.
- The page has no horizontal overflow at 390 px.
- Automated Axe checks reported no violations on Home, Privacy, or Terms at either viewport.
- The page has `lang="en"`, one h1, one main landmark, ordered headings, image alt text, visible focus styling, and a reduced-motion override.
- All crawled links and public support files returned HTTP 200.
- The clean-clone unit suite and production build passed.

These checks verify the listed implementation details only. They do not make the product clear or tryable within the required first read, and they do not provide a verifiable claims contract.
