# Sample workspace

Open `https://s3-console.sociobot.in/?demo=1` or `/demo`. The home page also has a first-screen “Try it with sample data” action.

The sample workspace contains `media-archive`, `nightly-backups`, and `static-site`. Its files include a campaign checklist, backup manifests, site assets, metadata, tags, policy JSON, browser-access rules, lifecycle rules, and versioning state. Open any object to copy it to another sample bucket or move it there; move creates the destination copy before removing the source.

Demo state lives only inside the page's in-memory `DemoClient`. It never reads or writes `s3-connection`, and it sends no S3 requests. “Reset demo” replaces the in-memory client with a fresh seed. “Start for real” discards the sample state and returns home. Theme changes made in demo mode are not persisted.

Run `npm run test:claims` to verify the sample data, mutation paths, reset behavior, storage boundary, and network boundary from fresh browser contexts.
