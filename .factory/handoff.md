# S3 Console polish-3 handoff

## Outcome

Perfection-loop round 3 is complete. The review-3 credential wording, full demo storage isolation, exact CORS method contract, and `ETag` explanation are repaired and deployed. All earlier review/polish findings were rechecked. No recorded finding remains open.

The distinct neo-brutalist warehouse-instrument identity, original crate artwork, static-web artifact class, and direct-browser S3 architecture are unchanged.

## Product changes

- Replaced “Credentials stay in your browser” with the precise tested fact: “Your secret key is not sent in storage requests.”
- Added `S3_HTTP_METHODS` as the typed source for client requests, sample rules, starter copy, and settings defaults.
- Added `cors-starter-rule`, `offline-cache-boundary`, and stronger privacy/storage/move claim coverage. `.factory/claims.json` now has 31 unique entries and one tagged test for each.
- Reworded and explained the `ETag` response-header requirement.
- Strengthened route tests for `?demo=1`, titles, descriptions, canonical/OG/Twitter metadata, one h1/main, focus/live announcements, legal links, mobile targets, and static 404 structure.
- Made the pinned-MinIO integration perform a real 8 MiB-plus multipart upload/download before version/delete-marker cleanup.
- Updated the verb-first 87-character catalog line: “Manage S3-compatible buckets, objects, copies, moves, and signed links in your browser.”

## Verification

Clean clone: `/tmp/s3-console-polish3-clean.AGYuED/repo`.

```sh
npm ci
# Every exact `test` command in .factory/claims.json (31/31 passed)
npm run lint
npm run test:clean
npm run test:browser
MINIO_ENDPOINT=http://127.0.0.1:9000 \
  MINIO_ACCESS_KEY=minioadmin MINIO_SECRET_KEY=minioadmin npm run test:minio
npm run build
```

Results:

- `npm ci`: 0 vulnerabilities.
- Claims: 31/31 exact commands passed from the clean clone.
- Unit/repository tests: 16 passed; the opt-in MinIO file skips only when no endpoint is supplied.
- Browser suite: 34/34 passed, including accessibility, privacy, offline, keyboard, routing, metadata, claim, and mobile tests.
- Pinned MinIO `RELEASE.2025-09-07T16-13-09Z`: 1/1 passed; multipart bytes round-tripped and all versions/delete markers were removed before bucket deletion.
- Build: `dist/` produced; initial JS 60.25 kB raw / 18.47 kB gzip, CSS 25.50 kB raw / 6.09 kB gzip, self-hosted fonts 52.62 kB total.
- Local Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 0 ms, 104 KiB transfer.

## Deployment and cold-live evidence

Pushed repair commits `105a066a2899514f95c82eb6660d9ff9f54a6a4c` and `8fefb4c` to `origin/main`. Deployed `/work/repo/dist` through `/opt/fleet/lib/deploy-static.sh s3-console /work/repo/dist`; Azure deployment ID `dcda400a-8ffe-4b16-b4ef-a6f0e450c4fb` succeeded.

`/opt/fleet/lib/verify-url.sh https://s3-console.sociobot.in /tmp/s3-console-polish-3-live` passed: HTTPS 200, correct title/lang/h1/main/alt labels, and zero console errors.

Fresh Chromium rechecks confirmed:

- `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and a client unknown route have the expected distinct title/canonical/OG/Twitter metadata, one h1/main, shared navigation/footer/legal links, and build `polish-3`.
- `/assets/missing-polish-3.webp` returns HTTP 404 with the complete noindex static 404.
- The sample workspace mutates, resets, exits, and leaves zero cookies, off-origin requests, local-storage keys, or session-storage keys.
- Forward/Back focuses and announces the h1 and settles at scroll position zero.
- Six-route 390 px scan found no overflow or visible target below 44 px. Axe found zero serious/critical violations.
- Offline demo reload passed; reduced motion computed to `0.00001s` with automatic scrolling.
- Root cache: `no-cache, max-age=0, must-revalidate`; fingerprinted JS: `public, max-age=31536000, immutable`.
- Live `index.html`, JS, and CSS hashes exactly match `dist/`.
- Cold-live Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.4 s, CLS 0, TBT 0 ms, 103 KiB transfer.

Finding-by-finding evidence and screenshot paths are in `.factory/polish-3.md`.

## Known gaps

None within the declared product contract. Storage endpoints must allow browser requests, and compatibility outside the pinned MinIO integration is intentionally not claimed.
