# S3 Console

A fast, self-hostable web console for any S3-compatible object store. It is for self-hosters and small operations teams who need one UI for Garage, RustFS, SeaweedFS, Ceph RGW, Versity, AWS S3, and other standards-based stores.

The app has no backend. It signs standard S3 REST requests in your browser with SigV4 and sends them directly to the endpoint you enter. Credentials never transit Sociobot infrastructure.

## Features

- List, create, and delete buckets, including a deliberate version-history cleanup before deleting a versioned bucket
- Browse object keys as prefix folders with pagination and filtering
- Upload small files and multipart-upload larger files; download and delete objects
- Read and replace object metadata and tags
- Edit bucket policy JSON, CORS rules, and lifecycle rules
- Enable or suspend bucket versioning
- Create expiring GET and PUT presigned URLs
- Session-only credentials by default, optional device persistence, dark mode, offline app shell, keyboard and mobile layouts

This deliberately does not manage users/IAM, replication, metrics, or vendor-specific administration APIs.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Production builds use the factory work-order command and always land in `dist/`:

```sh
npm test
npm run build
npm run preview
```

To run the real MinIO regression (it is skipped by default so a normal test run
does not need credentials), point it at a disposable MinIO instance. This test
creates a bucket, creates two object versions and a delete marker, then proves
the browser client can remove all of them before bucket deletion.

```sh
MINIO_ENDPOINT=http://127.0.0.1:9000 \
MINIO_ACCESS_KEY=minioadmin MINIO_SECRET_KEY=minioadmin \
npm run test:minio
```

## Configure your object store

The endpoint must allow requests from the console origin. A starting CORS rule is:

```json
{
  "AllowedOrigins": ["https://s3-console.sociobot.in"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"]
}
```

Use the actual origin when self-hosting. Multipart uploads need `ETag` exposed. A page served over HTTPS cannot call an HTTP endpoint because browsers block mixed content; use HTTPS on the store or serve this console from a trusted HTTP origin inside the same network.

Path-style addressing is the most portable default. Choose virtual-hosted addressing only when DNS and TLS cover bucket subdomains. The selected access key needs permission for every operation you intend to use.

## Credential model

By default, the connection is stored in `sessionStorage` and disappears with the browser session. “Remember on this device” moves it to `localStorage`. Disconnecting removes both copies. The app has no cookies, trackers, analytics, credential proxy, or remote application database. See `/privacy` in the app.

Anyone with access to an unlocked browser profile may be able to read locally stored credentials. Prefer short-lived session credentials and least-privilege policies.

## Compatibility notes

The client uses AWS Signature Version 4, ListObjectsV2 continuation tokens, standard multipart upload, and public bucket configuration APIs. Backend behavior still varies:

| Backend | Expected mode | Validation status |
| --- | --- | --- |
| MinIO `RELEASE.2025-09-07` | Path-style | End-to-end local validation completed; this release returns `NotImplemented` for bucket CORS |
| AWS S3 | Virtual-hosted or path-style | Standard API implementation; live account not exercised in this build |
| Garage | Path-style | Standard API implementation; pending community matrix |
| RustFS | Path-style | Standard API implementation; pending community matrix |
| SeaweedFS | Path-style | Standard API implementation; pending community matrix |
| Ceph RGW | Path-style | Standard API implementation; pending community matrix |
| Versity | Path-style | Standard API implementation; pending community matrix |

Unsupported configuration calls surface the backend’s error without pretending the change succeeded.

## Docker

```sh
docker build -t s3-console .
docker run --rm -p 8080:8080 s3-console
```

The image is a static nginx container. It does not proxy S3 traffic.

## Deploy

Upload `dist/` to any static host. `staticwebapp.config.json` configures Azure Static Web Apps route fallback and security headers; `_headers` provides equivalent guidance for hosts supporting that convention. Do not put credentials in build-time environment variables.

Fingerprint-named files under `/assets/` are served with a one-year immutable
cache policy. The HTML shell, manifest, and service worker instead use
`no-cache, max-age=0, must-revalidate` so new releases and service-worker
updates are discovered promptly. Keep these rules when adapting the deploy
configuration to another static host.

## License

[MIT](LICENSE). The interface and generated artwork are original to this repository; asset provenance is documented in `.factory/design.md`.
