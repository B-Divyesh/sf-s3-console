# Copy audit

Audited 28 August 2026 for polish 5. Counts treat hyphenated terms, product identifiers, and URL-format names as one word. Every retained sentence is 22 words or fewer and avoids the banned marketing words. Commands and the JSON browser-access example are data, not prose.

## Landing and route shell

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Clear skip action. |
| S3 Console | 2 | Product name. |
| Home / Demo / Privacy | 1 / 1 / 1 | Clear route labels. |
| S3-compatible object-store console // v1.0 | 4 | Concrete context label. |
| Manage S3-compatible storage from your browser. | 6 | Job-first heading. |
| For self-hosters and small ops teams that manage buckets across different storage providers. | 13 | Audience and situation. |
| Try it with sample data | 5 | Primary action. |
| Opens a disposable storage workspace. | 5 | Explains the result. |
| Connect your object store | 4 | Secondary action and form heading. |
| Free to use | 3 | Covered by `free-to-use`. |
| The sample workspace reloads offline after one visit | 8 | Covered by `offline-shell`. |
| Your secret key is not sent in storage requests | 9 | Covered by `credential-routing`. |
| Signed storage requests go only to your chosen endpoint. | 9 | Covered by `credential-routing`. |
| Choose bucket subdomains only when your DNS and certificate support them. | 11 | Covered by `bucket-subdomain-routing`. |
| Saves credentials in this browser until you disconnect. | 8 | Covered by credential-storage/disconnect claims. |
| Leave off on shared machines. | 5 | Safety instruction. |
| Your storage server must allow browser requests from this site. | 10 | Setup prerequisite. |
| Connect an object store | 4 | Self-contained first workflow heading. |
| Enter one storage endpoint and access key. | 7 | First workflow step. |
| Browse buckets and objects | 4 | Self-contained second workflow heading. |
| Open buckets and inspect object details. | 6 | Second workflow step. |
| Upload files and edit settings | 5 | Self-contained third workflow heading. |
| Upload files or edit supported bucket settings. | 7 | Third workflow step. |
| Add this site to the object store’s browser-access rules. | 9 | Setup instruction. |
| This console sends GET, PUT, POST, DELETE, and HEAD requests. | 10 | Covered by `cors-starter-rule`. |
| Expose the `ETag` response header so large uploads can finish. | 10 | Covered by `multipart-upload`. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | Covered by `scope-boundary`. |
| Manage S3-compatible storage from your browser. | 6 | Footer one-liner. |
| Demo — sample data, nothing is saved | 6 | Persistent isolated-sample status. |
| Changes last only in this tab. | 6 | Demo state explanation. |
| Reset demo / Start for real | 2 / 3 | Demo actions. |
| Menu / Open navigation menu | 1 / 3 | Mobile route control; opens Home, Demo, and Privacy. |
| This storage aisle does not exist. | 6 | Designed not-found heading. |
| The address may be old or mistyped. | 7 | Not-found explanation. |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| Manage S3-compatible storage from your browser. | 6 | Clear summary. |
| S3 Console is for self-hosters and small ops teams using S3-compatible object stores from different providers. | 16 | Audience and target. |
| Try the isolated sample workspace. | 5 | Clear demo link. |
| It needs no endpoint or credentials. | 6 | Covered by `demo-sandbox`. |
| Creates and safely deletes buckets. | 5 | Covered by `bucket-management`. |
| Browses object folders and filters names. | 5 | Covered by `object-browser`. |
| Uploads, downloads, and deletes objects. | 5 | Covered by object claims. |
| Copies objects or moves them after a successful copy. | 9 | Covered by `object-copy` and `object-move`. |
| Edits object metadata and tags. | 5 | Covered by metadata/tag claims. |
| Edits policy, browser-access, and lifecycle rules. | 6 | Covered by settings claims. |
| Enables or suspends bucket versioning. | 5 | Covered by `versioning-edit`, including both saved states. |
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
| Read the live privacy policy and terms. | 6 | Legal links. |
| Run one declared product claim with its command in `.factory/claims.json`. | 10 | Test instruction. |
| The browser suite starts the production preview automatically. | 7 | Test instruction. |
| An optional integration command accepts a disposable MinIO endpoint. | 9 | Test-scope explanation. |
| It exercises version-aware bucket cleanup and multipart uploads over the direct browser client. | 13 | Test-scope explanation. |
| The object store must allow requests from the console’s web address. | 11 | Setup prerequisite. |
| Start with this browser-access rule. | 5 | Setup instruction. |
| Replace the web address when self-hosting. | 6 | Setup instruction. |
| These are the five request methods the console sends. | 9 | Covered by `cors-starter-rule`. |
| Expose the `ETag` response header so large uploads can finish. | 10 | Covered by `multipart-upload`. |
| Some object stores label this setting “exposed response headers.” | 9 | Defines the provider label. |
| Browsers block HTTPS pages from calling HTTP endpoints. | 8 | Covered by `connection-diagnostics`. |
| Use HTTPS for the object store when this console uses HTTPS. | 11 | Concrete correction. |
| Path-style URLs are the default. | 5 | Covered by `path-style-default`. |
| Use bucket subdomain URLs only when DNS and TLS cover those subdomains. | 12 | Covered by `bucket-subdomain-routing`. |
| `npm run build` writes the static site to `dist/`. | 8 | Covered by `build-output`. |
| The repository includes Azure Static Web Apps routing, headers, and cache rules. | 10 | Covered by `static-host-config`. |
| S3 Console uses the MIT License. | 6 | Covered by `open-source`. |
| Its original generated artwork is documented in `.factory/design.md`. | 8 | Covered by `artwork-provenance`. |

## Terminology

| Concept | Term |
| --- | --- |
| Product | console |
| Remote service | S3-compatible object store |
| Network address | endpoint |
| Generated access | signed link |
| Sample experience | sample workspace / demo |
| URL mode | URL format; path-style URLs; bucket subdomain URLs |
| Saved browser data | session storage / local storage |
