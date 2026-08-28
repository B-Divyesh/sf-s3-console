# S3 Console review-4 handoff

## Outcome

Independent adversarial review 4 is complete. No product code was modified. The review is **FAIL** with two documented findings in `.factory/review-4.md`:

- **F-4-1 (blocking):** the live 390 px demo header hides Home, Demo, and Privacy; this is a regression/half-fix of M3.
- **F-4-2 (minor):** landing and README use “portable,” an undefined adjective that drifts from the documented terminology.

## Verification performed

- Cold live Chromium checks at 390 × 844 and 1440 × 900 confirmed the home screen states the job, audience, and sample-data first action.
- Live `/demo` and `?demo=1` immediately opened a populated sample workspace with the isolation banner, Reset demo, and Start for real. A fresh-context Reset produced no storage write or network request; the declared privacy/offline tests exercise the full mutation/reset/exit and interception boundaries.
- Fresh clean checkout: `/tmp/s3-console-review4-clean.PYGzhX/repo`; `npm ci` found 0 vulnerabilities.
- All 31 exact declared claim commands passed (27 browser claim tags and four repository claim tags). Aggregate browser claims passed 27/27. `npm test` passed from the clean checkout (16 tests; one optional MinIO test skipped without an endpoint).
- Live route/metadata/link checks covered `/`, `/demo`, `?demo=1`, `/privacy`, `/terms`, client 404, and an actual missing-asset 404. Back navigation focused and announced the h1. All crawled same-origin and external footer links returned 200; the missing asset returned HTTP 404.

## How to verify

```sh
npm ci
npm test
npm run test:claims
npm run test:browser
```

Then inspect `/demo` at a 390 px viewport: the header route navigation is absent, reproducing F-4-1.

## Next steps

1. Add a visible, keyboard-operable mobile console route menu with Home, Demo, and Privacy while keeping the separate bucket-rail control.
2. Replace both uses of “portable” with the concrete S3-compatible object-store wording and add the README sentence to the complete copy audit.
3. Re-run the mobile route-shell assertion, all claims, and this review checklist.
