# S3 Console review-2 handoff

## Work completed

This was an independent, non-mutating review. Product code was not changed. The committed deliverable is `.factory/review-2.md`.

The live first-screen and demo paths were checked in fresh 390 × 844 and desktop Chromium contexts. `/demo` is a usable in-memory sample workspace with the required isolation banner, reset and real-mode exit. No demo cookies, normal storage keys, off-origin requests, or console errors were observed.

## Verification

A clean clone at `/tmp/s3-console-review2-i7VWfX` ran:

```text
npm ci                                      PASS
npm run lint                                PASS
npm run build                               PASS
npm run test:claims -- --grep @claim:       PASS — 21/21 browser claims
npm test -- -t @claim:connection-diagnostics PASS
npm test -- -t @claim:open-source           PASS
npm test -- -t @claim:artwork-provenance    PASS
npm run build && npm test -- -t @claim:build-output PASS
npm test                                    FAIL before a build
```

The standalone `npm test` failure is deliberate review evidence, not a product modification: `@claim:build-output` assumes the untracked `dist/index.html` already exists. See `F-2-1` for the required repair.

Live route, metadata, history/focus, static 404, link-crawl, header, and privacy checks are recorded in the review.

## Remaining work

The review verdict is **FAIL**. Resolve F-2-1 through F-2-6 in `.factory/review-2.md`: make `npm test` self-contained; complete the host-served static 404; test/remove the Free, multipart, and path-style claims; and add safe copy/move object operations with demo and claims coverage.
