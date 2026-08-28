# Adversarial first-read review 3

- Live URL: <https://s3-console.sociobot.in>
- Base and clean clone: `f04c771b34ddea04253ed16ff5815ac1e33fc89c`, `/tmp/s3-console-review3-D803Ya`
- Viewports: fresh Chromium 390 × 844 and 1440 × 900
- Verdict: **FAIL**

The console is clear on first read and the declared test suite passes. It does not pass because the first-screen privacy fact is inaccurate, and two public/privacy assertions lack complete observable coverage.

## Cold first read

Before scrolling, at both viewports:

| Question | Answer |
| --- | --- |
| What does it do? | Manage S3-compatible buckets and objects from a browser. |
| For whom? | Self-hosters and small ops teams using different storage providers. |
| What first? | **Try it with sample data**; it says it opens a disposable storage workspace. |

The exact visible copy is “Manage S3-compatible storage from your browser,” “For self-hosters and small ops teams that manage buckets across different storage providers,” and “Try it with sample data.” The action is above the fold at 390 px and desktop. No first-read blocking failure was observed. Evidence: `/tmp/review3-home-390.png` and `/tmp/review3-home-1440.png`.

## Findings

### F-3-1 (prior U05 regression) — BLOCKING — Credential privacy fact is too broad

**Location / quote:** Home plain fact: “Credentials stay in your browser.”

**Evidence:** `@claim:credential-routing` asserts the outgoing S3 `Authorization` header contains `VISIBLEACCESS`, the access-key ID. That ID is credential material and is sent to the chosen endpoint. The secret key itself is not sent, which is the narrower claim the test proves.

**Why:** A first-time operator can reasonably interpret the hero fact as “no credentials are transmitted.” The current text overstates the privacy boundary and regresses the U05 concern in review 1.

**Fix:** Replace it with “Your secret key is not sent in storage requests.” This is plain, accurate, and already covered by `credential-routing`.

### F-3-2 — Minor — Demo privacy test omits session storage

**Location / quote:** `privacy-boundary`: “The demo makes no off-origin requests, sets no cookies, and writes no normal storage keys.”

**Evidence:** `tests/claims.spec.ts` asserts cookies, requests, and only `Object.keys(localStorage)`. It never checks `sessionStorage`. The in-memory implementation currently looks correct, but the claim’s storage boundary is not fully observed.

**Why:** A future demo write to `sessionStorage` would keep this claim green.

**Fix:** After realistic navigation, mutation, reset, and exit, assert both local- and session-storage have no non-`demo:` keys.

### F-3-3 — Minor — Published CORS method rule has no claim contract

**Location / quote:** Home setup section: “Allow the five listed methods.” The README repeats the starter rule.

**Evidence:** No claim asserts that `GET`, `PUT`, `POST`, `DELETE`, and `HEAD` are sufficient for every supported operation. `connection-diagnostics` checks messaging, not browser preflight or the documented method set.

**Why:** Operators may paste this rule before connecting. A later operation can require a method the public rule does not name.

**Fix:** Add a `cors-starter-rule` claim against a CORS-capable disposable S3 harness that checks preflight and the exact method set. Alternatively remove the “five methods suffice” assertion.

### F-3-4 — Minor — `ETag` is not explained in setup copy

**Location / quote:** Home and README: “Expose ETag for large uploads.”

**Why:** `ETag` is a protocol-header term. The instruction does not say what it is or why a provider setting may use a different label.

**Fix:** Use “Expose the `ETag` response header so large uploads can finish,” and add the landing location to `multipart-upload`’s manifest `where` field.

## Copy audit

Word counts treat hyphenated terms and identifiers as one word. No landing or README sentence exceeds 22 words or contains a banned marketing adjective. The flags are F-3-1, F-3-3, and F-3-4; otherwise terminology is consistent: **console**, **object store**, **endpoint**, **sample workspace**, **signed link**, and **session/local storage**.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Portable object-store console // v1.0 | 4 | Pass. |
| Manage S3-compatible storage from your browser | 6 | Pass. |
| For self-hosters and small ops teams that manage buckets across different storage providers. | 13 | Pass. |
| Try it with sample data | 5 | Result-naming action. |
| Opens a disposable storage workspace. | 5 | Pass. |
| Connect your object store | 4 | Result-naming action. |
| Open source | 2 | `open-source`. |
| Credentials stay in your browser | 5 | F-3-1. |
| Your endpoint must allow browser requests | 6 | Diagnostics context. |
| Your credentials go only to your chosen storage endpoint. | 9 | Routing claim. |
| Storage endpoint URL; Region; URL format | 3; 1; 2 | Field labels. |
| Path-style URLs; Bucket subdomain URLs | 2; 3 | Contextual configuration labels. |
| Choose bucket subdomains only when your DNS and certificate support them. | 11 | Pass. |
| Access key ID; Secret access key; Temporary credentials; Session token; Optional | 3; 3; 2; 2; 1 | Field labels. |
| Remember on this device | 4 | Credential-storage. |
| Saves credentials in this browser until you disconnect. | 8 | Credential claims. |
| Leave off on shared machines. | 5 | Pass. |
| Before connecting | 2 | Pass. |
| Your storage server must allow browser requests from this site. | 10 | Diagnostics context. |
| View a browser-access starter rule; Test and connect | 5; 3 | Result-naming actions. |
| Three steps; How it works; Connect; Browse; Change | 2; 3; 1; 1; 1 | Clear headings/actions. |
| Enter one storage endpoint and access key. | 7 | Pass. |
| Open buckets and inspect object details. | 6 | Pass. |
| Upload files or edit supported bucket settings. | 7 | Pass. |
| Set up each storage server once; Allow browser requests | 6; 3 | Clear headings. |
| Add this site to the object store’s browser-access rules. | 9 | Pass. |
| Allow the five listed methods. | 5 | F-3-3. |
| Expose ETag for large uploads. | 5 | F-3-4. |
| Product boundary; Storage operations, not provider accounts | 2; 5 | Clear headings. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | `scope-boundary`. |
| Manage S3-compatible storage from your browser. | 6 | Footer, pass. |
| Build v1.0.0 · polish-2 | 3 | Build identifier. |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Manage S3-compatible storage from your browser. | 6 | Pass. |
| S3 Console is for self-hosters and small ops teams using portable S3 endpoints. | 13 | Pass. |
| Try the isolated sample workspace. / It needs no endpoint or credentials. | 5 / 6 | Demo-sandbox. |
| Creates and safely deletes buckets. | 5 | Bucket-management. |
| Browses object folders and filters names. | 5 | Object-browser. |
| Uploads, downloads, and deletes objects. | 5 | Object claims. |
| Copies objects or moves them after a successful copy. | 9 | Copy/move claims. |
| Edits object metadata and tags. | 5 | Metadata/tag claims. |
| Edits policy, browser-access, and lifecycle rules. | 6 | Settings claims. |
| Enables or suspends bucket versioning. | 5 | Versioning-edit. |
| Creates expiring download and upload links. | 6 | Signed-link claims. |
| Keeps the sample workspace available after an offline reload. | 8 | Offline-shell. |
| Offers light and dark themes. | 5 | Theme-choice. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | Scope-boundary. |
| Your browser signs storage requests and sends them to the endpoint you choose. | 12 | Credential-routing. |
| The secret key is never sent in a request. | 9 | Credential-routing. |
| Connections use session storage by default. | 6 | Credential-storage. |
| “Remember on this device” uses local storage. / Disconnecting clears both copies. | 7 / 4 | Credential claims. |
| The sample workspace is in memory. | 6 | Demo-sandbox. |
| It sends no storage requests, sets no cookies, and writes no normal storage keys. | 13 | F-3-2 coverage gap. |
| Read the live privacy policy and terms. | 7 | Clear action. |
| Run one declared product claim with its command in `.factory/claims.json`. | 10 | Developer instruction. |
| The browser suite starts the production preview automatically. | 7 | Observed. |
| An optional integration command accepts a disposable MinIO endpoint. | 8 | Developer instruction. |
| The object store must allow requests from the console’s web address. | 10 | Configuration prerequisite. |
| Start with this browser-access rule: / Replace the web address when self-hosting. | 5 / 6 | Pass. |
| Large uploads require the object store to expose its ETag response header. | 10 | F-3-4. |
| Browsers block HTTPS pages from calling HTTP endpoints. | 8 | Connection-diagnostics. |
| Use HTTPS for the object store when this console uses HTTPS. | 10 | Connection-diagnostics. |
| Path-style URLs are the default. | 5 | Path-style-default. |
| Use bucket subdomain URLs only when DNS and TLS cover those subdomains. | 11 | Contextual guidance. |
| `npm run build` writes the static site to `dist/`. | 7 | Build-output. |
| The repository includes Azure Static Web Apps routing, headers, and cache rules. | 11 | Deployment test. |
| S3 Console uses the MIT License. | 5 | Open-source. |
| Its original generated artwork is documented in `.factory/design.md`. | 8 | Artwork-provenance. |

## Demo, claims, and quality gates

The home action reaches `/demo` in one click, and `/?demo=1` works directly. The fresh 390 px demo shows the `media-archive` object ledger, realistic `brand` and `campaigns` folders, a filter, and upload controls before any setup. Its persistent banner reads “Demo — sample data, nothing is saved” and offers Reset demo and Start for real. `@claim:demo-sandbox` mutates and resets it; `DemoClient` is in-memory. The screenshot is `/tmp/review3-demo-390.png`. Offline and same-origin/network/cookie checks passed; F-3-2 records the missing session-store assertion.

I read all 29 entries in `.factory/claims.json` and ran every exact listed command in the clean clone. All passed: 25 browser claims, three repository-contract claims, and the connection-diagnostic claim. The following also passed in that clone: `npm ci` (0 vulnerabilities reported), `npm run lint`, `npm test` (16 passed; one optional MinIO test skipped without an endpoint), `npm run test:browser` (32 Chromium tests), and `npm run build` (`dist/`; main JS 18.42 kB gzip).

No AI feature is present. That is appropriate: S3 object administration is deterministic and the brief does not imply a useful model-assisted step. No embedded provider key was observed.

## Structure and history recheck

Titles, meta description, canonical, OG/Twitter metadata, favicon/touch icon, one h1, main, and designed not-found states passed for `/`, `/demo`, `?demo=1`, `/privacy`, `/terms`, client unknown routes, and the HTTP static 404. Back navigation returns focus to the h1 and updates the live region. The header/footer include the required navigation and legal links. All internal routes/assets returned 200 where expected; a missing excluded asset returned the complete HTTP 404. Source, artwork provenance, and Param Factory external links returned 200. Axe found no serious/critical issues, and 390 px testing found no horizontal overflow or sub-44 px visible controls. The neo-brutalist warehouse-label identity and original crate art match `.factory/design.md` and are distinct from a generic SaaS template.

I read every earlier review, polish record, verification record, and handoff. The demo, routing, metadata, static 404, focus, touch target, copy, multipart/path-style, cache, clean-test, and copy/move repairs are present in source and live behaviour. F-3-1 is the only earlier-finding regression: it reopens U05’s credential-privacy concern.

## What would make this perfect

Use the precise secret-key privacy fact, assert demo session-storage isolation, contract-test the published CORS rule, and explain `ETag` in the setup text. Then the product would be clear, tryable, honest, and fully claim-tested.
