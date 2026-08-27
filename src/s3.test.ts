import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { S3Client, awsEncode, canonicalQuery } from './s3';

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
