# Adversarial first-read review 5

- Product: S3 Console
- Live URL: <https://s3-console.sociobot.in>
- Review date: 2026-08-28 UTC
- Repository base: `cbbdf3ba149fd44c4ab609e95aa4d168b2fbe6f9`
- Clean clone: `/tmp/s3-console-review5-clean.FVttaK/repo`
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

One blocking claims-coverage regression and five minor findings remain. No runtime, privacy, accessibility, or build defect reproduced. A pass is unavailable because an earlier finding is only half-fixed and the required verdict is PASS only with zero findings and no unlisted or incompletely tested claim.

## Cold first read

Before scrolling, both viewports answered all three required questions:

| Question | First-time answer |
| --- | --- |
| What does it do? | It manages S3-compatible storage from a browser. |
| For whom? | Self-hosters and small operations teams that manage buckets across providers. |
| What should I click first? | **Try it with sample data**. It is the orange primary action and says it opens a disposable workspace. |

The exact text was “Manage S3-compatible storage from your browser,” “For self-hosters and small ops teams that manage buckets across different storage providers,” and “Try it with sample data.” All were visible above the fold. This part is not blocking.

## Findings, ordered by severity

### F-5-1 (earlier U14) — BLOCKING — Versioning suspension remains unlisted and untested

**Location / quote:** README: “Enables or suspends bucket versioning.” The manifest says only “Enables and reloads bucket versioning.” The `@claim:versioning-edit` test checks the box, saves, and confirms `Enabled`; it never unchecks and confirms `Suspended`.

**Why:** An operator may rely on the advertised reverse operation. The UI implementation appears to support it, but the public claim contract does not prove it. Review 1's U14 covered the same “enable or suspend” sentence; because only the enable half was added to the claim and test, that earlier finding is half-fixed and is blocking again under this review's history rule.

**Concrete fix:** Change the manifest claim to “Enables or suspends bucket versioning,” then extend its one tagged test to save and reload both states. Alternatively, narrow the README to “Enables bucket versioning.”

### F-5-2 — Minor — The three first-screen facts omit price and offline status

**Location / quote:** Home first-screen facts: “Open source”; “Your secret key is not sent in storage requests”; “Your endpoint must allow browser requests.”

**Why:** The mandatory first-screen fact set is privacy, offline behavior, and price. “Open source” does not say whether use costs money, and the endpoint prerequisite is setup advice rather than offline status. A phone visitor cannot confirm either price or offline scope in 30 seconds.

**Concrete fix:** Use “Free to use,” “The sample workspace reloads offline after one visit,” and “Your secret key is not sent in storage requests.” Keep the endpoint prerequisite beside the connection form. Add a `free-to-use` claim and test before publishing “Free to use”; `offline-shell` and `credential-routing` already cover the other two facts.

### F-5-3 — Minor — The mobile sample-result caption is visually attached to the wrong action

**Location / quote:** At 390 px the order is “Try it with sample data,” then “Connect your object store,” then “Opens a disposable storage workspace.” The primary action ends at y=444, the secondary action ends at y=504, and the caption starts at y=520. In `src/style.css`, `.hero-actions > span { order: 3; }` deliberately moves the caption after both actions.

**Why:** The caption is 16 px below “Connect your object store” but 76 px below the sample action. It therefore reads as the result of connecting a real store, not the result of trying the sample.

**Concrete fix:** Keep the caption immediately below the sample action on mobile, then place “Connect your object store” after that pair. Add a 390 px assertion that the caption's top edge precedes the secondary action's top edge.

### F-5-4 — Minor — Bucket-subdomain routing is exposed but absent from the claims contract

**Location / quote:** Landing selector: “Bucket subdomain URLs”; landing and README: “Choose/Use bucket subdomain URLs only when DNS and TLS cover those subdomains.” The manifest tests only `path-style-default`.

**Why:** Selecting this option promises a materially different request destination. An untagged unit test covers virtual-hosted addressing, but no `.factory/claims.json` entry exposes that test to a verifier and no browser claim test exercises the visible selector.

**Concrete fix:** Add `bucket-subdomain-routing` to the manifest. In a fresh real-mode browser sandbox, select the option, connect to a mocked endpoint, and assert that the bucket becomes the request hostname, the object remains in the path, and signing still succeeds. Include the DNS/TLS guidance in that claim's `where` field.

### F-5-5 — Minor — The deployment-configuration sentence is not covered by its listed claim

**Location / quote:** README: “The repository includes Azure Static Web Apps routing, headers, and cache rules.” `build-output` only claims that the build writes a static site and its tagged test only checks that `dist/index.html` and `dist/staticwebapp.config.json` exist.

**Why:** File existence does not verify the promised routing, security headers, or cache rules. `src/deployment-config.test.ts` does check some of this, but its tests have no claim tag and are excluded by the exact `build-output` command's name filter.

**Concrete fix:** Add a `static-host-config` manifest entry and tag the existing deployment tests. Assert the fallback and 404 contract, security headers, revalidation for HTML/worker, and immutable caching for fingerprinted assets. Alternatively, remove this README sentence.

### F-5-6 — Minor — Three workflow headings do not make sense independently

**Location / quote:** Landing “How it works” subheadings: “Connect,” “Browse,” and “Change.”

**Why:** A screen-reader heading list loses the adjacent explanatory sentences. “Change” in particular does not identify what changes. These headings fail the requirement that headings make sense out of context.

**Concrete fix:** Rename them “Connect an object store,” “Browse buckets and objects,” and “Upload files and edit settings.”

## Copy audit

Counts treat hyphenated terms, identifiers, and quoted control names as one word. No sentence exceeds 22 words. No banned marketing adjective appears. Necessary operator terms such as S3, endpoint, ETag, DNS, TLS, and MinIO occur in setup or test context. Terminology is otherwise consistent: console, S3-compatible object store, endpoint, sample workspace, signed link, session storage, and local storage.

### Live landing page and route shell

| Exact copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Clear action. |
| S3 Console | 2 | Product name. |
| Home / Demo / Privacy | 1 / 1 / 1 | Clear navigation. |
| S3-compatible object-store console // v1.0 | 4 | Concrete context label. |
| Manage S3-compatible storage from your browser | 6 | Clear job-first h1. |
| For self-hosters and small ops teams that manage buckets across different storage providers. | 13 | Clear audience and situation. |
| Try it with sample data | 5 | Result-naming primary action; mobile placement is F-5-3. |
| Opens a disposable storage workspace. | 5 | Clear result; mobile placement is F-5-3. |
| Connect your object store | 4 | Result-naming action and h2. |
| Open source | 2 | Accurate, but the fact set is F-5-2. |
| Your secret key is not sent in storage requests | 9 | Covered by `credential-routing`. |
| Your endpoint must allow browser requests | 6 | Setup requirement; the fact set is F-5-2. |
| Signed storage requests go only to your chosen endpoint. | 9 | Covered by `credential-routing`. |
| Choose bucket subdomains only when your DNS and certificate support them. | 11 | F-5-4. |
| Saves credentials in this browser until you disconnect. | 8 | Covered by credential storage/disconnect claims. |
| Leave off on shared machines. | 5 | Clear safety instruction. |
| Before connecting | 2 | Clear disclosure heading. |
| Your storage server must allow browser requests from this site. | 10 | Covered by diagnostics and CORS claims. |
| View a browser-access starter rule | 5 | Result-naming action. |
| Test and connect | 3 | Result-naming action. |
| How it works | 3 | Clear h2. |
| Connect | 1 | F-5-6. |
| Enter one storage endpoint and access key. | 7 | Clear instruction. |
| Browse | 1 | F-5-6. |
| Open buckets and inspect object details. | 6 | Clear instruction. |
| Change | 1 | F-5-6. |
| Upload files or edit supported bucket settings. | 7 | Clear instruction. |
| Allow browser requests | 3 | Clear h2. |
| Add this site to the object store’s browser-access rules. | 9 | Clear setup instruction. |
| This console sends GET, PUT, POST, DELETE, and HEAD requests. | 10 | Covered by `cors-starter-rule`. |
| Expose the ETag response header so large uploads can finish. | 10 | Covered by `multipart-upload`. |
| Storage operations, not provider accounts | 5 | Clear h2. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | Covered by `scope-boundary`. |
| Manage S3-compatible storage from your browser. | 6 | Footer one-liner. |
| Privacy / Terms / Source / Artwork provenance / Built by Param Factory | 1 / 1 / 1 / 2 / 4 | Clear footer destinations. |

### README

| Exact sentence | Words | Result |
| --- | ---: | --- |
| Manage S3-compatible storage from your browser. | 6 | Clear summary. |
| S3 Console is for self-hosters and small ops teams using S3-compatible object stores from different providers. | 16 | Clear audience. |
| Try the isolated sample workspace. | 5 | Result-naming link. |
| It needs no endpoint or credentials. | 6 | Covered by `demo-sandbox`. |
| Creates and safely deletes buckets. | 5 | Covered by `bucket-management`. |
| Browses object folders and filters names. | 5 | Covered by `object-browser`. |
| Uploads, downloads, and deletes objects. | 5 | Covered by three object claims. |
| Copies objects or moves them after a successful copy. | 9 | Covered by copy/move claims. |
| Edits object metadata and tags. | 5 | Covered by metadata/tag claims. |
| Edits policy, browser-access, and lifecycle rules. | 6 | Covered by settings claims. |
| Enables or suspends bucket versioning. | 5 | F-5-1. |
| Creates expiring download and upload links. | 6 | Covered by signed-link claims. |
| Keeps the sample workspace available after an offline reload. | 8 | Covered by `offline-shell`. |
| Offers light and dark themes. | 5 | Covered by `theme-choice`. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | Covered by `scope-boundary`. |
| Your browser signs storage requests and sends them to the endpoint you choose. | 12 | Covered by `credential-routing`. |
| Your secret key is not sent in storage requests. | 9 | Covered by `credential-routing`. |
| Connections use session storage by default. | 6 | Covered by `credential-storage`. |
| “Remember on this device” uses local storage. | 7 | Covered by `credential-storage`. |
| Disconnecting clears both copies. | 4 | Covered by `credential-disconnect`. |
| The sample workspace is in memory. | 5 | Covered by `demo-sandbox`. |
| It sends no storage requests, sets no cookies, and writes no normal storage keys. | 14 | Covered by `privacy-boundary`. |
| Read the live privacy policy and terms. | 6 | Clear links. |
| Run one declared product claim with its command in `.factory/claims.json`. | 10 | Verified instruction. |
| The browser suite starts the production preview automatically. | 7 | Directly observed in the aggregate browser run. |
| An optional integration command accepts a disposable MinIO endpoint. | 9 | Directly exercised with pinned disposable MinIO. |
| It exercises version-aware bucket cleanup and multipart uploads over the direct browser client. | 13 | Directly exercised with pinned disposable MinIO. |
| The object store must allow requests from the console’s web address. | 11 | Covered by connection/CORS claims. |
| Start with this browser-access rule. | 5 | Clear instruction. |
| Replace the web address when self-hosting. | 6 | Clear instruction. |
| These are the five request methods the console sends. | 9 | Covered by `cors-starter-rule`. |
| Expose the ETag response header so large uploads can finish. | 10 | Covered by `multipart-upload`. |
| Some object stores label this setting “exposed response headers.” | 9 | Explanatory provider terminology. |
| Browsers block HTTPS pages from calling HTTP endpoints. | 8 | Covered by `connection-diagnostics`. |
| Use HTTPS for the object store when this console uses HTTPS. | 11 | Corrective instruction covered by diagnostics. |
| Path-style URLs are the default. | 5 | Covered by `path-style-default`. |
| Use bucket subdomain URLs only when DNS and TLS cover those subdomains. | 12 | F-5-4. |
| `npm run build` writes the static site to `dist/`. | 8 | Covered by `build-output`. |
| The repository includes Azure Static Web Apps routing, headers, and cache rules. | 10 | F-5-5. |
| S3 Console uses the MIT License. | 6 | Covered by `open-source`. |
| Its original generated artwork is documented in `.factory/design.md`. | 8 | Covered by `artwork-provenance`. |

README headings are “What it does” (3), “Privacy and credentials” (3), “Run and test” (3), “Configure an object store” (4), “Deploy” (1), and “License and artwork” (3). Each makes sense out of context. Commands and JSON keys are data rather than prose sentences.

## Demo and sandbox verification

| Check | Result | Evidence |
| --- | --- | --- |
| One-click entry | Pass | The first-screen action opens `/demo`; `/?demo=1` also enters directly. |
| Immediate realistic use | Pass | The first demo screen shows `media-archive`, `nightly-backups`, `static-site`, and realistic `brand`/`campaigns` folders. |
| Persistent banner | Pass | “Demo — sample data, nothing is saved,” Reset demo, and Start for real remain visible. |
| Reset | Pass | Created `scratch-space`, reset, and confirmed it disappeared. |
| Real-data isolation | Pass | The full demo mutation/reset/exit test saw no cookies, normal local/session keys, or off-origin requests. Fresh live inspection found empty local/session stores and no IndexedDB database. |
| Offline | Pass | The service-worker-controlled sample workspace reloaded after network interception set the context offline. |
| Cache boundary | Pass | The cache test found only public same-origin shell files and no object-store response, object name, or credential content. |

## Claims execution

All 31 exact commands in `.factory/claims.json` passed individually from the clean clone. There was no failing listed claim.

| Claim | Result | Claim | Result |
| --- | --- | --- | --- |
| demo-sandbox | PASS | bucket-management | PASS |
| object-browser | PASS | object-upload | PASS |
| object-download | PASS | object-delete | PASS |
| object-copy | PASS | object-move | PASS |
| metadata-edit | PASS | tag-edit | PASS |
| policy-edit | PASS | cors-edit | PASS |
| lifecycle-edit | PASS | versioning-edit | PASS, with F-5-1 scope gap |
| presigned-download | PASS | presigned-upload | PASS |
| privacy-boundary | PASS | offline-cache-boundary | PASS |
| credential-storage | PASS | credential-disconnect | PASS |
| credential-routing | PASS | offline-shell | PASS |
| theme-choice | PASS | scope-boundary | PASS |
| connection-diagnostics | PASS | multipart-upload | PASS |
| cors-starter-rule | PASS | path-style-default | PASS, with F-5-4 alternate-mode gap |
| open-source | PASS | artwork-provenance | PASS |
| build-output | PASS, with F-5-5 scope gap |  |  |

Additional clean-clone results: `npm run lint` passed; `npm run test:clean` built `dist/` and passed 16 tests with only the endpoint-gated MinIO test skipped; `npm run test:browser` passed 35/35; and the pinned MinIO `RELEASE.2025-09-07T16-13-09Z` integration passed separately against a disposable server, including multipart byte round-trip and version/delete-marker cleanup.

## Earlier finding recheck

Every earlier review, polish record, verification record, and handoff was read. Each earlier finding was checked in live behavior and source rather than accepted from its status label.

| Earlier ID | Current result | Verification |
| --- | --- | --- |
| B1 | Fixed | Both cold first screens state job, audience, and sample action. |
| B2 | Fixed | Direct in-memory demo, banner, reset, exit, and isolation pass. |
| B3 | Fixed as originally reported | The manifest exists and all 31 listed commands pass; remaining scope gaps are F-5-1, F-5-4, and F-5-5. |
| B4 | Fixed | Demo routes and designed client/static 404s work. |
| M1 | Fixed as originally reported | Landing order includes orientation, preview/form, steps, setup, and scope; the newly applied fact categories are F-5-2. |
| M2 | Fixed | Route titles, descriptions, canonical/OG/Twitter metadata, icons, robots, and sitemap pass. |
| M3 | Fixed | Shared header/footer and the repaired mobile demo menu are present. |
| M4 | Fixed | Push navigation and Back settle at the correct scroll positions, focus h1, and update the polite announcement. |
| M5 | Fixed | No visible actionable control under 44 px and no 390 px overflow; the 1 px file input is intentionally screen-reader-only. |
| M6 | Fixed | Connection/setup wording is concrete and technical terms have context. |
| m1 | Fixed | No audited sentence exceeds 22 words. |
| m2 | Fixed | Product, store, endpoint, demo, link, and storage terms remain consistent. |
| U01 | Fixed | Browser/direct-request architecture is narrowed and intercepted. |
| U02 | Fixed | The overbroad “any object store” claim remains removed. |
| U03 | Fixed | Untested provider badges/matrix remain removed. |
| U04 | Fixed | Capabilities are split into specific tested statements. |
| U05 | Fixed | Copy now says only that the secret key is not sent. |
| U06 | Fixed | Requests, cookies, and both browser stores are inspected. |
| U07 | Fixed | Source link and MIT license are claimed and tested. |
| U08 | Fixed | Undefined speed and broad hosting claims remain removed. |
| U09 | Fixed | Bucket create/delete is demonstrated and version cleanup passed real MinIO. |
| U10 | Fixed | Folder/filter behavior is tested; the untested pagination wording remains removed. |
| U11 | Fixed | Upload, multipart upload, download, and delete have separate tests. |
| U12 | Fixed | Metadata and tag round trips pass. |
| U13 | Fixed | Policy, CORS, and lifecycle round trips pass. |
| U14 | **Half-fixed — BLOCKING F-5-1** | Enable/reload passes, but the same original “or suspends” wording remains outside the manifest claim and test. |
| U15 | Fixed | GET/PUT link method and 900-second expiry pass. |
| U16 | Fixed | Credential storage, theme, offline shell, keyboard, and mobile checks pass. |
| U17 | Fixed | Excluded administration controls remain absent. |
| U18 | Fixed | The untested minimum-Node statement remains removed. |
| U19 | Fixed | Clean production build writes `dist/`. |
| U20 | Fixed | Optional pinned-MinIO command passed in this review. |
| U21 | Fixed | Exact CORS methods and multipart ETag flow pass. |
| U22 | Fixed | Mixed-content and network-failure diagnostics pass. |
| U23 | Fixed as originally scoped | Comparative wording remains removed and path-style default passes; alternate mode is F-5-4. |
| U24 | Fixed | Default connection is session storage. |
| U25 | Fixed | Remember opt-in uses local storage. |
| U26 | Fixed | Disconnect clears both stores. |
| U27 | Fixed | Broad protocol copy remains removed; retained protocol behaviors are tested. |
| U28 | Fixed | The public compatibility matrix claim remains removed; pinned MinIO passed. |
| U29 | Fixed | Unverified AWS compatibility wording remains removed. |
| U30 | Fixed | Unsupported-backend success claim remains removed. |
| U31 | Fixed as originally scoped | “Any static host” remains removed; the narrower config claim has the F-5-5 contract gap. |
| U32 | Fixed | Original artwork source, disclosure, and design record pass. |
| P1 | Fixed | Pinned MinIO removed all versions/delete markers before bucket deletion. |
| P2 | Fixed | Live HTML revalidates and hashed JS is one-year immutable. |
| P3 | Fixed | Lint, unit, browser, claims, clean-build, and MinIO commands are runnable. |
| F-2-1 | Fixed | `npm run test:clean` passes without pre-existing `dist/`. |
| F-2-2 | Fixed | Static HTTP 404 has complete metadata, navigation, footer, noindex, and status 404. |
| F-2-3 | Fixed | Untested “Free” wording remains absent; F-5-2 explains how to add it correctly. |
| F-2-4 | Fixed | Multipart behavior crosses the 8 MiB threshold in browser and MinIO tests. |
| F-2-5 | Fixed | Path-style is selected by default and puts the bucket in the path. |
| F-2-6 | Fixed | Copy/move preserve details and failed copy leaves the source. |
| F-3-1 | Fixed | Precise secret-key wording remains live and tested. |
| F-3-2 | Fixed | Demo privacy test inspects local and session storage. |
| F-3-3 | Fixed | Exact CORS method set and browser preflights are tested. |
| F-3-4 | Fixed | ETag is identified as the response header needed to finish large uploads. |
| F-4-1 | Fixed | The 390 px console Menu exposes Home, Demo, and Privacy with keyboard/Escape focus behavior. |
| F-4-2 | Fixed | Undefined “portable” wording is absent from landing, README, and copy audit. |

## Structure, accessibility, and visual identity

The live `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and client not-found states each have the expected route title, description, canonical, Open Graph/Twitter metadata, favicon/touch icon, `lang=en`, one h1, and one main. The static missing-asset response is a designed HTTP 404. All discovered internal and external links returned 200, with the intentional missing-asset probe returning 404. Header/footer structure is consistent, the mobile route menu works, and push/back navigation restores scroll and focuses/announces the h1 after smooth scrolling settles.

The worker URL verifier reported no console/page errors, no missing image alt, and no unlabeled button. The Playwright Axe integration found no serious or critical issue across home, demo, privacy, terms, and 404. The live page has no horizontal overflow at 390 px, respects the tested touch targets and reduced-motion path, and loads 61.33 kB of uncompressed application JavaScript (18.78 kB gzip).

The cream paper, black rules, safety-orange action, lime demo strip, mono labels, hard shadows, and original crate artwork match the documented neo-brutalist utility direction. The result is visually distinct from the prohibited centered-gradient/three-card SaaS template.

## Missed leverage and AI check

No additional feature finding. Copy/move, multipart upload, download, filtering, metadata/tags, bucket settings, version-aware deletion, signed links, and the offline sample cover the obvious object-store workflow. An AI step would add risk and cost to deterministic storage administration, so its absence is appropriate. No AI provider key or decorative AI surface is present.

## What would make this perfect

Put price and offline scope in the first-screen facts, keep the sample-result caption adjacent to its action on mobile, expand the versioning claim test to suspension, register and browser-test bucket-subdomain routing, register the deployment-config assertions, and replace the three context-poor workflow headings. Then rerun every manifest command and the full live route/copy audit.
