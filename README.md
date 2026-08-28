# S3 Console

Manage S3-compatible storage from your browser. S3 Console is for self-hosters and small ops teams using S3-compatible object stores from different providers.

[Try the isolated sample workspace](https://s3-console.sociobot.in/?demo=1). It needs no endpoint or credentials.

## What it does

- Creates and safely deletes buckets.
- Browses object folders and filters names.
- Uploads, downloads, and deletes objects.
- Copies objects or moves them after a successful copy.
- Edits object metadata and tags.
- Edits policy, browser-access, and lifecycle rules.
- Enables or suspends bucket versioning.
- Creates expiring download and upload links.
- Keeps the sample workspace available after an offline reload.
- Offers light and dark themes.

The console does not manage users, replication, monitoring, or provider-specific settings.

## Privacy and credentials

Your browser signs storage requests and sends them to the endpoint you choose. Your secret key is not sent in storage requests.

Connections use session storage by default. “Remember on this device” uses local storage. Disconnecting clears both copies.

The sample workspace is in memory. It sends no storage requests, sets no cookies, and writes no normal storage keys.

Read the live [privacy policy](https://s3-console.sociobot.in/privacy) and [terms](https://s3-console.sociobot.in/terms).

## Run and test

```sh
npm ci
npm run lint
npm test
npm run test:clean
npm run build
npm run test:browser
```

Run one declared product claim with its command in [`.factory/claims.json`](.factory/claims.json). The browser suite starts the production preview automatically.

An optional integration command accepts a disposable MinIO endpoint. It exercises version-aware bucket cleanup and multipart uploads over the direct browser client:

```sh
MINIO_ENDPOINT=http://127.0.0.1:9000 \
MINIO_ACCESS_KEY=minioadmin MINIO_SECRET_KEY=minioadmin \
npm run test:minio
```

## Configure an object store

The object store must allow requests from the console's web address. Start with this browser-access rule:

```json
{
  "AllowedOrigins": ["https://s3-console.sociobot.in"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"]
}
```

Replace the web address when self-hosting. These are the five request methods the console sends.

Expose the `ETag` response header so large uploads can finish. Some object stores label this setting “exposed response headers.”

Browsers block HTTPS pages from calling HTTP endpoints. Use HTTPS for the object store when this console uses HTTPS.

Path-style URLs are the default. Use bucket subdomain URLs only when DNS and TLS cover those subdomains.

## Deploy

`npm run build` writes the static site to `dist/`. The repository includes Azure Static Web Apps routing, headers, and cache rules.

## License and artwork

S3 Console uses the [MIT License](LICENSE). Its original generated artwork is documented in [`.factory/design.md`](.factory/design.md).
