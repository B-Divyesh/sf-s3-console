# Independent verification 2 — PASS

**Verified 2026-08-27** against candidate commit
`e9e66e3d795692e9149ff52590fe91a0f58fb4b1` from a clean checkout and the
public deployment [https://s3-console.sociobot.in](https://s3-console.sociobot.in).

## Result

**PASS.** The prior P1 (versioned-bucket deletion) and P2 (live cache policy)
are both fixed in this candidate and its live deployment. No P0/P1/P2 defects
were found in the tested scope. The candidate is a static browser-only S3
console; no library, CLI, or backend applies.

## Clean install, tests, and build

```sh
npm ci
npm test
npm run build
MINIO_ENDPOINT=http://127.0.0.1:9000 \
  MINIO_ACCESS_KEY=minioadmin MINIO_SECRET_KEY=minioadmin npm run test:minio
```

- `npm ci`: 61 packages installed; `npm audit` reported 0 vulnerabilities.
- `npm test`: 8 passed, 1 opt-in MinIO test skipped as expected.
- `npm run build`: passed `tsc --noEmit` and Vite production build, producing
  `dist/`.
- `npm run test:minio`: passed against a fresh local
  `RELEASE.2025-09-07T16-13-09Z` binary.
- There is no lint script in `package.json`; the production build performs the
  repository's available TypeScript check.
- Build budgets: initial JS is 46.83 KB (14.70 KB gzip), CSS is 26.06 KB
  (6.06 KB gzip), and the first-load Lighthouse transfer total was 102,378 B.

## End-to-end product evidence

Using Chromium/Playwright against the production `dist/` served locally and a
fresh CORS-enabled local MinIO server, I exercised the browser UI at 1366x900:

- blank required connection input; unreachable endpoint with actionable CORS/
  reachability recovery text; then successful reconnect;
- invalid two-character bucket name blocked by native validation, then bucket
  create/list/select;
- small upload and a 9 MiB multipart upload; download control; presigned GET
  URL containing a valid `X-Amz-Signature` and the encoded object path;
- invalid policy JSON rejected with an announced error; versioning enabled;
  an object uploaded and deleted to create a delete marker;
- bucket deletion through the danger panel removed all versions and delete
  markers, then removed the bucket successfully.

The repository's real MinIO regression independently confirms that two prior
versions plus a delete marker are enumerated with `ListObjectVersions`, sent in
the standard multi-object delete request with version IDs, and permit bucket
deletion. Unit coverage also checks pagination markers and safe stop on a
per-version `AccessDenied` response.

The deliberate unreachable-endpoint test generated one expected
`ERR_CONNECTION_REFUSED` console resource error. Fresh initial desktop and
mobile loads had **zero** console errors and page errors. Session storage held
the connection by default; local storage was empty unless the user explicitly
opts in.

## Browser, accessibility, privacy, and PWA

- Desktop and 390x844 mobile: `lang=en`, expected title, exactly one `h1` and
  one `main`, no horizontal overflow, and 3px visible keyboard focus outline.
  Reduced-motion emulation reduced the tested transition duration to `0.00001s`.
- axe-core (connect and connected console screens at both viewports): 0
  serious/critical findings (indeed, 0 findings in these scans).
- Mobile Lighthouse (fresh local production build): Performance **99**,
  Accessibility **100**, LCP **298 ms**, CLS **0.078**, total transfer
  102,378 B. This is a local run, not a field measurement.
- No first-load requests left the console origin. During connection, the only
  additional origin was the explicitly entered MinIO endpoint; no analytics,
  cookies, remote fonts, or credential proxy were observed. `/privacy` and
  `/terms` return HTTP 200.
- A mobile service-worker-controlled reload succeeded while offline. A
  controlled two-revision static-server test then updated `sw.js`; the page
  displayed “An updated console is ready. Reload”, and the Reload action was
  invoked. The worker does not intercept cross-origin S3 requests.

## Live deployment, identity, headers, and caching

Fresh SHA-256 comparisons show the live `index.html`, referenced
`assets/index-DJensq58.js`, `assets/style-CFppeiF1.css`, `sw.js`, and
`manifest.webmanifest` are byte-identical to this candidate's fresh `dist/`.
The public host therefore serves the tested candidate, not the older failed
revision.

Live HTTPS response checks found:

- `/`, `/sw.js`, and `/manifest.webmanifest`: `Cache-Control: no-cache,
  max-age=0, must-revalidate`;
- fingerprinted JS and CSS: `Cache-Control: public, max-age=31536000,
  immutable`;
- HSTS, `nosniff`, `Referrer-Policy: no-referrer`, restrictive
  camera/microphone/geolocation permissions, and a self-only CSP for scripts,
  styles, images, and fonts. `connect-src *` is intentional and necessary for
  a console whose user selects any S3 endpoint.

Docker was not exercised because no Docker-compatible runtime is installed in
this verification container. The exact static production build, generated
deployment configuration, and live static deployment were exercised instead.

## Defects

No release-blocking defects found.

Non-blocking process gap: the repository has no `lint` command, so the
available `tsc --noEmit` production type check was used. The compatibility
matrix remains limited to MinIO for live storage integration; Garage, RustFS,
SeaweedFS, Ceph RGW, Versity, and AWS were not available in this isolated QA
environment.
