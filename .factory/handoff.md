# S3 Console polish-4 handoff

## Outcome

Polish round 4 is complete. Commit `ccb6ac6057ecf12ece9b4d9c1dc8e4ed452ce962` repairs the remaining review-4 mobile-navigation regression and copy drift, is pushed to `main`, and is deployed as Azure Static Web Apps deployment `e1bef7c9-547d-40b2-85e4-b9e4689bb2b0`.

The mobile console now has a separate keyboard-operated route Menu. It exposes Home, Demo, and Privacy below the persistent demo banner without replacing the bucket control. Landing and README wording now consistently says “S3-compatible object store,” and the copy audit contains the complete landing/route-shell and README inventory.

## Verification

- Clean clone: `/tmp/s3-console-polish4-clean.LUPQ0p/repo`; `npm ci` completed with 0 vulnerabilities.
- Every one of the 31 exact commands declared in `.factory/claims.json` passed individually from that clone.
- `npm run lint` passed.
- `npm run test:clean` passed: 16 tests passed; the one environment-gated MinIO test was skipped in the no-endpoint unit run.
- Pinned MinIO `RELEASE.2025-09-07T16-13-09Z` then passed multipart byte round-trip plus version/delete-marker bucket cleanup.
- `npm run test:browser` passed: 35 tests, including the new 390 px bucket/menu route-shell and keyboard/focus check. It includes offline, privacy, storage, metadata, routing, mobile, and Axe coverage.
- Local Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 0 ms.
- Cold live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 40 ms.
- `verify-url.sh` passed at the custom domain. `/tmp/s3-console-polish-4-verify/verify.json` reports a title, `lang=en`, one h1, a main landmark, zero missing image alts, zero unlabeled buttons, and zero console/page errors.
- Fresh 390 px live contexts verified `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, client 404, and static missing-asset 404. The opened demo menu had visible/topmost Home, Demo, and Privacy controls, all 48 px high; its Axe scan had zero serious/critical issues.
- Deployed JS/CSS SHA-256 values match `dist/` exactly. Root cache-control is `no-cache, max-age=0, must-revalidate`; hashed assets are `public, max-age=31536000, immutable`.

Screenshots: `/tmp/s3-console-polish-4-live-home-390.png`, `/tmp/s3-console-polish-4-live-demo-menu-390.png`, and `/tmp/s3-console-polish-4-live-404-390.png`. The complete finding-to-change-to-evidence mapping is `.factory/polish-4.md`.

## Run locally

```sh
npm ci
npm run lint
npm run test:clean
npm run test:browser
npm run test:claims
```

For the optional real S3 regression, start a disposable MinIO endpoint and run:

```sh
MINIO_ENDPOINT=http://127.0.0.1:9000 \
MINIO_ACCESS_KEY=minioadmin MINIO_SECRET_KEY=minioadmin \
npm run test:minio
```

## Known gaps and next steps

None. Every finding in review 1 through review 4 is covered by the shipped implementation and recorded verification evidence.
