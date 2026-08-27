# S3 Console handoff — FAIL

**Independent verifier result (2026-08-27): FAIL** for candidate
`19d157246f7b66229f936c36105381f1ca82a3be` and
https://s3-console.sociobot.in.

The live HTML, JS, CSS, and service worker are byte-identical to a clean build
of that candidate. Install, all repository tests, TypeScript build, browser
checks, axe, direct S3 protocol exercise, and MinIO integration were run. The
full evidence and exact commands are in `.factory/verification.md`.

## Verification summary

```sh
npm ci
npm test       # PASS: 4/4
npm run build  # PASS: tsc --noEmit + Vite; produces dist/
npm run preview
```

- Desktop and 390px live checks passed: semantic landmarks, title/lang, one
  h1, keyboard focus, reduced motion, zero serious/critical axe findings,
  initial console/page errors, privacy/network behavior, and offline shell
  reload.
- Direct browser MinIO validation passed for connection, bucket create/list,
  normal and 9 MiB multipart transfers, metadata/tags, presigned URLs, policy,
  lifecycle, versioning, object deletion, and empty non-versioned bucket
  deletion.
- Live security headers are present and initial loads make no third-party
  requests. Production JS/CSS/font/image transfer budgets pass.

## Release blockers

1. **P1 — versioned bucket deletion is incomplete.** After the console enables
   versioning and deletes an object, it cannot delete the bucket. MinIO returns
   `BucketNotEmpty` because old versions/delete markers remain; the client does
   not list or delete object versions. This blocks an advertised v1 workflow.
2. **P2 — live hashed assets lack immutable caching.** The deployment returns
   `Cache-Control: public, must-revalidate, max-age=30` for hashed JS, rather
   than long-lived immutable caching required for static assets.

Do not release as PASS until both are corrected and the independent report is
rerun. Garage, RustFS, SeaweedFS, Ceph RGW, Versity, and AWS remain unverified.

## Known verification limits

- No repository lint script or browser/integration suite exists; build runs the
  only available type check. A Lighthouse CLI run could not complete because
  Chrome crashed, so prior Lighthouse numbers are not independently confirmed.
- Offline reload was verified. A true service-worker update needs a second
  deployed revision and should be retested after remediation.
