# S3 Console handoff — PASS

## Independent verification 2 (2026-08-27)

**PASS** for candidate `e9e66e3d795692e9149ff52590fe91a0f58fb4b1` and
[https://s3-console.sociobot.in](https://s3-console.sociobot.in). Fresh clean
install, unit tests, exact production build, opt-in real MinIO regression,
browser workflows, mobile/keyboard/axe checks, offline reload, service-worker
update prompt, Lighthouse, live byte identity, headers, cache policy, and
privacy/network checks passed. The full evidence is in
[`verification-2.md`](verification-2.md).

The live host now serves the candidate exactly. In particular, hashed assets
are one-year immutable and the shell/manifest/service worker revalidate; a
browser-driven MinIO workflow successfully removed a versioned bucket after
creating an object delete marker. No release-blocking defect remains.

Known non-blockers: no `lint` script exists, Docker could not be run because
this verifier container has no Docker runtime, and live integrations beyond
MinIO remain pending the published compatibility matrix.

---

# Builder repair details

Repaired both release blockers reported for candidate
`19d157246f7b66229f936c36105381f1ca82a3be`.

## What changed

- Versioned bucket deletion now lists every `ListObjectVersions` page before it
  mutates anything, including `DeleteMarker` entries. It sends S3 standard
  `DeleteObjects` requests in batches of 1,000 with version IDs, stops before
  bucket deletion if S3 reports a per-object error, and only then deletes the
  bucket. The danger panel clearly warns about the permanent operation and
  announces scan/delete progress and any safe stop to assistive technology.
- Added a real MinIO regression for exact
  `RELEASE.2025-09-07T16-13-09Z`: it creates two versions plus a delete marker,
  then proves the client removes the history and bucket. It is opt-in through
  `npm run test:minio` so normal local tests need no credentials.
- Azure Static Web Apps configuration now explicitly emits a one-year immutable
  policy for `/assets/*`, while HTML fallback, manifest, and `sw.js` use
  `no-cache, max-age=0, must-revalidate`. Equivalent `_headers` and nginx rules
  are covered by a regression test.
- The service worker cache is versioned (`s3-console-v3`), claims clients, has
  an update prompt, and Vite injects the current hashed JS/CSS into its
  precache. This fixes offline reload on a fresh install without caching S3
  API responses, credentials, buckets, or objects.

## Verification (2026-08-27)

```sh
npm ci
npm test
npm run build
MINIO_ENDPOINT=http://127.0.0.1:9000 \
  MINIO_ACCESS_KEY=minioadmin MINIO_SECRET_KEY=minioadmin npm run test:minio
```

- `npm test`: 8 passed; one MinIO test intentionally skipped without endpoint
  credentials.
- `npm run build`: passed and produced `dist/`. Final initial app JS is 46.83
  KB (14.70 KB gzip); CSS is 26.06 KB (6.06 KB gzip).
- Exact local MinIO integration: passed against
  `RELEASE.2025-09-07T16-13-09Z`.
- Playwright at 1366×900 and 390×844: title/lang, one h1/main, no initial
  console/page errors, and service-worker control passed. Mobile offline reload
  passed after a fresh cache install.
- axe-core at both viewports: 0 serious/critical findings.
- Mobile Lighthouse: Performance 99, Accessibility 100, LCP 1.8 s, CLS 0.003.
  Desktop Lighthouse: Performance 99, Accessibility 100, LCP 0.5 s, CLS 0.079.

## Deployment and remaining checks

This is a Standard static deployment. Repair commit `e6ac276` was pushed to
`main`, the configured static deployment trigger. At the final immediate live
probe the host was still serving the prior `index-BSCrASSj.js` release, so the
post-deploy header probe should be repeated once the external pipeline has
propagated. Verify the new hashed `/assets/index-*.js` response has
`Cache-Control: public, max-age=31536000, immutable`, and `/`, `sw.js`, and
`manifest.webmanifest` have `no-cache, max-age=0, must-revalidate`.

No secrets, analytics, backend, or credential proxy were added. Other S3
backends remain standards-based but unverified in this repair; MinIO is the
only real-storage integration exercised here.
