# Copy audit

Audited 28 August 2026. Counts treat hyphenated terms as one word. No retained sentence exceeds 22 words or uses a banned marketing word.

| Copy | Words | Result |
| --- | ---: | --- |
| Manage S3-compatible storage from your browser. | 6 | Pass |
| For self-hosters and small ops teams that manage buckets across different storage providers. | 13 | Pass |
| Try it with sample data. | 5 | Pass |
| Opens a disposable storage workspace. | 5 | Pass |
| Connect your object store. | 4 | Pass |
| Open source. | 2 | Pass — covered by `open-source`. |
| Your secret key is not sent in storage requests. | 9 | Pass — covered by `credential-routing`. |
| Your endpoint must allow browser requests. | 6 | Pass |
| Signed storage requests go only to your chosen endpoint. | 9 | Pass — covered by `credential-routing`. |
| Choose bucket subdomains only when your DNS and certificate support them. | 11 | Pass |
| Saves credentials in this browser until you disconnect. | 8 | Pass |
| Leave off on shared machines. | 5 | Pass |
| Your storage server must allow browser requests from this site. | 10 | Pass |
| Enter one storage endpoint and access key. | 7 | Pass |
| Open buckets and inspect object details. | 6 | Pass |
| Upload files or edit supported bucket settings. | 7 | Pass |
| Copy objects or move them after a successful copy. | 9 | Pass — covered by object-copy/object-move. |
| Add this site to the object store's browser-access rules. | 9 | Pass |
| This console sends GET, PUT, POST, DELETE, and HEAD requests. | 10 | Pass — covered by `cors-starter-rule`. |
| Expose the `ETag` response header so large uploads can finish. | 10 | Pass — covered by `multipart-upload`. |
| The console does not manage users, replication, monitoring, or provider-specific settings. | 11 | Pass |
| The console does not set cookies or make analytics or tracking requests. | 12 | Pass — covered by `privacy-boundary`. |
| Connection details use session storage by default. | 7 | Pass |
| Selecting “Remember on this device” uses local storage until you disconnect. | 11 | Pass |
| Your browser sends signed requests to the object store you configure. | 10 | Pass |
| The demo sends no object-store requests. | 6 | Pass |
| The service worker caches public console files. | 7 | Pass — covered by `offline-cache-boundary`. |
| It does not cache storage responses, bucket names, objects, or credentials. | 11 | Pass — covered by `offline-cache-boundary`. |
| Manage S3-compatible storage from your browser. | 6 | Pass |

## README sentences changed in polish 3

| Copy | Words | Result |
| --- | ---: | --- |
| Your secret key is not sent in storage requests. | 9 | Pass — covered by `credential-routing`. |
| These are the five request methods the console sends. | 9 | Pass — covered by `cors-starter-rule`. |
| Expose the `ETag` response header so large uploads can finish. | 10 | Pass — covered by `multipart-upload`. |
| Some object stores label this setting “exposed response headers.” | 9 | Pass |

## Terminology

| Concept | Term |
| --- | --- |
| Product | console |
| Remote service | object store |
| Network address | endpoint |
| Generated access | signed link |
| Sample experience | sample workspace / demo |
| URL mode | URL format; path-style URLs; bucket subdomain URLs |
| Saved browser data | session storage / local storage |
