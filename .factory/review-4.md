# Adversarial first-read review 4

- Product: S3 Console
- Live URL: <https://s3-console.sociobot.in>
- Review date: 2026-08-28 UTC
- Repository base: `f083dc02b3953e684f39ee15fe736f4999479308`
- Clean checkout: `/tmp/s3-console-review4-clean.PYGzhX/repo`
- Contexts: fresh Chromium at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

Two findings remain. `F-4-1` is a blocking regression of prior finding M3: the mobile demo hides the compact route navigation in its header. `F-4-2` is minor copy drift on both the landing page and README. The demo, sandbox boundary, declared claims, routing, metadata, and the earlier repairs otherwise rechecked successfully.

## Cold first read

Before scrolling, at both 390 px and desktop:

| Question | Cold answer |
| --- | --- |
| What does it do? | It lets me manage S3-compatible storage from a browser. |
| For whom? | Self-hosters and small operations teams managing buckets at different providers. |
| What should I click first? | **Try it with sample data**. It says it opens a disposable storage workspace. |

The exact copy making this possible is “Manage S3-compatible storage from your browser,” “For self-hosters and small ops teams that manage buckets across different storage providers,” and “Try it with sample data / Opens a disposable storage workspace.” The action and all three plain facts were visible in the first 844 px at 390 px and in the first 900 px on desktop. There is no first-screen blocking finding.

## Findings, ordered by severity

### F-4-1 (regression of M3) — BLOCKING — The mobile demo header removes the shared navigation

**Location / exact evidence:** At 390 px on live `/demo`, the visible header contains only the bucket-rail icon (accessible name “Show buckets”), the S3 Console wordmark, and the theme control. The `Home`, `Demo`, and `Privacy` links have zero-sized boxes. The same route on desktop exposes all three. In code, [`src/main.ts`](../src/main.ts) renders those links in `<nav class="console-links" aria-label="Console links">`, while [`src/style.css`](../src/style.css) applies `.console-links { display: none; }` at the 900 px breakpoint.

**Why this is blocking:** The site-structure contract requires a consistent header on every route, including the wordmark-to-home link and the compact site navigation. A phone visitor in the actual console cannot reach Privacy or the demo landing navigation without scrolling to the footer. The bucket rail is product navigation, not a replacement for Privacy or the standard routes. This means prior M3 was only fixed on desktop and legal/landing views, not on the phone context explicitly required by this review.

**Concrete fix:** Keep a visible 44 px mobile route control in the console header. It must expose Home, Demo, and Privacy (for example, a labelled “Menu” button that opens a focus-managed menu), while retaining the separate “Show buckets” control. Add a 390 px route-shell assertion that each required header destination is visibly operable on `/demo`.

### F-4-2 — Minor — Landing and README use an undefined adjective for the core target

**Location / exact quote:** Landing context label: “**Portable object-store console** // v1.0.” README introduction: “S3 Console is for self-hosters and small ops teams using **portable S3 endpoints**.”

**Why this matters:** “Portable” is undefined and drifts from the product’s established terms, “S3-compatible object store” and “different storage providers.” An operator cannot tell whether it means portable credentials, portable data, or compatible implementations. The landing label also makes no useful sense out of context. The README sentence is absent from the committed copy-audit table, so that audit does not actually list every README sentence as required.

**Concrete fix:** Replace the landing label with “S3-compatible object-store console // v1.0.” Replace the README sentence with: “S3 Console is for self-hosters and small ops teams using S3-compatible object stores from different providers.” Add that sentence, with its word count, to `.factory/copy-audit.md`.

## Copy audit

Counts treat hyphenated terms and identifiers as one word. Labels, headings, and actions are included because they are visitor-facing copy. No item below exceeds 22 words. `F-4-2` flags the only undefined adjective; unavoidable configuration terms appear only in the connection/setup path and are locally explained.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Clear skip action. |
| S3 Console | 2 | Product name. |
| Home / Demo / Privacy | 1 / 1 / 1 | Clear navigation labels. |
| Portable object-store console // v1.0 | 4 | **F-4-2.** Undefined adjective and context-free label. |
| Manage S3-compatible storage from your browser | 6 | Clear job-first h1. |
| For self-hosters and small ops teams that manage buckets across different storage providers. | 13 | Clear audience and situation. |
| Try it with sample data | 5 | Result-naming action. |
| Opens a disposable storage workspace. | 5 | Explains the result. |
| Connect your object store | 4 | Result-naming action and heading. |
| Open source | 2 | Covered by `open-source`. |
| Your secret key is not sent in storage requests | 9 | Covered by `credential-routing`. |
| Your endpoint must allow browser requests | 6 | Configuration prerequisite; exercised by diagnostics/CORS claims. |
| Signed storage requests go only to your chosen endpoint. | 9 | Covered by `credential-routing`. |
| Storage endpoint URL / Region / URL format | 3 / 1 / 2 | Clear field labels for the stated audience. |
| Path-style URLs / Bucket subdomain URLs | 2 / 3 | Configuration choices with adjacent help. |
| Choose bucket subdomains only when your DNS and certificate support them. | 11 | Concrete setup help. |
| Access key ID / Secret access key / Temporary credentials | 3 / 3 / 2 | Audience-specific field labels. |
| Remember on this device | 4 | Clear opt-in label. |
| Saves credentials in this browser until you disconnect. | 8 | Covered by storage/disconnect claims. |
| Leave off on shared machines. | 5 | Clear safety instruction. |
| Before connecting | 2 | Clear section label. |
| Your storage server must allow browser requests from this site. | 10 | Configuration prerequisite. |
| View a browser-access starter rule | 5 | Result-naming action. |
| Test and connect | 3 | Result-naming action. |
| Three steps / How it works | 2 / 3 | Clear section labels. |
| Connect / Enter one storage endpoint and access key. | 1 / 7 | Clear step and instruction. |
| Browse / Open buckets and inspect object details. | 1 / 6 | Clear step and instruction. |
| Change / Upload files or edit supported bucket settings. | 1 / 7 | Clear within the three-step list. |
| Set up each storage server once | 6 | Clear section label. |
| Allow browser requests | 3 | Clear heading. |
| Add this site to the object store’s browser-access rules. | 9 | Concrete setup instruction. |
| This console sends GET, PUT, POST, DELETE, and HEAD requests. | 10 | Covered by `cors-starter-rule`. |
| Expose the `ETag` response header so large uploads can finish. | 10 | Covered by `multipart-upload`; term is explained in README. |
| Product boundary / Storage operations, not provider accounts | 2 / 5 | Clear scope labels. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | Covered by `scope-boundary`. |
| Manage S3-compatible storage from your browser. | 6 | Footer one-liner. |
| Build v1.0.0 · polish-3 | 3 | Build identifier. |
| Terms / Source / Artwork provenance / Built by Param Factory | 1 / 1 / 2 / 4 | Clear footer destinations; external destinations are announced. |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| S3 Console | 2 | Title. |
| Manage S3-compatible storage from your browser. | 6 | Clear summary. |
| S3 Console is for self-hosters and small ops teams using portable S3 endpoints. | 13 | **F-4-2.** |
| Try the isolated sample workspace. | 5 | Result-naming link. |
| It needs no endpoint or credentials. | 6 | Covered by `demo-sandbox`. |
| Creates and safely deletes buckets. | 5 | Covered by `bucket-management`. |
| Browses object folders and filters names. | 5 | Covered by `object-browser`. |
| Uploads, downloads, and deletes objects. | 5 | Covered by the three object claims. |
| Copies objects or moves them after a successful copy. | 9 | Covered by `object-copy` and `object-move`. |
| Edits object metadata and tags. | 5 | Covered by metadata/tag claims. |
| Edits policy, browser-access, and lifecycle rules. | 6 | Covered by three settings claims. |
| Enables or suspends bucket versioning. | 5 | Covered by `versioning-edit`. |
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
| Read the live privacy policy and terms. | 6 | Clear legal links. |
| Run one declared product claim with its command in `.factory/claims.json`. | 10 | Clear test instruction. |
| The browser suite starts the production preview automatically. | 7 | Accurate test instruction. |
| An optional integration command accepts a disposable MinIO endpoint. | 9 | Clear optional-test instruction. |
| It exercises version-aware bucket cleanup and multipart uploads over the direct browser client. | 13 | Test-scope explanation. |
| The object store must allow requests from the console’s web address. | 11 | Setup prerequisite. |
| Start with this browser-access rule. | 5 | Clear instruction. |
| Replace the web address when self-hosting. | 6 | Clear instruction. |
| These are the five request methods the console sends. | 9 | Covered by `cors-starter-rule`. |
| Expose the `ETag` response header so large uploads can finish. | 10 | Covered by `multipart-upload`. |
| Some object stores label this setting “exposed response headers.” | 9 | Explains provider terminology. |
| Browsers block HTTPS pages from calling HTTP endpoints. | 8 | Covered by `connection-diagnostics`. |
| Use HTTPS for the object store when this console uses HTTPS. | 11 | Concrete correction. |
| Path-style URLs are the default. | 5 | Covered by `path-style-default`. |
| Use bucket subdomain URLs only when DNS and TLS cover those subdomains. | 12 | Concrete correction. |
| `npm run build` writes the static site to `dist/`. | 8 | Covered by `build-output`. |
| The repository includes Azure Static Web Apps routing, headers, and cache rules. | 10 | Covered by deployment configuration assertions. |
| S3 Console uses the MIT License. | 6 | Covered by `open-source`. |
| Its original generated artwork is documented in `.factory/design.md`. | 8 | Covered by `artwork-provenance`. |

The JSON CORS example and shell commands are data/commands rather than prose sentences. No unlisted landing or README product claim was found: every capability, privacy/storage boundary, setup behavior, offline behavior, theme behavior, source/license, artwork, and build assertion maps to the declared claim suite noted above.

## Demo and sandbox verification

| Check | Result | Evidence |
| --- | --- | --- |
| One-click entry | Pass | The first-screen action opens `/demo`; direct `/demo` and `/?demo=1` both set title “Demo — S3 Console.” |
| Useful first demo screen | Pass | At 390 px the first screen immediately shows the `media-archive` sample object ledger, three sample buckets, and `brand`/`campaigns` folders. |
| Isolation banner | Pass | Persistent “Demo — sample data, nothing is saved,” “Reset demo,” and “Start for real” controls are visible. |
| Reset and exit | Pass | `@claim:demo-sandbox` creates `scratch-space`, verifies it disappears after Reset, then exits to the home h1. Direct live Reset also produced no storage write or request. |
| Real-data boundary | Pass | Fresh live demo had no cookies, local-storage keys, or session-storage keys. The code uses the in-memory `DemoClient`; `@claim:privacy-boundary` mutates, resets, exits, intercepts origins, and asserts both stores. |
| Offline/cache boundary | Pass | `@claim:offline-shell` and `@claim:offline-cache-boundary` passed. The latter connects to a mocked store and checks Cache Storage contains only public same-origin shell files, never bucket/object/credential data. |

## Claims and clean-clone execution

I read all 31 entries in `.factory/claims.json` and ran every declared command from the clean checkout after `npm ci` (0 vulnerabilities). All passed. The 27 browser-tag commands cover `demo-sandbox` through `path-style-default`; the four repository-tag commands cover `connection-diagnostics`, `open-source`, `artwork-provenance`, and `build-output`.

| Command group | Result |
| --- | --- |
| Every individual `npm run test:claims -- --grep @claim:<browser-id>` command | Pass — 27/27. |
| `npm test -- -t @claim:connection-diagnostics` | Pass. |
| `npm test -- -t @claim:open-source` | Pass. |
| `npm test -- -t @claim:artwork-provenance` | Pass. |
| `npm run build && npm test -- -t @claim:build-output` | Pass. |
| Aggregate `npm run test:claims` | Pass — 27/27 browser tests. |
| `npm test` with no assumed `dist/` | Pass — build succeeded, 16 tests passed, one optional MinIO integration skipped. |

No claim test failed, and no live claim-like landing/README sentence lacks a manifest entry or a directly matching claim context.

## Earlier findings recheck

I read `review-1.md`, `review-2.md`, `review-3.md`, `polish-1.md`, `polish-2.md`, `polish-3.md`, and the previous handoff. The following are confirmed on live pages and in the implementation, except M3 as recorded in `F-4-1`.

| Earlier IDs | Current result | Live/code evidence |
| --- | --- | --- |
| B1, M1, M6, m1, m2 | Fixed | Phone/desktop cold read has job, audience, sample action, result text, three facts, plain setup wording, and ≤22-word copy. |
| B2 | Fixed | `/demo` and `?demo=1` provide a realistic in-memory workspace, banner, reset, and real-mode exit. |
| B3, U01–U32 | Fixed | 31-entry manifest has one tagged observable test per retained product claim; all commands passed. Overbroad provider, speed, deployment, and protocol marketing remains absent. |
| B4, M2, M4, F-2-2 | Fixed | Demo/legal/not-found deep links set route metadata; navigation/back moves focus to h1, announces it, and resets scroll. A missing asset returned the complete HTTP 404. |
| M3 | **Regressed/half-fixed — F-4-1** | SPA/footer shell is shared, but the mobile console header deliberately hides the required route links. |
| M5 | Fixed | Live 390 px scans found no horizontal overflow or visible sub-44 px controls. |
| F-2-1 | Fixed | Clean `npm test` builds first and passes with no pre-existing `dist/`. |
| F-2-3 | Fixed | The untested “Free” assertion remains removed; “Open source” is declared and tested. |
| F-2-4, F-2-5, F-2-6 | Fixed | Multipart, default path-style, and copy/move safety have declared tests and demo paths. |
| F-3-1, F-3-2, F-3-3, F-3-4 | Fixed | Precise secret-key wording, local+session demo storage check, exact CORS-method contract, and explained `ETag` setup remain live and tested. |
| P1, P2, P3 | Fixed | Version-safe cleanup/multipart coverage, static cache configuration, and runnable lint/test/browser commands remain in code. |

## Structure, accessibility, links, and visual identity

| Check | Result |
| --- | --- |
| Titles, descriptions, canonical, OG/Twitter, favicon, touch icon, lang, one h1/main | Pass on `/`, `/demo`, `?demo=1`, `/privacy`, `/terms`, client 404, and the host-served missing-asset 404. |
| Designed 404 | Pass. Client unknown routes show “This storage aisle does not exist”; `assets/review4-missing.webp` returned HTTP 404. |
| Deep links / back button / focus / announcements | Pass. `/` → Privacy focused “How your storage data is handled,” set polite status text, and scroll position 0; Back focused the home h1 and restored its title/status. |
| Link crawl | Pass. All same-origin links returned 200; GitHub source, artwork provenance, and Sociobot returned 200. |
| Header/footer | **Fail only on mobile demo header: F-4-1.** Footer includes Privacy, Terms, source, provenance, Param Factory, and build ID. |
| Console errors / serious or critical accessibility failures | Pass in cold live checks and the browser axe suite. |
| Visual identity | Pass. The cream paper, ink rules, safety-orange actions, mono labels, offset shadows, and original storage-crate art match the documented neo-brutalist field-instrument direction. This is not a generic SaaS template. |

## Missed leverage and AI check

No finding. Copy/move, upload/download, settings, signed links, and offline sample access cover the obvious storage-console workflow. An AI feature would be decorative for deterministic S3 administration, and no embedded provider key or unexplained AI feature is present.

## What would make this perfect

Make the three standard route destinations visibly reachable from the 390 px console header, then remove both uses of “portable” in favor of the established S3-compatible object-store wording and record the README sentence in the complete copy audit. Re-run the mobile route-shell test and the copy audit after those changes.
