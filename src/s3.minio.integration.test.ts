import { describe, expect, it } from 'vitest';
import { S3Client } from './s3';

const endpoint = process.env.MINIO_ENDPOINT;
const runMinio = endpoint ? describe : describe.skip;

runMinio('MinIO RELEASE.2025-09-07 versioned bucket deletion', () => {
  it('removes old versions and delete markers before deleting the bucket', async () => {
    const client = new S3Client({
      endpoint: endpoint!, region: process.env.MINIO_REGION || 'us-east-1',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin', secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin', pathStyle: true
    });
    const bucket = `s3-console-versions-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      await client.createBucket(bucket);
      await client.putVersioning(bucket, 'Enabled');
      await client.upload(bucket, 'history.txt', new File(['first version'], 'history.txt', { type: 'text/plain' }), () => undefined);
      await client.upload(bucket, 'history.txt', new File(['second version'], 'history.txt', { type: 'text/plain' }), () => undefined);
      await client.deleteObject(bucket, 'history.txt');

      const before = await client.listObjectVersions(bucket);
      expect(before.versions.some(version => version.deleteMarker)).toBe(true);
      expect(before.versions.filter(version => !version.deleteMarker)).toHaveLength(2);
      await client.deleteBucketWithVersions(bucket);
    } finally {
      // The successful path has already removed the bucket. Leave a failed test
      // recoverable for a local MinIO operator without hiding the original error.
      await client.deleteBucketWithVersions(bucket).catch(() => undefined);
    }
  });
});
