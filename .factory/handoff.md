# S3 Console perfection-loop handoff — round 1

## Delivered

The review repair is deployed at [s3-console.sociobot.in](https://s3-console.sociobot.in) from application commit `cdef0ae0943ccdada295f825de257a1e19d374fc` (following `2fc3d5675a89546b946609e3022f05714bb4da54`). The static artifact remains Vite + vanilla TypeScript and deploys to `dist/`.

- Closed every B/M/m/U finding in `.factory/review-1.md` and P1–P3 in the earlier independent verification reports. The one-to-one mapping is in `.factory/polish-1.md`.
- Kept the distinct neo-brutalist field-instrument visual system while making the first screen explicit, actionable, and mobile-safe.
- Kept direct `?demo=1` and `/demo` as a fully isolated in-memory sample workspace with banner, reset, and real-mode exit.
- Added TypeScript-aware ESLint and route/metadata/footer/first-screen regression coverage.
- Reduced late font layout shift by shipping only the required self-hosted Latin WOFF2 subsets with optional loading. This preserved the typography while reducing the deployed first-load transfer and eliminating the measured CLS.

## Exact verification evidence

Final clean clone: `/tmp/s3-console-polish-1-final-rPF6NU`, cloned from final application commit `cdef0ae`.

```text
npm ci                         PASS — 165 packages, 0 vulnerabilities
npm run lint                   PASS — ESLint with TypeScript rules
npm run build                  PASS — dist/index.html generated
npm test                       PASS — 12 passed; MinIO test intentionally opt-in without endpoint
npm run test:browser           PASS — 28/28 browser, claim, route, mobile, and Axe tests
every .factory/claims.json test command  PASS — 25/25 commands (21 browser + 4 repository claims)
```

The disposable real-object-store regression also passed from the prior clean clone (`/tmp/s3-console-polish-1-clean-EpHNzm`) using downloaded MinIO `RELEASE.2025-09-07T16-13-09Z`:

```text
MINIO_ENDPOINT=http://127.0.0.1:9000 \
MINIO_ACCESS_KEY=minioadmin MINIO_SECRET_KEY=minioadmin npm run test:minio
PASS — 1/1, including version-aware bucket deletion
```

Production build budget:

```text
JavaScript: 57.63 kB raw / 17.84 kB gzip
CSS:        25.28 kB raw / 6.06 kB gzip
```

Live mobile Lighthouse on `https://s3-console.sociobot.in/?demo=1`:

```text
Performance 99  Accessibility 100  Best Practices 100  SEO 100
LCP 1.6 s  CLS 0  transfer 77 KiB
```

Cold live Chromium checks confirmed `/`, `/demo`, `?demo=1`, `/privacy`, `/terms`, and `/missing-aisle` render their expected route title/h1 with zero console errors. Live 390px Axe checks found zero serious/critical issues, zero controls below 44px, and no horizontal overflow. The live demo network/storage check saw zero off-origin requests, zero cookies, no normal local-storage keys, and no `s3-connection`. Screenshots: `/tmp/s3-console-polish-1-live-home-390.png`, `/tmp/s3-console-polish-1-live-demo-390.png`, and `/tmp/s3-console-polish-1-live-404-390.png`.

Live headers include immutable cache control for hashed `/assets/*`, revalidation for the shell/service worker, CSP, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and restrictive permissions policy.

## Run or verify

```sh
npm ci
npm run lint
npm test
npm run build
npm run test:browser
```

Each product claim can be run using the exact command in `.factory/claims.json`. Use `npm run test:minio` with a disposable MinIO endpoint for the real storage regression.

## Deployment

```sh
npm run build
/opt/fleet/lib/deploy-static.sh s3-console /work/repo/dist
```

## Known gaps

None for the reviewed release scope. Object-store implementations can differ, so public copy stays limited to tested S3-compatible behavior and does not name unverified providers.
