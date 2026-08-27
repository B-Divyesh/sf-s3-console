# S3 Console v1 handoff

## What shipped

- A Vite + vanilla TypeScript static application with an original neo-brutalist utility system documented in `design.md`.
- Native browser SigV4 signing through Web Crypto. There is no application server or credential proxy.
- Session-only connection persistence by default and explicit local persistence when “Remember on this device” is selected. Disconnect clears both.
- Bucket list/create/delete; prefix-folder object browsing; ListObjectsV2 pagination and filtering; empty, loading, error, offline, desktop, 390px, and keyboard states.
- Small and 8 MiB-part multipart uploads with visible progress and failed-upload abort; downloads; object deletion; folder markers.
- Object metadata replacement, tags, bucket policy JSON, CORS JSON, lifecycle JSON, versioning, and expiring presigned GET/PUT URLs.
- `/privacy` and `/terms`, dark treatment, service-worker app shell, Azure Static Web Apps configuration, and an nginx Docker image.
- Original generated connection artwork in responsive WebP (25 KB mobile / 49 KB desktop), with source and prompt provenance under `assets/src/`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

The exact production build command is `npm run build`; output is `dist/` with `dist/index.html` at its root.

Verification completed on 2026-08-27:

- `npm test`: 4/4 SigV4 encoding and presign tests passed.
- `npm run build`: passed TypeScript strict checking and Vite production build.
- Initial production payload: 42.9 KB JS and 25.7 KB CSS uncompressed (13.5 KB and 6.0 KB gzip). Matching Latin WOFF2 fonts total about 53 KB. Hero variants are 25 KB and 49 KB.
- Factory `verify-url.sh`: HTTP 200, zero console/page errors, title/lang/main/one-H1/alt/button-name checks passed at 1366×900 and 390×844.
- Playwright axe 4.13: zero violations at 390×844.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.7 s, TBT 0 ms, CLS 0.023.
- Real S3 integration against MinIO `RELEASE.2025-09-07T16-13-09Z`: connection, bucket creation, 9 MB multipart upload, list, metadata/tag update, presign, policy, lifecycle, versioning, object delete, and empty-bucket delete all returned successful S3 responses. Lifecycle testing led to the addition of signed flexible-checksum headers.

Local screenshots and raw Lighthouse output were generated in `.factory/evidence/` and intentionally ignored from version control.

## Known gaps and compatibility notes

- Only MinIO was available for a live integration run in this worker. Garage, RustFS, SeaweedFS, Ceph RGW, Versity, and AWS remain honest “pending” rows in the README compatibility matrix; no unverified backend is marked compatible.
- The tested MinIO release returns `501 NotImplemented` for the standard bucket CORS API. The editor correctly surfaces that backend response; endpoint-wide MinIO CORS must be managed outside this app.
- Very large downloads are currently buffered by the browser before save. Presigned download links are available when direct streaming is preferable.
- Multipart uploads run parts sequentially and abort on failure; resumable cross-session uploads are not included in v1.
- IAM/users, metrics, replication, and backend-specific administration remain intentionally out of v1 scope.

## Recommended next steps

Run the same integration script against the five target open-source stores and AWS, record exact versions, and turn confirmed quirks into fixtures. The first likely adapter candidates are endpoint-level CORS guidance and version-aware object cleanup. Add resumable multipart state only after observing real large-upload demand.
