import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { S3Client, awsEncode, canonicalQuery, endpointDiagnostic, parseObjectVersions } from './s3';

it('@claim:connection-diagnostics blocks mixed content and explains browser-access failures', async () => {
  expect(endpointDiagnostic('http://storage.example.test', 'https:')).toContain('Browsers block HTTP');
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  const client = new S3Client({ endpoint: 'https://storage.example.test', region: 'us-east-1', accessKey: 'TEST', secretKey: 'secret', pathStyle: true });
  await expect(client.listBuckets()).rejects.toThrow('CORS rules allow this console');
  vi.unstubAllGlobals();
});

describe('AWS request encoding', () => {
  it('uses RFC 3986 encoding required by SigV4', () => {
    expect(awsEncode("a b/c!()*'")).toBe('a%20b%2Fc%21%28%29%2A%27');
  });

  it('sorts and encodes canonical query values', () => {
    const query = new URLSearchParams();
    query.append('prefix', 'a folder/'); query.append('max-keys', '250'); query.append('prefix', 'a');
    expect(canonicalQuery(query)).toBe('max-keys=250&prefix=a&prefix=a%20folder%2F');
  });
});

describe('presigned URLs', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(new Date('2026-08-27T12:00:00Z')));
  afterEach(() => vi.useRealTimers());

  it('creates a path-style URL without exposing the secret', async () => {
    const client = new S3Client({ endpoint: 'https://objects.example.test', region: 'us-east-1', accessKey: 'ACCESS', secretKey: 'do-not-leak', pathStyle: true });
    const result = new URL(await client.presign('GET', 'my-bucket', 'folder/hello world.txt', 3600));
    expect(result.pathname).toBe('/my-bucket/folder/hello%20world.txt');
    expect(result.searchParams.get('X-Amz-Expires')).toBe('3600');
    expect(result.searchParams.get('X-Amz-Credential')).toContain('ACCESS/20260827/us-east-1/s3/aws4_request');
    expect(result.toString()).not.toContain('do-not-leak');
    expect(result.searchParams.get('X-Amz-Signature')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('supports virtual-hosted addressing and temporary credentials', async () => {
    const client = new S3Client({ endpoint: 'https://s3.example.test', region: 'eu-west-1', accessKey: 'TEMP', secretKey: 'secret', sessionToken: 'token+/=', pathStyle: false });
    const result = new URL(await client.presign('PUT', 'archive', 'item.bin', 900));
    expect(result.hostname).toBe('archive.s3.example.test');
    expect(result.pathname).toBe('/item.bin');
    expect(result.searchParams.get('X-Amz-Security-Token')).toBe('token+/=');
  });
});

describe('version-aware bucket deletion', () => {
  const connection = { endpoint: 'https://minio.example.test', region: 'us-east-1', accessKey: 'MINIO', secretKey: 'miniosecret', pathStyle: true };

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date('2026-08-27T12:00:00Z'));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('parses MinIO ListObjectVersions pages including delete markers', () => {
    const page = parseObjectVersions(`<ListVersionsResult><Version><Key>archive&amp;one.txt</Key><VersionId>v1</VersionId></Version><DeleteMarker><Key>archive&amp;one.txt</Key><VersionId>d1</VersionId></DeleteMarker><NextKeyMarker>archive&amp;one.txt</NextKeyMarker><NextVersionIdMarker>d1</NextVersionIdMarker></ListVersionsResult>`);
    expect(page).toEqual({ versions: [
      { key: 'archive&one.txt', versionId: 'v1', deleteMarker: false },
      { key: 'archive&one.txt', versionId: 'd1', deleteMarker: true }
    ], nextKeyMarker: 'archive&one.txt', nextVersionIdMarker: 'd1' });
  });

  it('uses MinIO-compatible list-versions and multi-delete requests before deleting the bucket', async () => {
    const responses = [
      '<ListVersionsResult><Version><Key>first.txt</Key><VersionId>v1</VersionId></Version><DeleteMarker><Key>first.txt</Key><VersionId>d1</VersionId></DeleteMarker><NextKeyMarker>first.txt</NextKeyMarker><NextVersionIdMarker>d1</NextVersionIdMarker></ListVersionsResult>',
      '<ListVersionsResult><Version><Key>second.txt</Key><VersionId>v2</VersionId></Version></ListVersionsResult>',
      '<DeleteResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"/>',
      ''
    ];
    const calls: Array<{ url: RequestInfo | URL; options?: RequestInit }> = [];
    vi.stubGlobal('fetch', (url: RequestInfo | URL, options?: RequestInit) => {
      calls.push({ url, options });
      return Promise.resolve(new Response(responses.shift(), { status: 200 }));
    });
    const progress: Array<[string, number, number]> = [];

    await new S3Client(connection).deleteBucketWithVersions('versioned-bucket', state => progress.push([state.phase, state.discovered, state.deleted]));

    expect(calls).toHaveLength(4);
    const requests = calls.map(({ url, options }) => ({ url: new URL(String(url)), options: options! }));
    expect(requests[0].url.searchParams.get('versions')).toBe('');
    expect(requests[0].url.searchParams.get('max-keys')).toBe('1000');
    expect(requests[1].url.searchParams.get('key-marker')).toBe('first.txt');
    expect(requests[1].url.searchParams.get('version-id-marker')).toBe('d1');
    expect(requests[2].url.searchParams.get('delete')).toBe('');
    expect(String(requests[2].options.body)).toContain('<VersionId>v1</VersionId>');
    expect(String(requests[2].options.body)).toContain('<VersionId>d1</VersionId>');
    expect(String(requests[2].options.body)).toContain('<VersionId>v2</VersionId>');
    expect(requests[3].options.method).toBe('DELETE');
    expect(progress).toEqual([['listing', 2, 0], ['listing', 3, 0], ['deleting', 3, 3], ['bucket', 3, 3]]);
  });

  it('stops before bucket deletion when S3 reports a per-version delete error', async () => {
    const responses = [
      '<ListVersionsResult><DeleteMarker><Key>gone.txt</Key><VersionId>d1</VersionId></DeleteMarker></ListVersionsResult>',
      '<DeleteResult><Error><Key>gone.txt</Key><Code>AccessDenied</Code><Message>denied by policy</Message></Error></DeleteResult>'
    ];
    const calls: Array<{ url: RequestInfo | URL; options?: RequestInit }> = [];
    vi.stubGlobal('fetch', (url: RequestInfo | URL, options?: RequestInit) => {
      calls.push({ url, options });
      return Promise.resolve(new Response(responses.shift(), { status: 200 }));
    });

    await expect(new S3Client(connection).deleteBucketWithVersions('versioned-bucket')).rejects.toThrow('AccessDenied: denied by policy');
    expect(calls).toHaveLength(2);
    expect(calls[1].options?.method).toBe('POST');
  });
});
