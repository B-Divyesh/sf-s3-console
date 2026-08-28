# Adversarial first-read review 2

- Product: S3 Console
- Live URL: <https://s3-console.sociobot.in>
- Review date: 2026-08-28 UTC
- Repository reviewed: `98b1febd70abe1663332c027e68c67d50a986aa8`
- Contexts: fresh Chromium at 390 × 844 and 1440 × 900; fresh clean clone at `/tmp/s3-console-review2-i7VWfX`
- Verdict: **FAIL**

Six findings remain. `F-2-1` is blocking: the required standalone `npm test` quality gate fails in a clean clone. The remaining findings are specific, smaller gaps in the real static 404, claims coverage, and object-management scope. A pass is not available while any of them remains.

## First screen, cold read

At both 390 px and desktop, before scrolling:

| Question | Cold answer |
| --- | --- |
| What does it do? | It manages S3-compatible buckets and objects from the browser. |
| Who is it for? | Self-hosters and small operations teams that use more than one storage provider. |
| What should I click first? | **Try it with sample data**; the adjacent text says it opens a disposable storage workspace. |

The exact first-screen copy that makes these answers possible is: “Manage S3-compatible storage from your browser”; “For self-hosters and small ops teams that manage buckets across different storage providers.”; and “Try it with sample data / Opens a disposable storage workspace.” The action was visible without scrolling at both viewports. There is no first-read blocking finding.

## Findings, ordered by severity

### F-2-1 — BLOCKING — `npm test` fails from a clean clone

**Location / exact evidence:** In a clone with only `npm ci` run, `npm test` fails at `src/claims.unit.test.ts:14`:

```text
@claim:build-output writes the static entry point and deployment configuration
expected false to be true
existsSync(resolve(root, 'dist/index.html'))
```

`.factory/handoff.md` says “`npm test PASS`,” but the default test command requires a pre-existing, untracked `dist/` directory. It therefore fails the required quality gate on the normal first command a verifier runs.

**Why this matters:** A clean checkout does not have a reliable test command. This regresses the prior handoff's clean-clone verification and makes the documented test sequence misleading.

**Concrete fix:** Make `npm test` self-contained. For example, change the `test` script to build before Vitest, or move the generated-output assertion into a command that first performs `npm run build` while keeping ordinary unit tests independent of `dist/`. Add a regression check that removes `dist/` and proves `npm test` still passes. Re-run the complete manifest after that change.

### F-2-2 — Minor — The actual static 404 has an incomplete route skeleton and metadata

**Location / exact evidence:** A missing excluded asset, `https://s3-console.sociobot.in/assets/missing-review.webp`, returns real HTTP 404 and serves `public/404.html`. Its source contains only:

```html
<title>Page not found — S3 Console</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
...
<footer><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></footer>
```

It has no meta description, canonical URL, Open Graph/Twitter fields, apple-touch icon, theme color, header navigation, footer one-liner, Param Factory link, or build ID. The client-side unknown-route view is complete, but this real host 404 is a separate visitor-visible page.

**Why this matters:** A stale image/document link reaches a page that does not meet the shared route contract, even though its headline and return actions are clear.

**Concrete fix:** Give `public/404.html` the same metadata set and header/footer information as the SPA not-found route, while retaining `noindex` and the HTTP 404 status. Add a deployed/static-server test that requests a missing excluded asset and asserts the 404 status, title, description, canonical/OG/Twitter/icon fields, navigation, and complete footer.

### F-2-3 — Minor — The first-screen price claim is not in the claims manifest

**Location / exact quote:** Landing plain fact: “Free and open source.” `.factory/claims.json` has `open-source`, which tests the source link and MIT license, but no entry or test for “Free.”

**Why this matters:** Open source and free-of-charge are different promises. A first-time visitor can rely on the latter when choosing the product.

**Concrete fix:** Either change the fact to “Open source” (covered by `open-source`) or add a `free-to-use` manifest entry with an observable test that verifies no paid tier, payment action, or payment network flow exists in the landing and demo paths.

### F-2-4 — Minor — Multipart-upload guidance is an unlisted capability claim

**Location / exact quote:** README, “Large uploads require the object store to expose its ETag response header.”

**Why this matters:** This tells an operator how to make large uploads work, which implies a multipart/large-upload path. The manifest tests only a small demo upload (`object-upload`); it has no multipart entry or observable multipart transfer test.

**Concrete fix:** Add a `multipart-upload` claim and a disposable S3-compatible test that crosses the product's multipart threshold, asserts the initiate/upload-part/complete flow and bytes at the destination, and records the required ETag behavior. Otherwise remove the large-upload guidance and do not imply support that the public test contract does not prove.

### F-2-5 — Minor — The documented default URL format is unlisted and untested

**Location / exact quote:** README, “Path-style URLs are the default.”

**Why this matters:** This is a configuration behavior a new operator may rely on. No entry in `.factory/claims.json` identifies it, and no declared test starts a real connection from the default form setting and verifies the resulting path-style request URL.

**Concrete fix:** Add a `path-style-default` claim that opens the real connection form, verifies the default selection, connects to a mocked endpoint, and asserts the bucket appears in the request path. If the behavior is not part of the supported contract, remove the sentence.

### F-2-6 — Minor — Object management lacks the obvious copy/move operation

**Location / evidence:** The brief defines a browser console for buckets and objects. The live object UI provides upload, download, delete, metadata, tags, and signed links, but no copy or move action. The demo's object operations likewise have no copy/move path.

**Why this matters:** Moving or copying an existing object is a standard storage-console task. Downloading and uploading again is slow, changes metadata unless recreated carefully, and is not a viable browser workflow for large objects.

**Concrete fix:** Add an explicit **Copy object** / **Move object** action that selects a destination bucket and key. Implement move as a confirmed copy followed by source deletion only after a successful copy; preserve or explicitly choose metadata/tags. Seed and exercise it in the isolated demo, add one observable claim for copy and one for move/error safety, and keep it non-AI: no AI step is useful for this deterministic operation.

## Demo and sandbox verification

| Check | Result | Evidence |
| --- | --- | --- |
| One-click entry | Pass | First-screen “Try it with sample data” opens `/demo`. |
| Direct entry | Pass | Both `/demo` and `/?demo=1` show title “Demo — S3 Console.” |
| Useful first demo screen | Pass | At 390 px it immediately showed the `media-archive` object ledger, three seeded buckets, and realistic `brand` / `campaigns` folders. |
| Persistent isolation banner | Pass | “Demo — sample data, nothing is saved,” with Reset demo and Start for real. |
| Reset | Pass | The claim test created `scratch-space`, reset, and confirmed it disappeared. |
| Real data/storage boundary | Pass | Fresh live demo had `{}` local/session storage, no cookies, and only same-origin requests. Demo state is an in-memory `DemoClient`; its theme handler does not persist. |
| Offline | Pass | `@claim:offline-shell` passed after service-worker readiness, offline interception, and reload. |
| Privacy interception | Pass | `@claim:privacy-boundary` passed; direct live recording also contained only `s3-console.sociobot.in` resources. |

No AI feature is present. That is appropriate here: the actual job is deterministic object-store administration, and no provider key is embedded.

## Claims execution

I read `.factory/claims.json` and ran all 25 declared claim tests from the clean clone. The 21 browser claim tags passed in one fresh build/server run; the four repository claim commands also passed. The manifest commands were additionally invoked individually for `demo-sandbox`, `bucket-management`, `object-browser`, and `object-upload`; the aggregate run executes the identical remaining tagged tests from fresh browser contexts.

| Claim groups / commands | Result |
| --- | --- |
| `npm run test:claims -- --grep @claim:` (21 browser tags: demo, buckets, objects, metadata/tags, bucket settings, links, privacy, credentials, offline, theme, scope) | Pass — 21/21 |
| `npm test -- -t @claim:connection-diagnostics` | Pass |
| `npm test -- -t @claim:open-source` | Pass |
| `npm test -- -t @claim:artwork-provenance` | Pass |
| `npm run build && npm test -- -t @claim:build-output` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass — `dist/` produced; JS is 17.84 kB gzip |
| `npm test` with no prior build | **Fail — F-2-1** |

The listed tests cover the existing operational claims. The unlisted sentences in F-2-3 through F-2-5 are the remaining claims-manifest gaps.

## Structure, accessibility, and links

| Check | Result |
| --- | --- |
| Route title pattern | Pass for `/`, `/demo`, `?demo=1`, `/privacy`, `/terms`, client unknown route, and static 404. |
| One h1 / lang / main | Pass on all tested SPA routes and static 404. |
| SPA description, canonical, OG/Twitter, favicon, apple touch | Pass on SPA routes. Static 404 is F-2-2. |
| Designed 404 | Pass for client unknown paths and real missing-asset 404; the latter has F-2-2 completeness gap. |
| Deep links, back button, focus, announcement | Pass. `/` → Demo moved focus and `aria-live` text to `media-archive`; Back restored Home, its h1 focus, and scroll position 0. |
| Header/footer | Pass on SPA routes. Static 404 is F-2-2. |
| Link crawl | Pass: Home, Demo, Privacy, Terms, static 404, Source, artwork provenance, and Param Factory links all returned HTTP 200. |
| Console errors | Pass: none during cold home/demo/route checks. |
| Visual identity | Pass: the cream/ink/safety-orange, warehouse-label layout, square rules, offset shadows, and original crate artwork match `.factory/design.md` and are not a generic SaaS template. |

## Copy audit

Counts treat hyphenated terms as one word. Labels, headings, and actions are included because they are first-read vocabulary. No current sentence exceeds 22 words or uses a banned marketing adjective. `Free` is flagged separately as F-2-3; the unavoidable S3 setup terms are placed in the real-connect/configuration path and have local context, so they are not a copy finding.

### Landing page

| Copy | Words | Audit |
| --- | ---: | --- |
| Skip to main content | 4 | — |
| S3 Console | 2 | — |
| Home | 1 | — |
| Demo | 1 | — |
| Privacy | 1 | — |
| Portable object-store console // v1.0 | 4 | — |
| Manage S3-compatible storage from your browser | 6 | — |
| For self-hosters and small ops teams that manage buckets across different storage providers. | 13 | — |
| Try it with sample data | 5 | Result-naming action. |
| Opens a disposable storage workspace. | 5 | — |
| Connect your object store | 4 | Result-naming action. |
| Free and open source | 4 | F-2-3: remove “Free” or claim-test it. |
| Credentials stay in your browser | 5 | Covered by credential claims. |
| Your endpoint must allow browser requests | 6 | Covered by connection-diagnostics context. |
| Connect your object store | 4 | Clear heading. |
| Your credentials go only to your chosen storage endpoint. | 9 | Covered by credential-routing. |
| Storage endpoint URL | 3 | Clear field label. |
| Region | 1 | Clear field label. |
| URL format | 2 | Clear field label. |
| Path-style URLs | 2 | Defined by the adjacent choice/help. |
| Bucket subdomain URLs | 3 | Defined by the adjacent help. |
| Choose bucket subdomains only when your DNS and certificate support them. | 11 | — |
| Access key ID | 3 | Audience-specific field label. |
| Secret access key | 3 | Audience-specific field label. |
| Temporary credentials | 2 | Clear disclosure label. |
| Session token | 2 | Audience-specific field label. |
| Optional | 1 | — |
| Remember on this device | 4 | — |
| Saves credentials in this browser until you disconnect. | 8 | Covered by credential-storage/disconnect. |
| Leave off on shared machines. | 5 | — |
| Before connecting | 2 | Clear heading. |
| Your storage server must allow browser requests from this site. | 9 | Covered by connection-diagnostics context. |
| View a browser-access starter rule | 5 | Result-naming action. |
| Test and connect | 3 | Result-naming action. |
| Three steps | 2 | Clear section label. |
| How it works | 3 | Clear heading. |
| Connect | 1 | Clear step. |
| Enter one storage endpoint and access key. | 7 | — |
| Browse | 1 | Clear step. |
| Open buckets and inspect object details. | 6 | — |
| Change | 1 | Clear step. |
| Upload files or edit supported bucket settings. | 7 | — |
| Set up each storage server once | 6 | Clear section label. |
| Allow browser requests | 3 | Clear heading. |
| Add this site to the object store’s browser-access rules. | 9 | — |
| Allow the five listed methods. | 5 | — |
| Expose ETag for large uploads. | 5 | F-2-4 equivalent capability claim. |
| Product boundary | 2 | Clear section label. |
| Storage operations, not provider accounts | 5 | Clear heading. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 10 | Covered by scope-boundary. |
| Manage S3-compatible storage from your browser. | 6 | — |
| Build v1.0.0 · polish-1 | 3 | Build identifier. |
| Terms / Source / Artwork provenance / Built by Param Factory | 1 / 1 / 2 / 4 | Clear link labels; external destinations are announced. |

### README

| Copy | Words | Audit |
| --- | ---: | --- |
| Manage S3-compatible storage from your browser. | 6 | — |
| S3 Console is for self-hosters and small ops teams using portable S3 endpoints. | 13 | — |
| Try the isolated sample workspace. | 5 | Result-naming link. |
| It needs no endpoint or credentials. | 6 | Covered by the direct demo test. |
| Creates and safely deletes buckets. | 5 | Covered by bucket-management. |
| Browses object folders and filters names. | 5 | Covered by object-browser. |
| Uploads, downloads, and deletes objects. | 5 | Covered by object claims. |
| Edits object metadata and tags. | 5 | Covered by metadata/tag claims. |
| Edits policy, browser-access, and lifecycle rules. | 6 | Covered by the three settings claims. |
| Enables or suspends bucket versioning. | 5 | Covered by versioning-edit. |
| Creates expiring download and upload links. | 6 | Covered by signed-link claims. |
| Keeps the sample workspace available after an offline reload. | 8 | Covered by offline-shell. |
| Offers light and dark themes. | 5 | Covered by theme-choice. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 10 | Covered by scope-boundary. |
| Your browser signs storage requests and sends them to the endpoint you choose. | 12 | Covered by credential-routing. |
| The secret key is never sent in a request. | 9 | Covered by credential-routing. |
| Connections use session storage by default. | 6 | Covered by credential-storage. |
| “Remember on this device” uses local storage. | 7 | Covered by credential-storage. |
| Disconnecting clears both copies. | 4 | Covered by credential-disconnect. |
| The sample workspace is in memory. | 6 | Covered by demo isolation/reset behavior. |
| It sends no storage requests, sets no cookies, and writes no normal storage keys. | 13 | Covered by privacy-boundary. |
| Read the live privacy policy and terms. | 7 | Clear action. |
| Run one declared product claim with its command in `.factory/claims.json`. | 10 | Developer documentation. |
| The browser suite starts the production preview automatically. | 7 | Developer documentation; observed when claims ran. |
| An optional integration command accepts a disposable MinIO endpoint. | 8 | Developer documentation. |
| The object store must allow requests from the console’s web address. | 10 | Connection prerequisite. |
| Start with this browser-access rule: | 5 | Clear setup heading. |
| Replace the web address when self-hosting. | 6 | — |
| Large uploads require the object store to expose its ETag response header. | 10 | F-2-4. |
| Browsers block HTTPS pages from calling HTTP endpoints. | 8 | Covered by connection-diagnostics. |
| Use HTTPS for the object store when this console uses HTTPS. | 10 | Covered by connection-diagnostics. |
| Path-style URLs are the default. | 5 | F-2-5. |
| Use bucket subdomain URLs only when DNS and TLS cover those subdomains. | 11 | Configuration guidance. |
| `npm run build` writes the static site to `dist/`. | 7 | Covered by build-output. |
| The repository includes Azure Static Web Apps routing, headers, and cache rules. | 11 | Build/deployment documentation; static configuration is present. |
| S3 Console uses the MIT License. | 5 | Covered by open-source. |
| Its original generated artwork is documented in `.factory/design.md`. | 8 | Covered by artwork-provenance. |

### Terminology check

| Concept | Current public term | Result |
| --- | --- | --- |
| Product | console | Consistent. |
| Remote service | object store; endpoint only for its URL | Consistent. |
| Demo | sample workspace | Consistent. |
| Generated access | download/upload link | Consistent. |
| Browser persistence | session storage / local storage | Consistent and explained. |
| URL modes | path-style URL / bucket subdomain URL | Consistent; default still needs F-2-5 coverage. |

## Earlier findings recheck

I read `.factory/review-1.md`, `.factory/polish-1.md`, both verification records, and the prior handoff. The live site and source confirm that the prior B1/B2/B3/B4, M1–M6, m1–m2, U01–U32, and P1–P3 repairs are present: first-screen audience/action/facts, isolated direct demo/reset, claims manifest/tagged tests, metadata for SPA routes, client 404, shared SPA chrome, route focus/live region, mobile targets, simplified copy, narrowed claims, and cache/test setup. The clean-clone `npm test` result in F-2-1 is a regression against the prior handoff's reported test gate. No other prior finding was observed as unfixed or half-fixed.

## What would make this perfect

Make the default test command clean-clone safe; complete the real 404 shell and metadata; either test or remove the three remaining user-facing claims; and add safe copy/move object operations with demo and claim coverage. At that point the product would be clear on first contact, immediately tryable, privacy-bounded, verifiable, and complete for the ordinary object-management workflow it promises.
