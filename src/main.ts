import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import './style.css';
import { S3Client, type Bucket, type Connection, type CorsRule, type LifecycleRule, type S3Object } from './s3';

type NoticeKind = 'success' | 'error' | 'info';
type AppState = {
  connection?: Connection; client?: S3Client; buckets: Bucket[]; bucket?: string; prefix: string;
  objects: S3Object[]; prefixes: string[]; nextToken?: string; loading: boolean; filter: string;
};

const app = document.querySelector<HTMLDivElement>('#app')!;
const state: AppState = { buckets: [], objects: [], prefixes: [], prefix: '', loading: false, filter: '' };

const icons: Record<string, string> = {
  mark: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 9 16 3l13 6-13 6L3 9Zm0 7 13 6 13-6M3 23l13 6 13-6"/></svg>',
  bucket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18l-2 13H5L3 7Zm3 0V4h12v3"/></svg>',
  folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h7l2 2h9v11H3V6Z"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6V2Zm8 0v5h5"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17V3m-5 5 5-5 5 5M4 16v5h16v-5"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10m4 0h2M4 17h2m4 0h10M14 4v6M6 14v6"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 15 6-6m-9 9-2-2a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 0l1 1m4-2 2 2a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6 0l-1-1"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>'
};

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
  return `${(bytes / 1024 ** unit).toFixed(unit ? 1 : 0)} ${['B', 'KB', 'MB', 'GB', 'TB'][unit]}`;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function themeButton(): string {
  return `<button class="icon-button" id="theme-toggle" type="button" aria-label="Toggle color theme" title="Toggle color theme"><span aria-hidden="true">◐</span></button>`;
}

function bindTheme(): void {
  document.querySelector('#theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next; localStorage.setItem('s3-theme', next);
  });
}

function notice(message: string, kind: NoticeKind = 'info'): void {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div'); toast.className = `toast ${kind}`; toast.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  toast.innerHTML = `<span>${kind === 'success' ? '✓' : kind === 'error' ? '!' : 'i'}</span><p>${escapeHtml(message)}</p><button aria-label="Dismiss notification">×</button>`;
  document.body.append(toast); toast.querySelector('button')?.addEventListener('click', () => toast.remove());
  window.setTimeout(() => toast.remove(), kind === 'error' ? 9000 : 4500);
}

function setBusy(button: HTMLButtonElement, busy: boolean, label = 'Working…'): void {
  if (busy) { button.dataset.label = button.innerHTML; button.innerHTML = `<span class="spinner" aria-hidden="true"></span>${label}`; button.disabled = true; }
  else { button.innerHTML = button.dataset.label || button.innerHTML; button.disabled = false; }
}

function legalPage(kind: 'privacy' | 'terms'): void {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — S3 Console`;
  app.innerHTML = `<header class="legal-head"><a class="brand" href="/">${icons.mark}<span>S3 Console</span></a>${themeButton()}</header>
    <main id="main" class="legal-page"><p class="eyebrow">${privacy ? 'Local-first by design' : 'The plain-language agreement'}</p>
    <h1>${privacy ? 'Privacy, without a footnote.' : 'Terms of use.'}</h1>
    ${privacy ? `<p class="lede">S3 Console has no server, account system, analytics, cookies, or tracking. Your browser talks directly to the endpoint you choose.</p>
      <h2>What stays in your browser</h2><p>Endpoint settings and credentials are kept in session storage by default and disappear when the tab session ends. If you explicitly select “Remember on this device,” they are stored in local storage until you disconnect or clear site data.</p>
      <h2>What leaves your browser</h2><p>S3 API requests, including access-key identifiers and cryptographic signatures, go only to your configured endpoint. Secret keys are used locally to sign requests and are never included directly in a request.</p>
      <h2>Offline cache</h2><p>A service worker may cache public application files for resilience. It does not cache S3 responses, bucket names, objects, or credentials.</p>` :
      `<p class="lede">S3 Console is free, open-source software provided as a browser-based client for systems you are authorized to access.</p>
      <h2>Your responsibility</h2><p>You are responsible for your endpoint configuration, credentials, permissions, backups, and any bucket or object operations you perform. Confirm destructive actions carefully.</p>
      <h2>No warranty</h2><p>The software is provided “as is,” without warranty. To the fullest extent permitted by law, the authors are not liable for loss arising from its use. The MIT License in the source repository controls.</p>
      <h2>Acceptable use</h2><p>Do not use this console to access storage without authorization or to violate applicable law.</p>`}
    <p class="legal-updated">Effective 27 August 2026 · <a href="/">Return to console</a></p></main>`;
  bindTheme(); bindRoutes();
}

function bindRoutes(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href="/"],a[href="/privacy"],a[href="/terms"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); history.pushState({}, '', link.pathname); route();
  }));
}

function route(): void {
  if (location.pathname === '/privacy') return legalPage('privacy');
  if (location.pathname === '/terms') return legalPage('terms');
  document.title = 'S3 Console — one console, any object store';
  if (state.connection) renderConsole(); else renderConnect();
}

function renderConnect(): void {
  app.innerHTML = `<header class="site-head"><a class="brand" href="/">${icons.mark}<span>S3 Console</span></a><div class="head-actions"><span class="local-pill"><i></i>Browser-only</span>${themeButton()}</div></header>
    <main id="main" class="connect-main">
      <section class="hero-copy"><p class="eyebrow">Universal S3 workbench // v1.0</p><h1>One console.<br><em>Any object store.</em></h1>
        <p class="hero-lede">Browse buckets, move objects, edit policies, and make presigned links—without a vendor admin API or a middleman server.</p>
        <ul class="compat-list" aria-label="Compatible object stores"><li>Garage</li><li>RustFS</li><li>SeaweedFS</li><li>Ceph RGW</li><li>Versity</li><li>AWS S3</li></ul>
      </section>
      <section class="connection-zone" aria-labelledby="connect-title">
        <picture class="hero-art"><source media="(max-width: 600px)" srcset="/assets/storage-workbench-mobile.webp"><img src="/assets/storage-workbench.webp" width="960" height="640" alt="Four different industrial storage crates linked to one terminal by orange cables" fetchpriority="high" decoding="async"></picture>
        <form class="connect-card" id="connect-form"><div class="card-index">01 / CONNECT</div><h2 id="connect-title">Open a direct line</h2><p>Credentials never leave this browser for our servers.</p>
          <label>Endpoint URL<input name="endpoint" type="url" inputmode="url" required placeholder="https://s3.example.net" autocomplete="url"></label>
          <div class="field-grid"><label>Region<input name="region" required value="us-east-1" autocomplete="off"></label><label>Addressing<select name="pathStyle"><option value="true">Path-style</option><option value="false">Virtual-hosted</option></select></label></div>
          <label>Access key ID<input name="accessKey" required autocomplete="username" spellcheck="false"></label>
          <label>Secret access key<input name="secretKey" type="password" required autocomplete="current-password"></label>
          <details><summary>Temporary credentials</summary><label>Session token <span>Optional</span><textarea name="sessionToken" rows="2" autocomplete="off"></textarea></label></details>
          <label class="check-row"><input name="remember" type="checkbox"><span><strong>Remember on this device</strong><small>Stores credentials in localStorage. Leave off on shared machines.</small></span></label>
          <div class="cors-note"><strong>Before connecting</strong><span>Your endpoint must allow this site’s origin in its CORS configuration. <a href="#cors-help">See a starter rule</a>.</span></div>
          <button class="button primary wide" type="submit">Test & connect <span aria-hidden="true">→</span></button><p class="form-status" aria-live="polite"></p>
        </form>
      </section>
      <section id="cors-help" class="cors-help"><p class="eyebrow">Required once per endpoint</p><h2>Browser access needs CORS.</h2><p>Add the console origin to your store’s CORS rules, allow GET, PUT, POST, DELETE and HEAD, and expose ETag for multipart uploads.</p><pre><code>{
  "AllowedOrigins": ["https://s3-console.sociobot.in"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedHeaders": ["*"], "ExposeHeaders": ["ETag"]
}</code></pre></section>
    </main>
    <footer class="site-footer"><p>Open-source utility. No telemetry. <span>Generated illustration disclosed.</span></p><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://github.com/B-Divyesh/sf-s3-console">Source ↗</a></nav></footer>`;
  bindTheme(); bindRoutes();
  document.querySelector('#connect-form')?.addEventListener('submit', connect);
}

async function connect(event: Event): Promise<void> {
  event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const data = new FormData(form); const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const connection: Connection = { endpoint: String(data.get('endpoint')).trim(), region: String(data.get('region')).trim(), accessKey: String(data.get('accessKey')).trim(), secretKey: String(data.get('secretKey')), sessionToken: String(data.get('sessionToken') || '').trim() || undefined, pathStyle: data.get('pathStyle') === 'true' };
  setBusy(button, true, 'Testing endpoint…');
  try {
    const client = new S3Client(connection); const buckets = await client.listBuckets();
    state.connection = connection; state.client = client; state.buckets = buckets;
    const storage = data.get('remember') ? localStorage : sessionStorage; storage.setItem('s3-connection', JSON.stringify(connection));
    (data.get('remember') ? sessionStorage : localStorage).removeItem('s3-connection');
    renderConsole(); notice(`Connected. Found ${buckets.length} bucket${buckets.length === 1 ? '' : 's'}.`, 'success');
  } catch (error) { const message = error instanceof Error ? error.message : 'Connection failed'; form.querySelector('.form-status')!.textContent = message; notice(message, 'error'); setBusy(button, false); }
}

function renderConsole(): void {
  app.innerHTML = `<div class="console-shell"><header class="console-head"><button class="mobile-nav" id="mobile-nav" aria-label="Show buckets">${icons.bucket}</button><a class="brand compact" href="/">${icons.mark}<h1>S3 Console</h1></a>
    <div class="endpoint-chip"><i></i><span><strong>Connected</strong>${escapeHtml(new URL(state.connection!.endpoint).host)}</span></div>
    <div class="console-actions">${themeButton()}<button class="button small" id="disconnect">Disconnect</button></div></header>
    <aside class="bucket-rail" id="bucket-rail"><div class="rail-label"><span>Buckets</span><b>${state.buckets.length.toString().padStart(2, '0')}</b></div><button class="button rail-create" id="create-bucket">＋ Create bucket</button><nav aria-label="Buckets"><ul class="bucket-list">${state.buckets.map(bucket => `<li><button data-bucket="${escapeHtml(bucket.name)}" class="${bucket.name === state.bucket ? 'active' : ''}">${icons.bucket}<span>${escapeHtml(bucket.name)}</span></button></li>`).join('')}</ul></nav><div class="rail-foot"><span>Region</span><strong>${escapeHtml(state.connection!.region)}</strong><span>Addressing</span><strong>${state.connection!.pathStyle ? 'Path-style' : 'Virtual host'}</strong></div></aside>
    <main id="main" class="object-workspace">${workspaceHtml()}</main></div>`;
  bindConsole(); bindTheme();
}

function workspaceHtml(): string {
  if (!state.bucket) return `<section class="workspace-empty"><span class="big-mark">${icons.mark}</span><p class="eyebrow">Connection is live</p><h2>${state.buckets.length ? 'Choose a bucket to begin.' : 'Your endpoint has no buckets yet.'}</h2><p>${state.buckets.length ? 'Select one from the bucket index. Nothing is copied or proxied through this app.' : 'Create your first bucket to start storing objects.'}</p><button class="button primary" id="empty-create">＋ Create bucket</button></section>`;
  const parent = state.prefix ? state.prefix.replace(/[^/]+\/$/, '') : '';
  const filteredPrefixes = state.prefixes.filter(prefix => prefix.toLowerCase().includes(state.filter.toLowerCase()));
  const filteredObjects = state.objects.filter(object => object.key.toLowerCase().includes(state.filter.toLowerCase()));
  return `<section class="workspace-head"><div><p class="eyebrow">Object ledger</p><div class="title-line"><h2>${escapeHtml(state.bucket)}</h2><span>${state.objects.length + state.prefixes.length} entries</span></div><nav class="breadcrumbs" aria-label="Current path"><button data-prefix="">${escapeHtml(state.bucket)}</button>${state.prefix.split('/').filter(Boolean).map((part, index, all) => `<span>/</span><button data-prefix="${escapeHtml(all.slice(0, index + 1).join('/') + '/')}">${escapeHtml(part)}</button>`).join('')}</nav></div><button class="button" id="bucket-settings">${icons.settings} Bucket settings</button></section>
    <section class="object-tools" aria-label="Object actions"><label class="search"><span>⌕</span><span class="sr-only">Filter current objects</span><input id="object-filter" type="search" value="${escapeHtml(state.filter)}" placeholder="Filter this view"></label><div><input class="sr-only" type="file" id="file-input" multiple><button class="button" id="new-folder">＋ New folder</button><button class="button primary" id="upload">${icons.upload} Upload objects</button></div></section>
    <div class="upload-progress" id="upload-progress" hidden><div><span>Uploading</span><strong id="upload-label">Preparing…</strong></div><progress id="upload-meter" max="1" value="0"></progress></div>
    <section class="ledger" aria-live="polite">${state.loading ? skeletonHtml() : ledgerHtml(filteredPrefixes, filteredObjects, parent)}</section>`;
}

function skeletonHtml(): string { return `<div class="ledger-header"><span>Name</span><span>Size</span><span>Modified</span><span></span></div>${[1,2,3,4].map(() => '<div class="skeleton-row"><i></i><i></i><i></i></div>').join('')}`; }

function ledgerHtml(prefixes: string[], objects: S3Object[], parent: string): string {
  if (!prefixes.length && !objects.length) return `<div class="ledger-empty">${icons.folder}<h3>${state.filter ? 'No matching objects.' : 'This prefix is empty.'}</h3><p>${state.filter ? 'Clear the filter to see everything here.' : 'Upload a file or create a folder marker.'}</p>${state.filter ? '<button class="button" id="clear-filter">Clear filter</button>' : '<button class="button primary" id="empty-upload">Upload objects</button>'}</div>`;
  return `<div class="ledger-header"><span>Name</span><span>Size</span><span>Modified</span><span>Actions</span></div>
    ${state.prefix ? `<button class="object-row folder-row" data-prefix="${escapeHtml(parent)}"><span class="object-name">${icons.folder}<b>..</b></span><span>—</span><span>Parent folder</span><span>Open</span></button>` : ''}
    ${prefixes.map(prefix => `<button class="object-row folder-row" data-prefix="${escapeHtml(prefix)}"><span class="object-name">${icons.folder}<b>${escapeHtml(prefix.slice(state.prefix.length).replace(/\/$/, ''))}</b></span><span>—</span><span>Prefix</span><span>Open →</span></button>`).join('')}
    ${objects.map(object => `<div class="object-row"><button class="object-main" data-object="${escapeHtml(object.key)}"><span class="object-name">${icons.file}<b>${escapeHtml(object.key.slice(state.prefix.length))}</b></span><span>${formatBytes(object.size)}</span><span>${formatDate(object.modified)}</span></button><div class="row-menu"><button data-download="${escapeHtml(object.key)}" title="Download">↓<span class="sr-only">Download ${escapeHtml(object.key)}</span></button><button data-link="${escapeHtml(object.key)}" title="Create link">↗<span class="sr-only">Create link for ${escapeHtml(object.key)}</span></button><button data-delete="${escapeHtml(object.key)}" title="Delete">×<span class="sr-only">Delete ${escapeHtml(object.key)}</span></button></div></div>`).join('')}
    ${state.nextToken ? '<button class="button load-more" id="load-more">Load next 250 objects</button>' : ''}`;
}

function bindConsole(): void {
  document.querySelector('#disconnect')?.addEventListener('click', disconnect);
  document.querySelector('#mobile-nav')?.addEventListener('click', () => document.querySelector('#bucket-rail')?.classList.toggle('open'));
  document.querySelectorAll<HTMLButtonElement>('[data-bucket]').forEach(button => button.addEventListener('click', () => selectBucket(button.dataset.bucket!)));
  ['#create-bucket', '#empty-create'].forEach(selector => document.querySelector(selector)?.addEventListener('click', createBucketDialog));
  document.querySelector('#bucket-settings')?.addEventListener('click', bucketSettingsDialog);
  document.querySelectorAll<HTMLButtonElement>('[data-prefix]').forEach(button => button.addEventListener('click', () => { state.prefix = button.dataset.prefix!; state.filter = ''; void loadObjects(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-object]').forEach(button => button.addEventListener('click', () => void objectDialog(button.dataset.object!)));
  document.querySelectorAll<HTMLButtonElement>('[data-download]').forEach(button => button.addEventListener('click', () => void downloadObject(button.dataset.download!)));
  document.querySelectorAll<HTMLButtonElement>('[data-link]').forEach(button => button.addEventListener('click', () => presignDialog(button.dataset.link!)));
  document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(button => button.addEventListener('click', () => void deleteObject(button.dataset.delete!)));
  ['#upload', '#empty-upload'].forEach(selector => document.querySelector(selector)?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#file-input')?.click()));
  document.querySelector('#file-input')?.addEventListener('change', event => void uploadFiles((event.target as HTMLInputElement).files));
  document.querySelector('#new-folder')?.addEventListener('click', newFolder);
  document.querySelector('#load-more')?.addEventListener('click', () => void loadObjects(true));
  document.querySelector('#clear-filter')?.addEventListener('click', () => { state.filter = ''; renderConsole(); });
  document.querySelector('#object-filter')?.addEventListener('input', event => { state.filter = (event.target as HTMLInputElement).value; document.querySelector('.ledger')!.innerHTML = ledgerHtml(state.prefixes.filter(p => p.toLowerCase().includes(state.filter.toLowerCase())), state.objects.filter(o => o.key.toLowerCase().includes(state.filter.toLowerCase())), state.prefix ? state.prefix.replace(/[^/]+\/$/, '') : ''); bindConsole(); });
}

async function refreshBuckets(): Promise<void> { state.buckets = await state.client!.listBuckets(); renderConsole(); }

async function selectBucket(bucket: string): Promise<void> {
  state.bucket = bucket; state.prefix = ''; state.filter = ''; document.querySelector('#bucket-rail')?.classList.remove('open'); await loadObjects();
}

async function loadObjects(append = false): Promise<void> {
  if (!state.bucket) return; state.loading = true; renderConsole();
  try {
    const page = await state.client!.listObjects(state.bucket, state.prefix, '/', append ? state.nextToken : undefined);
    state.objects = append ? [...state.objects, ...page.objects] : page.objects; state.prefixes = append ? [...state.prefixes, ...page.prefixes] : page.prefixes; state.nextToken = page.nextToken;
  } catch (error) { notice(error instanceof Error ? error.message : 'Could not list objects', 'error'); state.objects = []; state.prefixes = []; }
  finally { state.loading = false; renderConsole(); }
}

function openDialog(html: string, className = ''): HTMLDialogElement {
  const dialog = document.createElement('dialog'); dialog.className = className; dialog.innerHTML = html; document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove()); dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close())); dialog.showModal();
  return dialog;
}

function createBucketDialog(): void {
  const dialog = openDialog(`<form method="dialog" class="dialog-card" id="bucket-form"><div class="dialog-head"><div><p class="eyebrow">New container</p><h2>Create a bucket</h2></div><button class="icon-button" type="button" data-close aria-label="Close">${icons.close}</button></div><label>Bucket name<input name="name" required minlength="3" maxlength="63" pattern="[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]" autocomplete="off"><small>3–63 lowercase letters, numbers, dots, or hyphens.</small></label><div class="dialog-actions"><button class="button" type="button" data-close>Cancel</button><button class="button primary" type="submit">Create bucket</button></div></form>`);
  const form = dialog.querySelector<HTMLFormElement>('form')!; form.addEventListener('submit', async event => { event.preventDefault(); const button = form.querySelector<HTMLButtonElement>('[type="submit"]')!; const name = String(new FormData(form).get('name')); setBusy(button, true); try { await state.client!.createBucket(name); dialog.close(); await refreshBuckets(); await selectBucket(name); notice(`Bucket “${name}” created.`, 'success'); } catch (error) { notice(error instanceof Error ? error.message : 'Could not create bucket', 'error'); setBusy(button, false); } });
}

async function uploadFiles(files: FileList | null): Promise<void> {
  if (!files?.length || !state.bucket) return; const panel = document.querySelector<HTMLDivElement>('#upload-progress')!; const meter = document.querySelector<HTMLProgressElement>('#upload-meter')!; const label = document.querySelector('#upload-label')!; panel.hidden = false;
  try { for (let index = 0; index < files.length; index++) { const file = files[index]; label.textContent = `${index + 1}/${files.length} · ${file.name}`; await state.client!.upload(state.bucket, state.prefix + file.name, file, fraction => { meter.value = (index + fraction) / files.length; }); } notice(`${files.length} object${files.length === 1 ? '' : 's'} uploaded.`, 'success'); await loadObjects(); }
  catch (error) { notice(error instanceof Error ? error.message : 'Upload failed', 'error'); panel.hidden = true; }
}

function newFolder(): void {
  if (!state.bucket) return; const name = prompt('Folder name'); if (!name?.trim()) return;
  const file = new File([''], '.folder', { type: 'application/x-directory' });
  void state.client!.upload(state.bucket, `${state.prefix}${name.trim().replaceAll('/', '')}/.folder`, file, () => undefined).then(() => loadObjects()).then(() => notice(`Folder “${name.trim()}” created.`, 'success')).catch(error => notice(error instanceof Error ? error.message : 'Could not create folder', 'error'));
}

async function downloadObject(key: string): Promise<void> {
  try { const blob = await state.client!.download(state.bucket!, key); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = key.split('/').pop() || 'download'; anchor.click(); URL.revokeObjectURL(url); notice('Download started.', 'success'); }
  catch (error) { notice(error instanceof Error ? error.message : 'Download failed', 'error'); }
}

async function deleteObject(key: string): Promise<void> {
  if (!confirm(`Delete “${key}” permanently from “${state.bucket}”?\n\nThis cannot be undone by the console.`)) return;
  try { await state.client!.deleteObject(state.bucket!, key); await loadObjects(); notice(`Deleted “${key}”.`, 'success'); } catch (error) { notice(error instanceof Error ? error.message : 'Delete failed', 'error'); }
}

function presignDialog(key: string): void {
  const dialog = openDialog(`<form class="dialog-card" id="presign-form"><div class="dialog-head"><div><p class="eyebrow">Temporary access</p><h2>Create a presigned URL</h2></div><button class="icon-button" type="button" data-close aria-label="Close">${icons.close}</button></div><p class="code-path">${escapeHtml(key)}</p><div class="field-grid"><label>Action<select name="method"><option value="GET">Download (GET)</option><option value="PUT">Upload/replace (PUT)</option></select></label><label>Expires in<select name="expires"><option value="900">15 minutes</option><option value="3600" selected>1 hour</option><option value="21600">6 hours</option><option value="86400">24 hours</option><option value="604800">7 days</option></select></label></div><button class="button primary wide" type="submit">Generate URL</button><div class="url-result" hidden><label>Signed URL<textarea rows="4" readonly></textarea></label><button type="button" class="button" id="copy-url">Copy URL</button></div></form>`);
  const form = dialog.querySelector<HTMLFormElement>('form')!; form.addEventListener('submit', async event => { event.preventDefault(); const data = new FormData(form); const button = form.querySelector<HTMLButtonElement>('[type="submit"]')!; setBusy(button, true); try { const url = await state.client!.presign(data.get('method') as 'GET' | 'PUT', state.bucket!, key, Number(data.get('expires'))); const result = form.querySelector<HTMLDivElement>('.url-result')!; result.hidden = false; result.querySelector('textarea')!.value = url; setBusy(button, false); } catch (error) { notice(error instanceof Error ? error.message : 'Could not sign URL', 'error'); setBusy(button, false); } });
  dialog.querySelector('#copy-url')?.addEventListener('click', () => { const value = dialog.querySelector<HTMLTextAreaElement>('textarea')!.value; void navigator.clipboard.writeText(value).then(() => notice('URL copied.', 'success')); });
}

async function objectDialog(key: string): Promise<void> {
  const dialog = openDialog(`<div class="inspector"><div class="dialog-head"><div><p class="eyebrow">Object inspector</p><h2>${escapeHtml(key.split('/').pop())}</h2></div><button class="icon-button" type="button" data-close aria-label="Close">${icons.close}</button></div><p class="code-path">s3://${escapeHtml(state.bucket)}/${escapeHtml(key)}</p><div class="inspector-loading"><span class="spinner"></span>Reading headers and tags…</div></div>`, 'drawer');
  try {
    const [headers, tags] = await Promise.all([state.client!.headObject(state.bucket!, key), state.client!.getTags(state.bucket!, key).catch(() => ({}))]);
    const metadata = Object.fromEntries(Object.entries(headers).filter(([name]) => name.startsWith('x-amz-meta-')).map(([name, value]) => [name.slice(11), value]));
    dialog.querySelector('.inspector')!.innerHTML = `<div class="dialog-head"><div><p class="eyebrow">Object inspector</p><h2>${escapeHtml(key.split('/').pop())}</h2></div><button class="icon-button" type="button" data-close aria-label="Close">${icons.close}</button></div><p class="code-path">s3://${escapeHtml(state.bucket)}/${escapeHtml(key)}</p>
      <dl class="object-facts"><div><dt>Size</dt><dd>${formatBytes(Number(headers['content-length']))}</dd></div><div><dt>Modified</dt><dd>${formatDate(headers['last-modified'])}</dd></div><div><dt>Content type</dt><dd>${escapeHtml(headers['content-type'] || 'application/octet-stream')}</dd></div><div><dt>ETag</dt><dd>${escapeHtml(headers.etag || '—')}</dd></div></dl>
      <form id="object-detail-form"><label>Metadata <small>One key=value pair per line</small><textarea name="metadata" rows="6">${escapeHtml(Object.entries(metadata).map(([a,b]) => `${a}=${b}`).join('\n'))}</textarea></label><label>Tags <small>One key=value pair per line</small><textarea name="tags" rows="6">${escapeHtml(Object.entries(tags).map(([a,b]) => `${a}=${b}`).join('\n'))}</textarea></label><div class="dialog-actions spread"><button type="button" class="button" id="inspect-download">↓ Download</button><button type="submit" class="button primary">Save details</button></div></form>`;
    dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close()); dialog.querySelector('#inspect-download')?.addEventListener('click', () => void downloadObject(key));
    dialog.querySelector('form')?.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const data = new FormData(form); const parsePairs = (value: FormDataEntryValue | null) => Object.fromEntries(String(value || '').split('\n').map(line => line.trim()).filter(Boolean).map(line => { const at = line.indexOf('='); return at < 1 ? [line, ''] : [line.slice(0, at).trim(), line.slice(at + 1).trim()]; })); const button = form.querySelector<HTMLButtonElement>('[type="submit"]')!; setBusy(button, true); try { await Promise.all([state.client!.replaceMetadata(state.bucket!, key, parsePairs(data.get('metadata')), headers['content-type'] || 'application/octet-stream'), state.client!.putTags(state.bucket!, key, parsePairs(data.get('tags')))]); notice('Object details saved.', 'success'); dialog.close(); } catch (error) { notice(error instanceof Error ? error.message : 'Could not save details', 'error'); setBusy(button, false); } });
  } catch (error) { dialog.close(); notice(error instanceof Error ? error.message : 'Could not inspect object', 'error'); }
}

function bucketSettingsDialog(): void {
  const dialog = openDialog(`<div class="settings-dialog"><div class="dialog-head"><div><p class="eyebrow">Bucket control plane</p><h2>${escapeHtml(state.bucket)}</h2></div><button class="icon-button" type="button" data-close aria-label="Close">${icons.close}</button></div><div class="settings-layout"><div class="tab-list" role="tablist" aria-label="Bucket settings"><button role="tab" aria-selected="true" data-tab="versioning">Versioning</button><button role="tab" aria-selected="false" data-tab="policy">Policy</button><button role="tab" aria-selected="false" data-tab="cors">CORS</button><button role="tab" aria-selected="false" data-tab="lifecycle">Lifecycle</button><button role="tab" aria-selected="false" data-tab="danger">Danger zone</button></div><section class="tab-panel" id="settings-panel" aria-live="polite"><div class="inspector-loading"><span class="spinner"></span>Reading configuration…</div></section></div></div>`, 'settings-modal');
  dialog.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(button => button.addEventListener('click', () => { dialog.querySelectorAll('[data-tab]').forEach(tab => tab.setAttribute('aria-selected', String(tab === button))); void renderSettingsPanel(dialog, button.dataset.tab!); }));
  void renderSettingsPanel(dialog, 'versioning');
}

async function renderSettingsPanel(dialog: HTMLDialogElement, tab: string): Promise<void> {
  const panel = dialog.querySelector<HTMLElement>('#settings-panel')!; panel.innerHTML = '<div class="inspector-loading"><span class="spinner"></span>Reading configuration…</div>';
  try {
    if (tab === 'versioning') {
      const status = await state.client!.getVersioning(state.bucket!); panel.innerHTML = `<p class="eyebrow">Object history</p><h3>Versioning is ${status.toLowerCase()}.</h3><p>When enabled, writes keep prior versions. Suspending it does not delete versions that already exist.</p><form id="version-form"><label class="switch-row"><span><strong>Keep object versions</strong><small>Standard S3 bucket versioning</small></span><input type="checkbox" ${status === 'Enabled' ? 'checked' : ''}></label><button class="button primary" type="submit">Save versioning</button></form>`;
      panel.querySelector('form')?.addEventListener('submit', event => { event.preventDefault(); const checked = panel.querySelector<HTMLInputElement>('input')!.checked; void state.client!.putVersioning(state.bucket!, checked ? 'Enabled' : 'Suspended').then(() => notice('Versioning updated.', 'success')).catch(error => notice(error.message, 'error')); });
    } else if (tab === 'policy') {
      const policy = await state.client!.getPolicy(state.bucket!); panel.innerHTML = `<p class="eyebrow">Access policy</p><h3>Edit policy JSON</h3><p>Saving replaces the current bucket policy. Validate principals and actions carefully.</p><form id="policy-form"><label>Policy JSON<textarea class="code-editor" name="policy" rows="18" spellcheck="false">${escapeHtml(policy ? JSON.stringify(JSON.parse(policy), null, 2) : '')}</textarea></label><div class="dialog-actions spread"><button class="button danger" type="button" id="delete-policy">Remove policy</button><button class="button primary" type="submit">Validate & save</button></div></form>`;
      panel.querySelector('form')?.addEventListener('submit', event => { event.preventDefault(); const value = String(new FormData(event.currentTarget as HTMLFormElement).get('policy')); try { JSON.parse(value); void state.client!.putPolicy(state.bucket!, value).then(() => notice('Bucket policy saved.', 'success')).catch(error => notice(error.message, 'error')); } catch { notice('Policy is not valid JSON.', 'error'); } });
      panel.querySelector('#delete-policy')?.addEventListener('click', () => { if (confirm(`Remove the bucket policy from “${state.bucket}”?`)) void state.client!.deletePolicy(state.bucket!).then(() => renderSettingsPanel(dialog, tab)).then(() => notice('Bucket policy removed.', 'success')).catch(error => notice(error.message, 'error')); });
    } else if (tab === 'cors') {
      const rules = await state.client!.getCors(state.bucket!); panel.innerHTML = editorPanel('Cross-origin access', 'CORS rules', 'cors', rules.length ? JSON.stringify(rules, null, 2) : JSON.stringify([{ id: 'browser-console', origins: [location.origin], methods: ['GET','PUT','POST','DELETE','HEAD'], headers: ['*'], exposeHeaders: ['ETag'], maxAgeSeconds: 3600 }], null, 2), 'Rules use arrays for origins, methods, headers, and exposed headers.'); bindJsonEditor(panel, 'cors', value => state.client!.putCors(state.bucket!, value as CorsRule[]));
    } else if (tab === 'lifecycle') {
      const rules = await state.client!.getLifecycle(state.bucket!); panel.innerHTML = editorPanel('Retention automation', 'Lifecycle rules', 'lifecycle', JSON.stringify(rules, null, 2), 'Each rule needs id, status, prefix, and optional expirationDays or noncurrentDays.'); bindJsonEditor(panel, 'lifecycle', value => state.client!.putLifecycle(state.bucket!, value as LifecycleRule[]));
    } else {
      panel.innerHTML = `<p class="eyebrow danger-text">Irreversible action</p><h3>Delete this bucket</h3><p>S3 only permits deletion when the bucket contains no current objects. Versioned objects may also need to be removed with another tool.</p><button class="button danger" id="delete-bucket">Delete “${escapeHtml(state.bucket)}”</button>`;
      panel.querySelector('#delete-bucket')?.addEventListener('click', () => void deleteBucket(dialog));
    }
  } catch (error) { panel.innerHTML = `<div class="panel-error"><strong>Could not read this configuration.</strong><p>${escapeHtml(error instanceof Error ? error.message : 'Unknown S3 error')}</p><button class="button" id="retry-settings">Try again</button></div>`; panel.querySelector('#retry-settings')?.addEventListener('click', () => void renderSettingsPanel(dialog, tab)); }
}

function editorPanel(eyebrow: string, title: string, name: string, value: string, help: string): string {
  return `<p class="eyebrow">${eyebrow}</p><h3>${title}</h3><p>${help}</p><form id="${name}-form"><label>Rule JSON<textarea class="code-editor" name="value" rows="18" spellcheck="false">${escapeHtml(value)}</textarea></label><button class="button primary" type="submit">Validate & save rules</button></form>`;
}

function bindJsonEditor(panel: HTMLElement, name: string, save: (value: unknown) => Promise<void>): void {
  panel.querySelector('form')?.addEventListener('submit', event => { event.preventDefault(); const raw = String(new FormData(event.currentTarget as HTMLFormElement).get('value')); try { const value: unknown = JSON.parse(raw); if (!Array.isArray(value)) throw new Error('Rules must be a JSON array.'); void save(value).then(() => notice(`${name === 'cors' ? 'CORS' : 'Lifecycle'} rules saved.`, 'success')).catch(error => notice(error.message, 'error')); } catch (error) { notice(error instanceof Error ? error.message : 'Invalid JSON', 'error'); } });
}

async function deleteBucket(dialog: HTMLDialogElement): Promise<void> {
  const bucket = state.bucket!; if (!confirm(`Permanently delete the empty bucket “${bucket}”?\n\nThe console cannot undo this.`)) return;
  try { await state.client!.deleteBucket(bucket); state.bucket = undefined; state.objects = []; dialog.close(); await refreshBuckets(); notice(`Bucket “${bucket}” deleted.`, 'success'); } catch (error) { notice(error instanceof Error ? error.message : 'Could not delete bucket', 'error'); }
}

function disconnect(): void {
  if (!confirm('Disconnect and remove the saved endpoint and credentials from this browser?')) return;
  localStorage.removeItem('s3-connection'); sessionStorage.removeItem('s3-connection'); Object.assign(state, { connection: undefined, client: undefined, buckets: [], bucket: undefined, prefix: '', objects: [], prefixes: [], nextToken: undefined }); renderConnect(); notice('Credentials removed from this browser.', 'success');
}

function restore(): void {
  const stored = sessionStorage.getItem('s3-connection') || localStorage.getItem('s3-connection');
  if (!stored) return;
  try { state.connection = JSON.parse(stored) as Connection; state.client = new S3Client(state.connection); void state.client.listBuckets().then(buckets => { state.buckets = buckets; renderConsole(); }).catch(error => { notice(error instanceof Error ? error.message : 'Could not reconnect', 'error'); }); } catch { localStorage.removeItem('s3-connection'); sessionStorage.removeItem('s3-connection'); }
}

window.addEventListener('popstate', route);
window.addEventListener('offline', () => notice('You are offline. Existing S3 actions will wait until your connection returns.', 'error'));
window.addEventListener('online', () => notice('Back online. You can retry the last action.', 'success'));
document.documentElement.dataset.theme = localStorage.getItem('s3-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
restore(); route();
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
