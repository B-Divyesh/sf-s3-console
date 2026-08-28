import { S3_HTTP_METHODS, type Bucket, type BucketDeleteProgress, type CorsRule, type LifecycleRule, type ObjectPage, type S3Object } from './s3';

export interface ConsoleClient {
  listBuckets(): Promise<Bucket[]>;
  createBucket(name: string): Promise<void>;
  deleteBucketWithVersions(name: string, onProgress?: (progress: BucketDeleteProgress) => void): Promise<void>;
  listObjects(bucket: string, prefix?: string, delimiter?: string, token?: string): Promise<ObjectPage>;
  upload(bucket: string, key: string, file: File, onProgress: (fraction: number) => void): Promise<void>;
  download(bucket: string, key: string): Promise<Blob>;
  deleteObject(bucket: string, key: string): Promise<void>;
  copyObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void>;
  moveObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void>;
  headObject(bucket: string, key: string): Promise<Record<string, string>>;
  replaceMetadata(bucket: string, key: string, metadata: Record<string, string>, contentType: string): Promise<void>;
  getTags(bucket: string, key: string): Promise<Record<string, string>>;
  putTags(bucket: string, key: string, tags: Record<string, string>): Promise<void>;
  getPolicy(bucket: string): Promise<string>;
  putPolicy(bucket: string, policy: string): Promise<void>;
  deletePolicy(bucket: string): Promise<void>;
  getVersioning(bucket: string): Promise<'Enabled' | 'Suspended'>;
  putVersioning(bucket: string, status: 'Enabled' | 'Suspended'): Promise<void>;
  getCors(bucket: string): Promise<CorsRule[]>;
  putCors(bucket: string, rules: CorsRule[]): Promise<void>;
  getLifecycle(bucket: string): Promise<LifecycleRule[]>;
  putLifecycle(bucket: string, rules: LifecycleRule[]): Promise<void>;
  presign(method: 'GET' | 'PUT', bucket: string, key: string, expires: number): Promise<string>;
}

type DemoObject = S3Object & { body: Blob; contentType: string; metadata: Record<string, string>; tags: Record<string, string> };
type DemoBucket = Bucket & { objects: Map<string, DemoObject>; policy: string; cors: CorsRule[]; lifecycle: LifecycleRule[]; versioning: 'Enabled' | 'Suspended' };

const date = '2026-08-27T14:20:00.000Z';
const object = (key: string, body: string, contentType: string, tags: Record<string, string> = {}): DemoObject => ({
  key, body: new Blob([body], { type: contentType }), size: new Blob([body]).size, modified: date,
  etag: `demo-${key.length}`, storageClass: 'STANDARD', contentType, metadata: { owner: 'sample-ops' }, tags
});

function seededBuckets(): Map<string, DemoBucket> {
  const make = (name: string, objects: DemoObject[], versioning: 'Enabled' | 'Suspended' = 'Suspended'): DemoBucket => ({
    name, created: '2026-08-20T09:00:00.000Z', objects: new Map(objects.map(item => [item.key, item])), versioning,
    policy: JSON.stringify({ Version: '2012-10-17', Statement: [{ Sid: 'PublicSiteRead', Effect: 'Allow', Principal: '*', Action: 's3:GetObject', Resource: `arn:aws:s3:::${name}/*` }] }),
    cors: [{ id: 'browser-console', origins: ['https://s3-console.sociobot.in'], methods: [...S3_HTTP_METHODS], headers: ['*'], exposeHeaders: ['ETag'], maxAgeSeconds: 3600 }],
    lifecycle: [{ id: 'expire-drafts', status: 'Enabled', prefix: 'drafts/', expirationDays: 30 }]
  });
  return new Map([
    ['media-archive', make('media-archive', [
      object('campaigns/autumn/hero-notes.txt', 'Final crop approved for the autumn campaign.\n', 'text/plain', { project: 'autumn', status: 'approved' }),
      object('campaigns/autumn/launch-checklist.csv', 'task,owner,status\nCompress images,Mina,done\nPublish assets,Theo,ready\n', 'text/csv', { project: 'autumn' }),
      object('brand/usage-guide.txt', 'Use the cream, charcoal, orange, and lime storage palette.\n', 'text/plain', { team: 'design' })
    ])],
    ['nightly-backups', make('nightly-backups', [
      object('postgres/2026-08-27/manifest.json', '{"database":"inventory","tables":42,"encrypted":true}', 'application/json', { retention: '30-days' }),
      object('postgres/2026-08-26/manifest.json', '{"database":"inventory","tables":42,"encrypted":true}', 'application/json', { retention: '30-days' })
    ], 'Enabled')],
    ['static-site', make('static-site', [
      object('index.html', '<h1>Sample field notes</h1>', 'text/html', { environment: 'production' }),
      object('assets/release.txt', 'release=2026.08.27\n', 'text/plain', { cache: 'immutable' })
    ])]
  ]);
}

export class DemoClient implements ConsoleClient {
  private buckets = seededBuckets();

  reset(): void { this.buckets = seededBuckets(); }
  async listBuckets(): Promise<Bucket[]> { return [...this.buckets.values()].map(({ name, created }) => ({ name, created })); }
  async createBucket(name: string): Promise<void> {
    if (this.buckets.has(name)) throw new Error('That sample bucket already exists.');
    this.buckets.set(name, { name, created: new Date().toISOString(), objects: new Map(), policy: '', cors: [], lifecycle: [], versioning: 'Suspended' });
  }
  async deleteBucketWithVersions(name: string, onProgress?: (progress: BucketDeleteProgress) => void): Promise<void> {
    const bucket = this.needBucket(name); const count = bucket.objects.size;
    onProgress?.({ phase: 'listing', discovered: count, deleted: 0 });
    onProgress?.({ phase: 'deleting', discovered: count, deleted: count });
    onProgress?.({ phase: 'bucket', discovered: count, deleted: count });
    this.buckets.delete(name);
  }
  async listObjects(bucketName: string, prefix = '', delimiter = '/', token?: string): Promise<ObjectPage> {
    const values = [...this.needBucket(bucketName).objects.values()].filter(item => item.key.startsWith(prefix)).sort((a, b) => a.key.localeCompare(b.key));
    const prefixes = new Set<string>(); const objects: S3Object[] = [];
    for (const item of values) {
      const rest = item.key.slice(prefix.length); const slash = delimiter ? rest.indexOf(delimiter) : -1;
      if (slash >= 0) prefixes.add(prefix + rest.slice(0, slash + 1));
      else if (!(item.key.endsWith('/') && item.size === 0)) objects.push({ key: item.key, size: item.size, modified: item.modified, etag: item.etag, storageClass: item.storageClass });
    }
    const start = Number(token || 0); const pageSize = 4; const combined = [...[...prefixes].map(value => ({ kind: 'prefix' as const, value })), ...objects.map(value => ({ kind: 'object' as const, value }))];
    const page = combined.slice(start, start + pageSize);
    return { prefixes: page.filter(item => item.kind === 'prefix').map(item => item.value as string), objects: page.filter(item => item.kind === 'object').map(item => item.value as S3Object), nextToken: start + pageSize < combined.length ? String(start + pageSize) : undefined };
  }
  async upload(bucketName: string, key: string, file: File, onProgress: (fraction: number) => void): Promise<void> {
    const bucket = this.needBucket(bucketName); const body = file.slice();
    bucket.objects.set(key, { key, body, size: body.size, modified: new Date().toISOString(), etag: `demo-${body.size}`, contentType: file.type || 'application/octet-stream', metadata: {}, tags: {} }); onProgress(1);
  }
  async download(bucket: string, key: string): Promise<Blob> { return this.needObject(bucket, key).body.slice(); }
  async deleteObject(bucket: string, key: string): Promise<void> { this.needBucket(bucket).objects.delete(key); }
  async copyObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void> {
    if (sourceBucket === destinationBucket && sourceKey === destinationKey) throw new Error('Choose a different destination object.');
    const source = this.needObject(sourceBucket, sourceKey);
    const copy: DemoObject = {
      ...source, key: destinationKey, body: source.body.slice(), modified: new Date().toISOString(),
      metadata: { ...source.metadata }, tags: { ...source.tags }
    };
    this.needBucket(destinationBucket).objects.set(destinationKey, copy);
  }
  async moveObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void> {
    await this.copyObject(sourceBucket, sourceKey, destinationBucket, destinationKey);
    await this.deleteObject(sourceBucket, sourceKey);
  }
  async headObject(bucket: string, key: string): Promise<Record<string, string>> {
    const item = this.needObject(bucket, key); return { 'content-length': String(item.size), 'content-type': item.contentType, 'last-modified': item.modified || date, etag: item.etag || '', ...Object.fromEntries(Object.entries(item.metadata).map(([name, value]) => [`x-amz-meta-${name}`, value])) };
  }
  async replaceMetadata(bucket: string, key: string, metadata: Record<string, string>, contentType: string): Promise<void> { const item = this.needObject(bucket, key); item.metadata = { ...metadata }; item.contentType = contentType; }
  async getTags(bucket: string, key: string): Promise<Record<string, string>> { return { ...this.needObject(bucket, key).tags }; }
  async putTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> { this.needObject(bucket, key).tags = { ...tags }; }
  async getPolicy(bucket: string): Promise<string> { return this.needBucket(bucket).policy; }
  async putPolicy(bucket: string, policy: string): Promise<void> { this.needBucket(bucket).policy = policy; }
  async deletePolicy(bucket: string): Promise<void> { this.needBucket(bucket).policy = ''; }
  async getVersioning(bucket: string): Promise<'Enabled' | 'Suspended'> { return this.needBucket(bucket).versioning; }
  async putVersioning(bucket: string, status: 'Enabled' | 'Suspended'): Promise<void> { this.needBucket(bucket).versioning = status; }
  async getCors(bucket: string): Promise<CorsRule[]> { return structuredClone(this.needBucket(bucket).cors); }
  async putCors(bucket: string, rules: CorsRule[]): Promise<void> { this.needBucket(bucket).cors = structuredClone(rules); }
  async getLifecycle(bucket: string): Promise<LifecycleRule[]> { return structuredClone(this.needBucket(bucket).lifecycle); }
  async putLifecycle(bucket: string, rules: LifecycleRule[]): Promise<void> { this.needBucket(bucket).lifecycle = structuredClone(rules); }
  async presign(method: 'GET' | 'PUT', bucket: string, key: string, expires: number): Promise<string> {
    const url = new URL(`https://demo.invalid/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`);
    url.searchParams.set('demo-method', method); url.searchParams.set('X-Amz-Expires', String(expires)); url.searchParams.set('X-Amz-Signature', 'sample-only-not-a-real-credential'); return url.toString();
  }
  private needBucket(name: string): DemoBucket { const bucket = this.buckets.get(name); if (!bucket) throw new Error(`Sample bucket “${name}” was not found.`); return bucket; }
  private needObject(bucket: string, key: string): DemoObject { const item = this.needBucket(bucket).objects.get(key); if (!item) throw new Error(`Sample object “${key}” was not found.`); return item; }
}
