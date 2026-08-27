# Independent verification — FAIL

**Verified 2026-08-27** against candidate commit
`19d157246f7b66229f936c36105381f1ca82a3be` in a clean detached worktree and
the public deployment [https://s3-console.sociobot.in](https://s3-console.sociobot.in).

The public HTML, built JS, built CSS, and service worker were byte-identical to
the candidate's fresh `dist/` output (SHA-256 checked). The deployed product is
therefore the tested candidate application, but it does **not** meet the
factory definition of done because of the P1 and P2 defects below.

## Commands and build result

```sh
git worktree add --detach /tmp/s3-console-verify-19d1572 19d157246f7b66229f936c36105381f1ca82a3be
cd /tmp/s3-console-verify-19d1572
npm ci
npm test
npm run build
```

- Clean install: 61 packages, `npm audit` reported 0 vulnerabilities.
- `npm test`: passed, 1 file / 4 SigV4 tests.
- `npm run build`: passed TypeScript `--noEmit` and Vite production build;
  `dist/` was produced.
- No lint command exists in `package.json`; `build` is the available type
  check. This is a test-coverage/process gap, not the release-blocking result.
- Built budgets: JS 42.94 KB (13.54 KB gzip), CSS 25.72 KB (6.01 KB gzip),
  matching Latin WOFF2 files about 53 KB, and hero WebP files 25/50 KB. These
  are within the stated static-product transfer budgets.

## Product exercise

Playwright exercised the production bundle at 1366×900 and 390×844 with a
local CORS-enabled S3 protocol harness: empty required connection input,
unreachable endpoint and recovered submit control, successful connect, bucket
list/create, invalid and valid bucket names, prefix/object browse, object
metadata/tags, presigned GET URL, malformed policy JSON, offline/online
notices, and keyboard focus. All expected checks passed. Initial console and
page errors were zero, and no requests left the console origin except the
explicitly configured S3 endpoint.

Real direct-browser integration was also run against fresh local MinIO
`RELEASE.2025-09-07T16-13-09Z` with CORS preflight enabled by the server:

- connection, bucket create/list, small upload, 9 MiB multipart upload,
  metadata/tags, presigned URL, versioning, policy, lifecycle, object delete,
  and basic empty non-versioned bucket delete all succeeded;
- after enabling versioning, uploading an object, deleting it through the
  console, then deleting the bucket failed with MinIO's exact response:
  `BucketNotEmpty: The bucket you tried to delete is not empty. You must delete all versions in the bucket.`

The latter is a product defect, not a MinIO anomaly: the implementation lists
only ListObjectsV2 current keys and sends DeleteObject without a version ID, so
it cannot remove non-current versions or delete markers.

## Browser, accessibility, privacy, and PWA checks

- Live desktop and 390px pages: correct title, `lang=en`, one `<h1>`, one
  `<main>`, no initial console/page errors, form fit at 390px, and no
  third-party initial-page requests.
- axe-core 4.13 found zero serious or critical violations at both sizes.
- Keyboard-only smoke test found the designed visible focus ring on the active
  input (`solid`, `3px`). Reduced-motion media emulation yielded a `0.01ms`
  transition. The skip link, privacy page, terms page, and MIT license are
  present; `/privacy` and `/terms` return HTTP 200.
- Browser source/network inspection confirms self-hosted fonts/assets, no
  analytics, cookies, or third-party scripts. Credentials are stored only in
  sessionStorage by default or localStorage after opt-in, and S3 requests use
  direct browser fetches to the configured endpoint.
- The live service worker controlled a reload and an offline reload rendered
  the cached shell successfully. A distinct service-worker update could not be
  simulated against a single immutable deployed revision; its update code was
  inspected, but a later deployment should repeat that test.

## Deployment, security, cache, and identity checks

Live responses are HTTPS 200 and include HSTS, CSP, `nosniff`, no-referrer,
and restrictive camera/microphone/geolocation permissions. CSP is necessarily
`connect-src *` so users can select any S3-compatible endpoint; it has no
third-party script/font/style origin. The public site returns the same
candidate `index.html`, JS, CSS, and `sw.js` bytes.

However, the public root, hashed JS, and `sw.js` all return:

```http
Cache-Control: public, must-revalidate, max-age=30
```

This fails the project performance requirement for long-lived immutable cache
headers on hashed assets. The candidate's nginx configuration says otherwise,
so the running host is not honoring that intended cache behavior.

An attempted independent Lighthouse CLI run could not complete because the
available Chrome process crashed; the bundle-budget, Playwright, and axe
checks above did complete. Do not treat the prior handoff's Lighthouse numbers
as independently reverified.

## Defects

| Severity | Defect | Evidence / impact |
| --- | --- | --- |
| P1 | Versioned buckets cannot be deleted through the advertised console workflow. | Reproduced directly against MinIO after the console enabled versioning, uploaded and deleted an object. Bucket deletion returns `BucketNotEmpty` because versions/delete markers remain and the client has no ListObjectVersions/version-ID delete support. This contradicts the v1 bucket-delete and versioning job-to-be-done. |
| P2 | Live hashed assets are not immutable cached. | `GET /assets/index-BSCrASSj.js` returns `Cache-Control: public, must-revalidate, max-age=30`, rather than a one-year immutable policy. This misses the stated static-web caching requirement and adds avoidable repeat-load/cache-revalidation cost. |
| P3 | No repository lint command or browser/integration test target is supplied. | Only four unit tests are runnable by `npm test`; the independent browser and MinIO checks had to be external verification scripts. |

## Required next verification

Implement version-aware list/delete cleanup (including delete markers) or
clearly remove the unsupported versioned-bucket delete claim; deploy a host
rule that makes fingerprinted `/assets/*` immutable while keeping HTML and
`sw.js` revalidating; then rerun this report, including a real service-worker
upgrade test and a mobile Lighthouse run.
