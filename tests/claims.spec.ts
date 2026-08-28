import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { once } from 'node:events';
import { expect, test, type Page } from 'playwright/test';
import { DemoClient } from '../src/demo';
import { S3_HTTP_METHODS } from '../src/s3';

async function openDemo(page: Page): Promise<void> {
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { level: 1, name: 'media-archive' })).toBeVisible();
}

async function openSampleObject(page: Page): Promise<void> {
  await openDemo(page);
  await page.getByRole('button', { name: /campaigns/ }).click();
  await page.getByRole('button', { name: /autumn/ }).click();
  await page.locator('button[data-object$="hero-notes.txt"]').click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'hero-notes.txt' })).toBeVisible();
}

async function openSettings(page: Page): Promise<void> {
  await openDemo(page);
  await page.getByRole('button', { name: 'Bucket settings' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test('@claim:demo-sandbox loads isolated data, mutates it, and resets it', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await openDemo(page);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByLabel('Buckets', { exact: true }).getByRole('button', { name: 'media-archive' })).toBeVisible();
  await expect(page.getByRole('button', { name: /nightly-backups/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /static-site/ })).toBeVisible();
  await page.getByRole('button', { name: /Create bucket/ }).first().click();
  await page.getByLabel('Bucket name').fill('scratch-space');
  await page.getByRole('dialog').getByRole('button', { name: 'Create bucket' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'scratch-space' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: /scratch-space/ })).toHaveCount(0);
  await page.getByRole('link', { name: /Start for real/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Manage S3-compatible storage/ })).toBeVisible();
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBeTruthy();
  expect(await page.evaluate(() => ({ local: localStorage.getItem('s3-connection'), session: sessionStorage.getItem('s3-connection') }))).toEqual({ local: null, session: null });
});

test('@claim:free-to-use exposes no paid tier, payment step, or payment request', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.getByText('Free to use', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'media-archive' })).toBeVisible();
  const pageText = (await page.locator('body').innerText()).toLowerCase();
  expect(pageText).not.toMatch(/\b(price|pricing|pay|payment|checkout|subscribe|upgrade)\b/);
  expect(await page.locator('a, button').evaluateAll(elements => elements.filter(element => /price|pricing|pay|payment|checkout|subscribe|upgrade/i.test(`${element.textContent} ${(element as HTMLElement).getAttribute('aria-label') || ''}`)).length)).toBe(0);
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBeTruthy();
});

test('@claim:bucket-management creates and safely removes a sample bucket', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: /Create bucket/ }).first().click();
  await page.getByLabel('Bucket name').fill('release-candidate');
  await page.getByRole('dialog').getByRole('button', { name: 'Create bucket' }).click();
  await page.getByRole('button', { name: 'Bucket settings' }).click();
  await page.getByRole('tab', { name: 'Danger zone' }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Delete versions/ }).click();
  await expect(page.getByRole('button', { name: /release-candidate/ })).toHaveCount(0);
});

test('@claim:object-browser opens prefix folders and filters object names', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: /campaigns/ }).click();
  await page.getByRole('button', { name: /autumn/ }).click();
  await expect(page.getByText('hero-notes.txt', { exact: true })).toBeVisible();
  await page.getByLabel('Filter current objects').fill('checklist');
  await expect(page.getByText('launch-checklist.csv', { exact: true })).toBeVisible();
  await expect(page.getByText('hero-notes.txt', { exact: true })).toHaveCount(0);
});

test('@claim:object-upload uploads a file into the current sample bucket', async ({ page }) => {
  await openDemo(page);
  await page.locator('#file-input').setInputFiles({ name: 'release-notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Release ready') });
  await expect(page.getByText('release-notes.txt', { exact: true })).toBeVisible();
});

test('@claim:object-download downloads the original sample bytes', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: /brand/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download brand/usage-guide.txt' }).click();
  const download = await downloadPromise;
  expect(await download.createReadStream().then(async stream => { let text = ''; for await (const chunk of stream) text += chunk.toString(); return text; })).toContain('cream, charcoal, orange, and lime');
});

test('@claim:object-delete deletes an object from the sample inventory', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: /brand/ }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete brand/usage-guide.txt' }).click();
  await expect(page.getByText('usage-guide.txt', { exact: true })).toHaveCount(0);
});

test('@claim:object-copy copies a sample object with metadata and tags', async ({ page }) => {
  await openDemo(page); await page.getByRole('button', { name: /brand/ }).click();
  await page.locator('button[data-object$="usage-guide.txt"]').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Copy object' }).click();
  const transfer = page.locator('dialog').last();
  await transfer.getByLabel('Destination bucket').selectOption('static-site');
  await transfer.getByLabel('Destination object key').fill('copied-guide.txt');
  await transfer.getByRole('button', { name: 'Copy object' }).click();
  await page.locator('.drawer [data-close]').click();
  await page.getByRole('button', { name: /static-site/ }).click();
  await page.locator('button[data-object="copied-guide.txt"]').click();
  const copied = page.getByRole('dialog');
  await expect(copied.getByLabel(/Metadata/)).toHaveValue('owner=sample-ops');
  await expect(copied.getByLabel(/Tags/)).toHaveValue('team=design');
});

test('@claim:object-move copies a sample object before removing its source', async ({ page }) => {
  await openDemo(page); await page.getByRole('button', { name: /brand/ }).click();
  await page.locator('button[data-object$="usage-guide.txt"]').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Move object' }).click();
  const transfer = page.locator('dialog').last();
  await transfer.getByLabel('Destination bucket').selectOption('nightly-backups');
  await transfer.getByLabel('Destination object key').fill('migrated-guide.txt');
  await transfer.getByRole('button', { name: 'Move object' }).click();
  await page.locator('.drawer [data-close]').click();
  await expect(page.locator('button[data-object$="usage-guide.txt"]')).toHaveCount(0);
  await page.getByRole('button', { name: /nightly-backups/ }).click();
  await expect(page.locator('button[data-object="migrated-guide.txt"]')).toBeVisible();

  const isolated = new DemoClient();
  await expect(isolated.moveObject('media-archive', 'brand/usage-guide.txt', 'missing-bucket', 'guide.txt')).rejects.toThrow('was not found');
  await expect(isolated.download('media-archive', 'brand/usage-guide.txt')).resolves.toBeInstanceOf(Blob);
});

test('@claim:metadata-edit saves and reloads object metadata', async ({ page }) => {
  await openSampleObject(page);
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/Metadata/).fill('owner=release-team\nreviewed=yes');
  await dialog.getByRole('button', { name: 'Save details' }).click();
  await page.locator('button[data-object$="hero-notes.txt"]').click();
  await expect(page.getByRole('dialog').getByLabel(/Metadata/)).toHaveValue('owner=release-team\nreviewed=yes');
});

test('@claim:tag-edit saves and reloads object tags', async ({ page }) => {
  await openSampleObject(page);
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/Tags/).fill('project=autumn\nstatus=published');
  await dialog.getByRole('button', { name: 'Save details' }).click();
  await page.locator('button[data-object$="hero-notes.txt"]').click();
  await expect(page.getByRole('dialog').getByLabel(/Tags/)).toHaveValue('project=autumn\nstatus=published');
});

test('@claim:policy-edit saves and reloads bucket policy JSON', async ({ page }) => {
  await openSettings(page); const dialog = page.getByRole('dialog');
  await dialog.getByRole('tab', { name: 'Policy' }).click();
  const policy = '{"Version":"2012-10-17","Statement":[]}';
  await dialog.getByLabel('Policy JSON').fill(policy);
  await dialog.getByRole('button', { name: /Validate/ }).click();
  await dialog.getByRole('tab', { name: 'Versioning' }).click();
  await dialog.getByRole('tab', { name: 'Policy' }).click();
  await expect(dialog.getByLabel('Policy JSON')).toContainText('"Statement": []');
});

test('@claim:cors-edit saves and reloads browser-access rules', async ({ page }) => {
  await openSettings(page); const dialog = page.getByRole('dialog');
  await dialog.getByRole('tab', { name: 'CORS' }).click();
  const rules = '[{"id":"test","origins":["https://console.test"],"methods":["GET"]}]';
  await dialog.getByLabel('Rule JSON').fill(rules);
  await dialog.getByRole('button', { name: /save rules/i }).click();
  await dialog.getByRole('tab', { name: 'Versioning' }).click(); await dialog.getByRole('tab', { name: 'CORS' }).click();
  await expect(dialog.getByLabel('Rule JSON')).toContainText('https://console.test');
});

test('@claim:lifecycle-edit saves and reloads lifecycle rules', async ({ page }) => {
  await openSettings(page); const dialog = page.getByRole('dialog');
  await dialog.getByRole('tab', { name: 'Lifecycle' }).click();
  const rules = '[{"id":"archive","status":"Enabled","prefix":"logs/","expirationDays":14}]';
  await dialog.getByLabel('Rule JSON').fill(rules);
  await dialog.getByRole('button', { name: /save rules/i }).click();
  await dialog.getByRole('tab', { name: 'Versioning' }).click(); await dialog.getByRole('tab', { name: 'Lifecycle' }).click();
  await expect(dialog.getByLabel('Rule JSON')).toContainText('"expirationDays": 14');
});

test('@claim:versioning-edit enables or suspends bucket versioning and reloads both states', async ({ page }) => {
  await openSettings(page); const dialog = page.getByRole('dialog');
  const toggle = dialog.getByRole('checkbox', { name: /Keep object versions/ });
  await toggle.check(); await dialog.getByRole('button', { name: 'Save versioning' }).click();
  await dialog.getByRole('tab', { name: 'Policy' }).click(); await dialog.getByRole('tab', { name: 'Versioning' }).click();
  await expect(dialog.getByRole('checkbox', { name: /Keep object versions/ })).toBeChecked();
  await dialog.getByRole('checkbox', { name: /Keep object versions/ }).uncheck();
  await dialog.getByRole('button', { name: 'Save versioning' }).click();
  await dialog.getByRole('tab', { name: 'Policy' }).click(); await dialog.getByRole('tab', { name: 'Versioning' }).click();
  await expect(dialog.getByRole('checkbox', { name: /Keep object versions/ })).not.toBeChecked();
  await expect(dialog.getByRole('heading', { name: 'Versioning is suspended.' })).toBeVisible();
});

async function assertSignedLink(page: Page, label: 'Download (GET)' | 'Upload/replace (PUT)', method: 'GET' | 'PUT'): Promise<void> {
  await openDemo(page); await page.getByRole('button', { name: /brand/ }).click();
  await page.getByRole('button', { name: 'Create link for brand/usage-guide.txt' }).click();
  const dialog = page.getByRole('dialog'); await dialog.getByLabel('Action').selectOption({ label });
  await dialog.getByLabel('Expires in').selectOption('900'); await dialog.getByRole('button', { name: 'Generate URL' }).click();
  const url = new URL(await dialog.getByLabel('Signed URL').inputValue());
  expect(url.searchParams.get('demo-method')).toBe(method); expect(url.searchParams.get('X-Amz-Expires')).toBe('900');
}

test('@claim:presigned-download creates an expiring download link', async ({ page }) => {
  await assertSignedLink(page, 'Download (GET)', 'GET');
});

test('@claim:presigned-upload creates an expiring upload link', async ({ page }) => {
  await assertSignedLink(page, 'Upload/replace (PUT)', 'PUT');
});

test('@claim:privacy-boundary keeps a full demo flow out of normal browser storage and off-origin requests', async ({ page, context }) => {
  const offOrigin: string[] = []; page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url()); });
  await openDemo(page); await page.getByRole('button', { name: /campaigns/ }).click(); await page.getByRole('button', { name: /autumn/ }).click();
  await page.getByRole('button', { name: /Create bucket/ }).first().click();
  await page.getByLabel('Bucket name').fill('privacy-probe');
  await page.getByRole('dialog').getByRole('button', { name: 'Create bucket' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: /privacy-probe/ })).toHaveCount(0);
  await page.getByRole('link', { name: /Start for real/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Manage S3-compatible storage/ })).toBeVisible();
  expect(offOrigin).toEqual([]); expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => ({
    local: Object.keys(localStorage).filter(key => !key.startsWith('demo:')),
    session: Object.keys(sessionStorage).filter(key => !key.startsWith('demo:'))
  }))).toEqual({ local: [], session: [] });
});

test('@claim:offline-cache-boundary caches only public same-origin console files', async ({ page }) => {
  const secret = 'never-cache-this-secret';
  await page.route('https://cache-store.example.test/**', route => {
    const url = new URL(route.request().url());
    const body = url.pathname === '/'
      ? '<ListAllMyBucketsResult><Buckets><Bucket><Name>private-bucket</Name></Bucket></Buckets></ListAllMyBucketsResult>'
      : '<ListBucketResult><Contents><Key>private-object.txt</Key><Size>12</Size></Contents></ListBucketResult>';
    return route.fulfill({ contentType: 'application/xml', body });
  });
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.getByLabel('Storage endpoint URL').fill('https://cache-store.example.test');
  await page.getByLabel('Access key ID').fill('CACHE-ACCESS');
  await page.getByLabel('Secret access key').fill(secret);
  await page.getByRole('button', { name: 'Test and connect' }).click();
  await page.getByRole('button', { name: 'private-bucket' }).click();
  await expect(page.getByText('private-object.txt', { exact: true })).toBeVisible();
  const cacheSnapshot = await page.evaluate(async () => {
    const entries: Array<{ url: string; body: string }> = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const response = await cache.match(request);
        entries.push({ url: request.url, body: response ? await response.clone().text() : '' });
      }
    }
    return entries;
  });
  expect(cacheSnapshot.length).toBeGreaterThan(0);
  expect(cacheSnapshot.every(entry => new URL(entry.url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
  expect(JSON.stringify(cacheSnapshot)).not.toContain('private-bucket');
  expect(JSON.stringify(cacheSnapshot)).not.toContain('private-object.txt');
  expect(JSON.stringify(cacheSnapshot)).not.toContain(secret);
});

test('@claim:cors-starter-rule publishes and preflights every request method the console can send', async ({ page }) => {
  const preflightMethods: string[] = [];
  const requestMethods: string[] = [];
  const allowedMethods = S3_HTTP_METHODS.join(', ');
  const server = createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*');
    response.setHeader('Access-Control-Allow-Methods', allowedMethods);
    response.setHeader('Access-Control-Allow-Headers', request.headers['access-control-request-headers'] || '*');
    response.setHeader('Access-Control-Max-Age', '0');
    if (request.method === 'OPTIONS') {
      preflightMethods.push(String(request.headers['access-control-request-method']));
      response.writeHead(204).end();
      return;
    }
    requestMethods.push(String(request.method));
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const reply = (): void => {
      response.setHeader('Access-Control-Expose-Headers', 'ETag, Content-Length, Content-Type, Last-Modified');
      if (request.method === 'GET' && url.pathname === '/') {
        response.setHeader('Content-Type', 'application/xml');
        response.end('<ListAllMyBucketsResult><Buckets><Bucket><Name>cors-bucket</Name></Bucket></Buckets></ListAllMyBucketsResult>');
      } else if (request.method === 'GET' && url.searchParams.has('tagging')) {
        response.setHeader('Content-Type', 'application/xml');
        response.end('<Tagging><TagSet></TagSet></Tagging>');
      } else if (request.method === 'GET') {
        response.setHeader('Content-Type', 'application/xml');
        response.end('<ListBucketResult><Contents><Key>seed.txt</Key><Size>5</Size><LastModified>2026-08-28T12:00:00Z</LastModified></Contents></ListBucketResult>');
      } else if (request.method === 'HEAD') {
        response.setHeader('Content-Type', 'text/plain');
        response.setHeader('Content-Length', '5');
        response.setHeader('ETag', 'seed-etag');
        response.setHeader('Last-Modified', 'Fri, 28 Aug 2026 12:00:00 GMT');
        response.end();
      } else if (request.method === 'POST' && url.searchParams.has('uploads')) {
        response.setHeader('Content-Type', 'application/xml');
        response.end('<InitiateMultipartUploadResult><UploadId>cors-upload</UploadId></InitiateMultipartUploadResult>');
      } else if (request.method === 'PUT' && url.searchParams.has('partNumber')) {
        response.setHeader('ETag', `cors-part-${url.searchParams.get('partNumber')}`);
        response.writeHead(200).end();
      } else if (request.method === 'POST' && url.searchParams.has('uploadId')) {
        response.setHeader('Content-Type', 'application/xml');
        response.end('<CompleteMultipartUploadResult/>');
      } else {
        response.writeHead(204).end();
      }
    };
    if (request.method === 'PUT' || request.method === 'POST') {
      request.resume();
      request.on('end', reply);
    } else reply();
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const endpoint = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    await page.goto('/');
    await expect(page.locator('#cors-help')).toContainText('GET, PUT, POST, DELETE, and HEAD');
    const published = JSON.parse(await page.locator('#cors-help pre').innerText()) as { AllowedMethods: string[] };
    expect(published.AllowedMethods).toEqual([...S3_HTTP_METHODS]);
    await page.getByLabel('Storage endpoint URL').fill(endpoint);
    await page.getByLabel('Access key ID').fill('CORS-PROBE');
    await page.getByLabel('Secret access key').fill('cors-probe-secret');
    await page.getByRole('button', { name: 'Test and connect' }).click();
    await page.getByRole('button', { name: 'cors-bucket' }).click();
    await page.locator('button[data-object="seed.txt"]').click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'seed.txt' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
    await page.locator('#file-input').setInputFiles({ name: 'cors-large.bin', mimeType: 'application/octet-stream', buffer: Buffer.alloc(8 * 1024 * 1024 + 1, 3) });
    await expect(page.getByText('1 object uploaded.')).toBeVisible();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete seed.txt' }).click();
    await expect.poll(() => [...new Set(preflightMethods)].sort()).toEqual([...S3_HTTP_METHODS].sort());
    expect([...new Set(requestMethods)].sort()).toEqual([...S3_HTTP_METHODS].sort());
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('@claim:credential-storage keeps normal connections session-only unless opted in', async ({ page }) => {
  await page.route('https://storage.example.test/**', route => route.fulfill({ status: 200, contentType: 'application/xml', body: '<ListAllMyBucketsResult><Buckets></Buckets></ListAllMyBucketsResult>' }));
  await page.goto('/'); await page.getByLabel('Storage endpoint URL').fill('https://storage.example.test'); await page.getByLabel('Access key ID').fill('TEST'); await page.getByLabel('Secret access key').fill('secret');
  await page.getByRole('button', { name: 'Test and connect' }).click();
  await expect(page.getByText('Connected. Found 0 buckets.')).toBeVisible();
  expect(await page.evaluate(() => ({ local: localStorage.getItem('s3-connection'), session: sessionStorage.getItem('s3-connection') }))).toMatchObject({ local: null, session: expect.stringContaining('storage.example.test') });
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Disconnect' }).click();
  await page.getByLabel('Storage endpoint URL').fill('https://storage.example.test');
  await page.getByLabel('Access key ID').fill('TEST');
  await page.getByLabel('Secret access key').fill('secret');
  await page.getByLabel('Remember on this device').check();
  await page.getByRole('button', { name: 'Test and connect' }).click();
  await expect(page.getByText('Connected. Found 0 buckets.')).toBeVisible();
  expect(await page.evaluate(() => ({ local: localStorage.getItem('s3-connection'), session: sessionStorage.getItem('s3-connection') }))).toMatchObject({ local: expect.stringContaining('storage.example.test'), session: null });
});

test('@claim:credential-disconnect removes both connection stores', async ({ page }) => {
  await page.route('https://storage.example.test/**', route => route.fulfill({ status: 200, contentType: 'application/xml', body: '<ListAllMyBucketsResult><Buckets></Buckets></ListAllMyBucketsResult>' }));
  await page.goto('/');
  const saved = JSON.stringify({ endpoint: 'https://storage.example.test', region: 'us-east-1', accessKey: 'TEST', secretKey: 'secret', pathStyle: true });
  await page.evaluate(value => { localStorage.setItem('s3-connection', value); sessionStorage.setItem('s3-connection', value); }, saved);
  await page.reload(); await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible();
  page.once('dialog', dialog => dialog.accept()); await page.getByRole('button', { name: 'Disconnect' }).click();
  expect(await page.evaluate(() => ({ local: localStorage.getItem('s3-connection'), session: sessionStorage.getItem('s3-connection') }))).toEqual({ local: null, session: null });
});

test('@claim:credential-routing sends signed requests only to the chosen endpoint without the secret', async ({ page }) => {
  const seen: Array<{ url: string; headers: Record<string, string> }> = [];
  await page.route('https://storage.example.test/**', route => { seen.push({ url: route.request().url(), headers: route.request().headers() }); return route.fulfill({ status: 200, contentType: 'application/xml', body: '<ListAllMyBucketsResult><Buckets></Buckets></ListAllMyBucketsResult>' }); });
  await page.goto('/'); await page.getByLabel('Storage endpoint URL').fill('https://storage.example.test'); await page.getByLabel('Access key ID').fill('VISIBLEACCESS'); await page.getByLabel('Secret access key').fill('never-send-this'); await page.getByRole('button', { name: 'Test and connect' }).click();
  await expect(page.getByText('Connected. Found 0 buckets.')).toBeVisible(); expect(seen).toHaveLength(1); expect(seen[0].url).toMatch(/^https:\/\/storage\.example\.test\//); expect(JSON.stringify(seen)).not.toContain('never-send-this'); expect(seen[0].headers.authorization).toContain('VISIBLEACCESS');
});

test('@claim:offline-shell reloads the sample workspace offline after one visit', async ({ page, context }) => {
  await openDemo(page); await page.evaluate(() => navigator.serviceWorker.ready); await context.setOffline(true); await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible(); await expect(page.getByRole('heading', { level: 1, name: 'media-archive' })).toBeVisible();
});

test('@claim:theme-choice persists the selected theme in normal mode', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Toggle color theme' }).click();
  const theme = await page.locator('html').getAttribute('data-theme'); await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme!);
});

test('@claim:scope-boundary exposes no user, replication, monitoring, or provider account controls', async ({ page }) => {
  await openDemo(page);
  for (const name of [/manage users/i, /replication settings/i, /monitoring dashboard/i, /provider account/i]) await expect(page.getByRole('button', { name })).toHaveCount(0);
});

test('@claim:multipart-upload sends an 8 MiB-plus file through initiate, parts, and completion', async ({ page }) => {
  const requests: Array<{ url: URL; method: string; bytes: number }> = [];
  await page.route('https://multipart.example.test/**', async route => {
    const request = route.request(); const url = new URL(request.url());
    requests.push({ url, method: request.method(), bytes: request.postDataBuffer()?.length || 0 });
    if (request.method() === 'GET' && url.pathname === '/') return route.fulfill({ contentType: 'application/xml', body: '<ListAllMyBucketsResult><Buckets><Bucket><Name>transfer-bucket</Name></Bucket></Buckets></ListAllMyBucketsResult>' });
    if (request.method() === 'GET') return route.fulfill({ contentType: 'application/xml', body: '<ListBucketResult></ListBucketResult>' });
    if (request.method() === 'POST' && url.searchParams.has('uploads')) return route.fulfill({ contentType: 'application/xml', body: '<InitiateMultipartUploadResult><UploadId>test-upload</UploadId></InitiateMultipartUploadResult>' });
    if (request.method() === 'PUT' && url.searchParams.has('partNumber')) return route.fulfill({ status: 200, headers: { ETag: `part-${url.searchParams.get('partNumber')}`, 'Access-Control-Expose-Headers': 'ETag', 'Access-Control-Allow-Origin': '*' } });
    if (request.method() === 'POST' && url.searchParams.has('uploadId')) return route.fulfill({ status: 200, contentType: 'application/xml', body: '<CompleteMultipartUploadResult/>' });
    return route.fulfill({ status: 500, body: 'Unexpected S3 request' });
  });
  await page.goto('/');
  await page.getByLabel('Storage endpoint URL').fill('https://multipart.example.test');
  await page.getByLabel('Access key ID').fill('TEST'); await page.getByLabel('Secret access key').fill('secret');
  await page.getByRole('button', { name: 'Test and connect' }).click();
  await page.getByRole('button', { name: 'transfer-bucket' }).click();
  const bytes = 8 * 1024 * 1024 + 1;
  await page.locator('#file-input').setInputFiles({ name: 'archive.bin', mimeType: 'application/octet-stream', buffer: Buffer.alloc(bytes, 7) });
  await expect(page.getByText('1 object uploaded.')).toBeVisible();
  const initiated = requests.filter(item => item.method === 'POST' && item.url.searchParams.has('uploads'));
  const parts = requests.filter(item => item.method === 'PUT' && item.url.searchParams.has('partNumber'));
  const complete = requests.filter(item => item.method === 'POST' && item.url.searchParams.has('uploadId'));
  expect(initiated).toHaveLength(1); expect(parts).toHaveLength(2); expect(parts[0].bytes + parts[1].bytes).toBe(bytes); expect(complete).toHaveLength(1);
});

test('@claim:path-style-default selects path-style URLs and places the bucket in the request path', async ({ page }) => {
  const requestPaths: string[] = [];
  await page.route('https://path-style.example.test/**', route => {
    requestPaths.push(new URL(route.request().url()).pathname);
    return route.fulfill({ contentType: 'application/xml', body: route.request().method() === 'GET' && new URL(route.request().url()).pathname === '/' ? '<ListAllMyBucketsResult><Buckets><Bucket><Name>path-bucket</Name></Bucket></Buckets></ListAllMyBucketsResult>' : '<ListBucketResult></ListBucketResult>' });
  });
  await page.goto('/');
  await expect(page.getByLabel('URL format')).toHaveValue('true');
  await page.getByLabel('Storage endpoint URL').fill('https://path-style.example.test');
  await page.getByLabel('Access key ID').fill('TEST'); await page.getByLabel('Secret access key').fill('secret');
  await page.getByRole('button', { name: 'Test and connect' }).click();
  await page.getByRole('button', { name: 'path-bucket' }).click();
  await expect.poll(() => requestPaths).toContain('/path-bucket');
});

test('@claim:bucket-subdomain-routing puts the bucket in the signed hostname and object key in the path', async ({ page }) => {
  const requests: Array<{ url: URL; headers: Record<string, string> }> = [];
  await page.route(/https:\/\/(?:virtual-bucket\.)?storage\.example\.test\//, route => {
    const request = route.request(); const url = new URL(request.url());
    requests.push({ url, headers: request.headers() });
    if (request.method() === 'GET' && url.hostname === 'storage.example.test' && url.pathname === '/') {
      return route.fulfill({ contentType: 'application/xml', body: '<ListAllMyBucketsResult><Buckets><Bucket><Name>virtual-bucket</Name></Bucket></Buckets></ListAllMyBucketsResult>' });
    }
    if (request.method() === 'GET' && url.searchParams.has('tagging')) return route.fulfill({ contentType: 'application/xml', body: '<Tagging><TagSet></TagSet></Tagging>' });
    if (request.method() === 'HEAD') return route.fulfill({ status: 200, headers: { 'content-length': '5', etag: 'virtual-etag', 'last-modified': 'Fri, 28 Aug 2026 12:00:00 GMT' } });
    if (request.method() === 'GET') return route.fulfill({ contentType: 'application/xml', body: '<ListBucketResult><Contents><Key>seed.txt</Key><Size>5</Size><LastModified>2026-08-28T12:00:00Z</LastModified></Contents></ListBucketResult>' });
    return route.fulfill({ status: 500, body: 'Unexpected S3 request' });
  });
  await page.goto('/');
  await page.getByLabel('URL format').selectOption('false');
  await page.getByLabel('Storage endpoint URL').fill('https://storage.example.test');
  await page.getByLabel('Access key ID').fill('VIRTUALACCESS'); await page.getByLabel('Secret access key').fill('never-send-this');
  await page.getByRole('button', { name: 'Test and connect' }).click();
  await page.getByRole('button', { name: 'virtual-bucket' }).click();
  await expect(page.locator('button[data-object="seed.txt"]')).toBeVisible();
  await page.locator('button[data-object="seed.txt"]').click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'seed.txt' })).toBeVisible();
  const virtualRequests = requests.filter(request => request.url.hostname === 'virtual-bucket.storage.example.test');
  expect(virtualRequests.some(request => request.url.pathname === '/' && request.url.searchParams.get('list-type') === '2')).toBeTruthy();
  const objectRequest = virtualRequests.find(request => request.url.pathname === '/seed.txt');
  expect(objectRequest).toBeDefined();
  expect(objectRequest!.headers.authorization).toContain('Credential=VIRTUALACCESS/');
  expect(JSON.stringify(objectRequest!.headers)).not.toContain('never-send-this');
});
