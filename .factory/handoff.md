# S3 Console polish-5 handoff

## Outcome

Release repair `64375c51c9fde3cf8cfe0d6c58e86200eba046dc` closes every finding in review 5 and all earlier review/polish records. It is deployed to [https://s3-console.sociobot.in](https://s3-console.sociobot.in) as Azure Static Web Apps deployment `3f2ed2d5-0259-4e45-b887-9e418045ad98`.

The repair completes claim coverage for versioning suspension, bucket-subdomain routing, free use, and static-host configuration. It also corrects the first-screen fact set, mobile sample-caption order, workflow heading outline, catalog copy, and build identifiers.

## How to run and verify

```sh
npm ci
npm run lint
npm test
npm run build
npm run test:claims
npm run test:browser
```

For the real direct-client integration, run a disposable MinIO server and then:

```sh
MINIO_ENDPOINT=http://127.0.0.1:9000 \
MINIO_ACCESS_KEY=minioadmin MINIO_SECRET_KEY=minioadmin \
npm run test:minio
```

The direct sample URL is `https://s3-console.sociobot.in/?demo=1` (also `/demo`). It is in-memory only; Reset demo replaces the seed and Start for real discards it.

## Exact verification evidence

- Fresh remote clone: `/tmp/s3-console-polish-5-clean.NiqNOR/repo` at repair commit `64375c5`.
- `npm ci` completed with 0 vulnerabilities. Every one of the 34 exact commands listed in `.factory/claims.json` passed individually in that clone.
- Clean-clone `npm run lint` passed. `npm test` passed 16 tests; the endpoint-gated MinIO test was skipped only in that no-endpoint invocation. `npm run build` produced `dist/` with 61.38 kB raw / 18.81 kB gzip application JS.
- Clean-clone `npm run test:browser` passed 38/38, including Playwright Axe, keyboard route behavior, 390 px target/overflow, privacy interception, demo reset, offline shell/cache boundary, and the new claim tests.
- A disposable local `MinIO RELEASE.2025-09-07T16-13-09Z` binary ran `npm run test:minio` successfully: 1/1 direct-client test passed, including 8 MiB-plus multipart byte round-trip and version/delete-marker cleanup.
- `/opt/fleet/lib/verify-url.sh https://s3-console.sociobot.in /tmp/s3-console-polish-5-live` passed. `/tmp/s3-console-polish-5-live/verify.json` records HTTP 200, no console/page errors, title, `lang=en`, one h1, main, image alt, and button-label checks.
- Live Axe report `/tmp/s3-console-polish-5-live/axe.json` has zero violations on home, demo, privacy, terms, client 404, and real HTTP static 404.
- Live finding recheck `/tmp/s3-console-polish-5-live/finding-recheck.json` proves facts/caption/heading/URL-format, demo reset/isolation, and both versioning states. `/tmp/s3-console-polish-5-live/offline-live.json` proves a cold live `/demo` reload while offline.
- Live mobile Lighthouse `/tmp/s3-console-polish-5-live/lighthouse-clean.json`: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.35 s, CLS 0, TBT 21 ms.
- Screenshots: `/tmp/s3-console-polish-5-home-390.png`, `/tmp/s3-console-polish-5-demo-390.png`, `/tmp/s3-console-polish-5-404-390.png`, `/tmp/s3-console-polish-5-live/home-390-findings.png`, and `/tmp/s3-console-polish-5-live/demo-1440-findings.png`.

## Known gaps and next steps

None. No review finding, claim, quality gate, or live check is pending.
