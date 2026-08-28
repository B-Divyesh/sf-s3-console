export interface Connection {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
  pathStyle: boolean;
}

export interface Bucket { name: string; created?: string }
export interface S3Object { key: string; size: number; modified?: string; etag?: string; storageClass?: string }
export interface ObjectPage { objects: S3Object[]; prefixes: string[]; nextToken?: string }
export interface ObjectVersion { key: string; versionId: string; deleteMarker: boolean }
export interface ObjectVersionPage { versions: ObjectVersion[]; nextKeyMarker?: string; nextVersionIdMarker?: string }
export interface BucketDeleteProgress { phase: 'listing' | 'deleting' | 'bucket'; discovered: number; deleted: number }
export interface CorsRule { id?: string; origins: string[]; methods: string[]; headers?: string[]; exposeHeaders?: string[]; maxAgeSeconds?: number }
export interface LifecycleRule { id: string; status: 'Enabled' | 'Disabled'; prefix: string; expirationDays?: number; noncurrentDays?: number }

/** Every HTTP method the browser client can send to an object store. */
export const S3_HTTP_METHODS = ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'] as const;
export type S3HttpMethod = typeof S3_HTTP_METHODS[number];

export function endpointDiagnostic(endpoint: string, pageProtocol: string): string | undefined {
  let url: URL;
  try { url = new URL(endpoint); } catch { return 'Enter a complete storage endpoint URL, including https://.'; }
  if (!['http:', 'https:'].includes(url.protocol)) return 'Use an HTTP or HTTPS storage endpoint.';
  if (pageProtocol === 'https:' && url.protocol === 'http:') return 'Browsers block HTTP storage endpoints from an HTTPS page. Use HTTPS for your object store.';
  return undefined;
}

const encoder = new TextEncoder();

export function awsEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function canonicalQuery(params: URLSearchParams): string {
  return [...params.entries()]
    .sort(([ak, av], [bk, bv]) => ak === bk ? av.localeCompare(bv) : ak.localeCompare(bk))
    .map(([key, value]) => `${awsEncode(key)}=${awsEncode(value)}`).join('&');
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(data: string | ArrayBuffer): Promise<ArrayBuffer> {
  const source = typeof data === 'string' ? encoder.encode(data).buffer as ArrayBuffer : data;
  return crypto.subtle.digest('SHA-256', source);
}

async function hmac(key: ArrayBuffer, value: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value));
}

export function parseError(xml: string, status: number): string {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const message = doc.getElementsByTagName('Message')[0]?.textContent;
    const code = doc.getElementsByTagName('Code')[0]?.textContent;
    if (message) return `${code ? `${code}: ` : ''}${message}`;
  }
  return xml.trim().slice(0, 240) || `S3 request failed (${status})`;
}

function xmlText(node: ParentNode, name: string): string | undefined {
  return (node as Element).getElementsByTagName(name)[0]?.textContent ?? undefined;
}

function decodeXml(value: string): string {
  return value.replace(/&(amp|lt|gt|apos|quot);/g, (_match, entity: string) => ({ amp: '&', lt: '<', gt: '>', apos: "'", quot: '"' })[entity]!);
}

function xmlBlocks(xml: string, name: string): string[] {
  return [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'g'))].map(match => match[1]);
}

function xmlTextFromString(xml: string, name: string): string | undefined {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`).exec(xml);
  return match ? decodeXml(match[1].trim()) : undefined;
}

/** Parse the standard ListObjectVersions response. The fallback keeps protocol tests runnable in Node. */
export function parseObjectVersions(xml: string): ObjectVersionPage {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const parse = (name: string, deleteMarker: boolean) => [...doc.getElementsByTagName(name)].map(node => ({
      key: xmlText(node, 'Key') || '', versionId: xmlText(node, 'VersionId') || '', deleteMarker
    })).filter(version => version.key && version.versionId);
    return {
      versions: [...parse('Version', false), ...parse('DeleteMarker', true)],
      nextKeyMarker: xmlText(doc, 'NextKeyMarker'), nextVersionIdMarker: xmlText(doc, 'NextVersionIdMarker')
    };
  }
  const parse = (name: string, deleteMarker: boolean) => xmlBlocks(xml, name).map(block => ({
    key: xmlTextFromString(block, 'Key') || '', versionId: xmlTextFromString(block, 'VersionId') || '', deleteMarker
  })).filter(version => version.key && version.versionId);
  return {
    versions: [...parse('Version', false), ...parse('DeleteMarker', true)],
    nextKeyMarker: xmlTextFromString(xml, 'NextKeyMarker'), nextVersionIdMarker: xmlTextFromString(xml, 'NextVersionIdMarker')
  };
}

function deleteResultError(xml: string): string | undefined {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const error = doc.getElementsByTagName('Error')[0];
    if (error) return `${xmlText(error, 'Code') || 'Delete failed'}: ${xmlText(error, 'Message') || xmlText(error, 'Key') || 'S3 rejected an object version.'}`;
    return undefined;
  }
  const error = xmlBlocks(xml, 'Error')[0];
  return error ? `${xmlTextFromString(error, 'Code') || 'Delete failed'}: ${xmlTextFromString(error, 'Message') || xmlTextFromString(error, 'Key') || 'S3 rejected an object version.'}` : undefined;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!);
}

async function checksumHeaders(body: string, contentType = 'application/xml'): Promise<Record<string, string>> {
  const bytes = new Uint8Array(await sha256(body));
  const binary = [...bytes].map(byte => String.fromCharCode(byte)).join('');
  return { 'content-type': contentType, 'x-amz-sdk-checksum-algorithm': 'SHA256', 'x-amz-checksum-sha256': btoa(binary) };
}

export class S3Client {
  constructor(readonly connection: Connection) {}

  private url(bucket = '', key = '', params: Record<string, string> = {}): URL {
    const base = new URL(this.connection.endpoint.replace(/\/+$/, '') + '/');
    if (bucket && !this.connection.pathStyle) base.hostname = `${bucket}.${base.hostname}`;
    const parts = [this.connection.pathStyle && bucket ? bucket : '', key].filter(Boolean);
    base.pathname = '/' + parts.map(part => part.split('/').map(awsEncode).join('/')).join('/');
    Object.entries(params).forEach(([name, value]) => base.searchParams.set(name, value));
    return base;
  }

  private async signedFetch(method: S3HttpMethod, bucket = '', key = '', params: Record<string, string> = {}, body?: BodyInit | null, headers: Record<string, string> = {}): Promise<Response> {
    const url = this.url(bucket, key, params);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const shortDate = amzDate.slice(0, 8);
    const rawBody = body instanceof Blob ? await body.arrayBuffer() : typeof body === 'string' ? encoder.encode(body).buffer : new ArrayBuffer(0);
    const payloadHash = hex(await sha256(rawBody));
    const signed: Record<string, string> = {
      host: url.host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      ...Object.fromEntries(Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value.trim()]))
    };
    if (this.connection.sessionToken) signed['x-amz-security-token'] = this.connection.sessionToken;
    const signedNames = Object.keys(signed).sort();
    const canonicalHeaders = signedNames.map(name => `${name}:${signed[name]}\n`).join('');
    const canonical = [method, url.pathname, canonicalQuery(url.searchParams), canonicalHeaders, signedNames.join(';'), payloadHash].join('\n');
    const scope = `${shortDate}/${this.connection.region}/s3/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${hex(await sha256(canonical))}`;
    let signingKey = await hmac(encoder.encode(`AWS4${this.connection.secretKey}`).buffer as ArrayBuffer, shortDate);
    signingKey = await hmac(signingKey, this.connection.region);
    signingKey = await hmac(signingKey, 's3');
    signingKey = await hmac(signingKey, 'aws4_request');
    const signature = hex(await hmac(signingKey, stringToSign));
    const auth = `AWS4-HMAC-SHA256 Credential=${this.connection.accessKey}/${scope}, SignedHeaders=${signedNames.join(';')}, Signature=${signature}`;
    const outgoing = new Headers(headers);
    Object.entries(signed).forEach(([name, value]) => { if (name !== 'host') outgoing.set(name, value); });
    outgoing.set('Authorization', auth);
    let response: Response;
    try {
      response = await fetch(url, { method, headers: outgoing, body, mode: 'cors' });
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Network request failed';
      throw new Error(`${detail}. Check that the endpoint is reachable and its CORS rules allow this console.`);
    }
    if (!response.ok) throw new Error(parseError(await response.text(), response.status));
    return response;
  }

  async listBuckets(): Promise<Bucket[]> {
    const text = await (await this.signedFetch('GET')).text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    return [...doc.getElementsByTagName('Bucket')].map(node => ({ name: xmlText(node, 'Name') || '', created: xmlText(node, 'CreationDate') }));
  }

  async createBucket(name: string): Promise<void> {
    const body = this.connection.region === 'us-east-1' ? '' : `<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LocationConstraint>${escapeXml(this.connection.region)}</LocationConstraint></CreateBucketConfiguration>`;
    await this.signedFetch('PUT', name, '', {}, body, body ? { 'content-type': 'application/xml' } : {});
  }

  async deleteBucket(name: string): Promise<void> { await this.signedFetch('DELETE', name); }

  async listObjectVersions(bucket: string, keyMarker?: string, versionIdMarker?: string): Promise<ObjectVersionPage> {
    const params: Record<string, string> = { versions: '', 'max-keys': '1000' };
    if (keyMarker) params['key-marker'] = keyMarker;
    if (versionIdMarker) params['version-id-marker'] = versionIdMarker;
    return parseObjectVersions(await (await this.signedFetch('GET', bucket, '', params)).text());
  }

  async deleteObjectVersions(bucket: string, versions: ObjectVersion[]): Promise<void> {
    if (!versions.length) return;
    const body = `<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Quiet>true</Quiet>${versions.map(version => `<Object><Key>${escapeXml(version.key)}</Key><VersionId>${escapeXml(version.versionId)}</VersionId></Object>`).join('')}</Delete>`;
    const response = await this.signedFetch('POST', bucket, '', { delete: '' }, body, await checksumHeaders(body));
    const error = deleteResultError(await response.text());
    if (error) throw new Error(error);
  }

  /**
   * Deletes every listed version and delete marker before deleting the bucket.
   * All pages are enumerated before deletion so S3 continuation markers cannot
   * skip entries when a previous page is removed.
   */
  async deleteBucketWithVersions(bucket: string, onProgress?: (progress: BucketDeleteProgress) => void): Promise<void> {
    const versions: ObjectVersion[] = [];
    let keyMarker: string | undefined;
    let versionIdMarker: string | undefined;
    do {
      const page = await this.listObjectVersions(bucket, keyMarker, versionIdMarker);
      versions.push(...page.versions);
      onProgress?.({ phase: 'listing', discovered: versions.length, deleted: 0 });
      keyMarker = page.nextKeyMarker;
      versionIdMarker = page.nextVersionIdMarker;
    } while (keyMarker || versionIdMarker);

    let deleted = 0;
    for (let start = 0; start < versions.length; start += 1000) {
      const batch = versions.slice(start, start + 1000);
      await this.deleteObjectVersions(bucket, batch);
      deleted += batch.length;
      onProgress?.({ phase: 'deleting', discovered: versions.length, deleted });
    }
    onProgress?.({ phase: 'bucket', discovered: versions.length, deleted });
    await this.deleteBucket(bucket);
  }

  async listObjects(bucket: string, prefix = '', delimiter = '/', token?: string): Promise<ObjectPage> {
    const params: Record<string, string> = { 'list-type': '2', prefix, delimiter, 'max-keys': '250' };
    if (token) params['continuation-token'] = token;
    const text = await (await this.signedFetch('GET', bucket, '', params)).text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const objects = [...doc.getElementsByTagName('Contents')].map(node => ({
      key: xmlText(node, 'Key') || '', size: Number(xmlText(node, 'Size') || 0), modified: xmlText(node, 'LastModified'),
      etag: xmlText(node, 'ETag')?.replaceAll('"', ''), storageClass: xmlText(node, 'StorageClass')
    })).filter(object => object.key !== prefix && !(object.key.endsWith('/') && object.size === 0));
    const prefixes = [...doc.getElementsByTagName('CommonPrefixes')].map(node => xmlText(node, 'Prefix') || '').filter(Boolean);
    return { objects, prefixes, nextToken: xmlText(doc, 'NextContinuationToken') };
  }

  async upload(bucket: string, key: string, file: File, onProgress: (fraction: number) => void): Promise<void> {
    const partSize = 8 * 1024 * 1024;
    if (file.size <= partSize) {
      await this.signedFetch('PUT', bucket, key, {}, file, { 'content-type': file.type || 'application/octet-stream' });
      onProgress(1); return;
    }
    const init = await (await this.signedFetch('POST', bucket, key, { uploads: '' }, '', { 'content-type': file.type || 'application/octet-stream' })).text();
    const uploadId = typeof DOMParser !== 'undefined'
      ? xmlText(new DOMParser().parseFromString(init, 'application/xml'), 'UploadId')
      : xmlTextFromString(init, 'UploadId');
    if (!uploadId) throw new Error('The store did not return a multipart upload ID.');
    const parts: Array<{ number: number; etag: string }> = [];
    try {
      for (let offset = 0, number = 1; offset < file.size; offset += partSize, number++) {
        const chunk = file.slice(offset, offset + partSize);
        const response = await this.signedFetch('PUT', bucket, key, { partNumber: String(number), uploadId }, chunk);
        const etag = response.headers.get('etag')?.replaceAll('"', '');
        if (!etag) throw new Error('The store did not expose the ETag header. Add ETag to CORS ExposeHeaders.');
        parts.push({ number, etag }); onProgress(Math.min(0.98, (offset + chunk.size) / file.size));
      }
      const complete = `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${parts.map(part => `<Part><PartNumber>${part.number}</PartNumber><ETag>"${escapeXml(part.etag)}"</ETag></Part>`).join('')}</CompleteMultipartUpload>`;
      await this.signedFetch('POST', bucket, key, { uploadId }, complete, { 'content-type': 'application/xml' });
      onProgress(1);
    } catch (error) {
      await this.signedFetch('DELETE', bucket, key, { uploadId }).catch(() => undefined);
      throw error;
    }
  }

  async download(bucket: string, key: string): Promise<Blob> { return (await this.signedFetch('GET', bucket, key)).blob(); }
  async deleteObject(bucket: string, key: string): Promise<void> { await this.signedFetch('DELETE', bucket, key); }

  async copyObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void> {
    if (sourceBucket === destinationBucket && sourceKey === destinationKey) throw new Error('Choose a different destination object.');
    const source = `/${awsEncode(sourceBucket)}/${sourceKey.split('/').map(awsEncode).join('/')}`;
    await this.signedFetch('PUT', destinationBucket, destinationKey, {}, '', {
      'x-amz-copy-source': source, 'x-amz-metadata-directive': 'COPY', 'x-amz-tagging-directive': 'COPY'
    });
  }

  /** A source is deleted only after S3 acknowledges the destination copy. */
  async moveObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void> {
    await this.copyObject(sourceBucket, sourceKey, destinationBucket, destinationKey);
    await this.deleteObject(sourceBucket, sourceKey);
  }

  async headObject(bucket: string, key: string): Promise<Record<string, string>> {
    const headers = (await this.signedFetch('HEAD', bucket, key)).headers;
    return Object.fromEntries([...headers.entries()].filter(([name]) => name.startsWith('x-amz-meta-') || ['content-type', 'content-length', 'etag', 'last-modified'].includes(name)));
  }

  async replaceMetadata(bucket: string, key: string, metadata: Record<string, string>, contentType: string): Promise<void> {
    const source = `/${bucket}/${key.split('/').map(awsEncode).join('/')}`;
    const headers: Record<string, string> = { 'x-amz-copy-source': source, 'x-amz-metadata-directive': 'REPLACE', 'content-type': contentType };
    Object.entries(metadata).forEach(([name, value]) => { headers[`x-amz-meta-${name.toLowerCase()}`] = value; });
    await this.signedFetch('PUT', bucket, key, {}, '', headers);
  }

  async getTags(bucket: string, key: string): Promise<Record<string, string>> {
    const text = await (await this.signedFetch('GET', bucket, key, { tagging: '' })).text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    return Object.fromEntries([...doc.getElementsByTagName('Tag')].map(tag => [xmlText(tag, 'Key') || '', xmlText(tag, 'Value') || '']));
  }

  async putTags(bucket: string, key: string, tags: Record<string, string>): Promise<void> {
    const body = `<Tagging xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><TagSet>${Object.entries(tags).map(([key, value]) => `<Tag><Key>${escapeXml(key)}</Key><Value>${escapeXml(value)}</Value></Tag>`).join('')}</TagSet></Tagging>`;
    await this.signedFetch('PUT', bucket, key, { tagging: '' }, body, await checksumHeaders(body));
  }

  async getPolicy(bucket: string): Promise<string> {
    try { return await (await this.signedFetch('GET', bucket, '', { policy: '' })).text(); }
    catch (error) { if (error instanceof Error && /NoSuchBucketPolicy/i.test(error.message)) return ''; throw error; }
  }
  async putPolicy(bucket: string, policy: string): Promise<void> { await this.signedFetch('PUT', bucket, '', { policy: '' }, policy, await checksumHeaders(policy, 'application/json')); }
  async deletePolicy(bucket: string): Promise<void> { await this.signedFetch('DELETE', bucket, '', { policy: '' }); }

  async getVersioning(bucket: string): Promise<'Enabled' | 'Suspended'> {
    const text = await (await this.signedFetch('GET', bucket, '', { versioning: '' })).text();
    return /<Status>Enabled<\/Status>/.test(text) ? 'Enabled' : 'Suspended';
  }
  async putVersioning(bucket: string, status: 'Enabled' | 'Suspended'): Promise<void> {
    const body = `<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Status>${status}</Status></VersioningConfiguration>`;
    await this.signedFetch('PUT', bucket, '', { versioning: '' }, body, await checksumHeaders(body));
  }

  async getCors(bucket: string): Promise<CorsRule[]> {
    try {
      const text = await (await this.signedFetch('GET', bucket, '', { cors: '' })).text();
      const doc = new DOMParser().parseFromString(text, 'application/xml');
      return [...doc.getElementsByTagName('CORSRule')].map(rule => ({
        id: xmlText(rule, 'ID'), origins: [...rule.getElementsByTagName('AllowedOrigin')].map(n => n.textContent || ''),
        methods: [...rule.getElementsByTagName('AllowedMethod')].map(n => n.textContent || ''), headers: [...rule.getElementsByTagName('AllowedHeader')].map(n => n.textContent || ''),
        exposeHeaders: [...rule.getElementsByTagName('ExposeHeader')].map(n => n.textContent || ''), maxAgeSeconds: Number(xmlText(rule, 'MaxAgeSeconds')) || undefined
      }));
    } catch (error) { if (error instanceof Error && /NoSuchCORSConfiguration/i.test(error.message)) return []; throw error; }
  }
  async putCors(bucket: string, rules: CorsRule[]): Promise<void> {
    const body = `<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${rules.map(rule => `<CORSRule>${rule.id ? `<ID>${escapeXml(rule.id)}</ID>` : ''}${rule.origins.map(v => `<AllowedOrigin>${escapeXml(v)}</AllowedOrigin>`).join('')}${rule.methods.map(v => `<AllowedMethod>${escapeXml(v)}</AllowedMethod>`).join('')}${(rule.headers || []).map(v => `<AllowedHeader>${escapeXml(v)}</AllowedHeader>`).join('')}${(rule.exposeHeaders || []).map(v => `<ExposeHeader>${escapeXml(v)}</ExposeHeader>`).join('')}${rule.maxAgeSeconds ? `<MaxAgeSeconds>${rule.maxAgeSeconds}</MaxAgeSeconds>` : ''}</CORSRule>`).join('')}</CORSConfiguration>`;
    await this.signedFetch('PUT', bucket, '', { cors: '' }, body, await checksumHeaders(body));
  }

  async getLifecycle(bucket: string): Promise<LifecycleRule[]> {
    try {
      const text = await (await this.signedFetch('GET', bucket, '', { lifecycle: '' })).text();
      const doc = new DOMParser().parseFromString(text, 'application/xml');
      return [...doc.getElementsByTagName('Rule')].map((rule, index) => ({ id: xmlText(rule, 'ID') || `rule-${index + 1}`, status: xmlText(rule, 'Status') === 'Enabled' ? 'Enabled' : 'Disabled', prefix: xmlText(rule, 'Prefix') || '', expirationDays: Number(xmlText(rule.getElementsByTagName('Expiration')[0] || rule, 'Days')) || undefined, noncurrentDays: Number(xmlText(rule.getElementsByTagName('NoncurrentVersionExpiration')[0] || rule, 'NoncurrentDays')) || undefined }));
    } catch (error) { if (error instanceof Error && /NoSuchLifecycleConfiguration/i.test(error.message)) return []; throw error; }
  }
  async putLifecycle(bucket: string, rules: LifecycleRule[]): Promise<void> {
    const body = `<LifecycleConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${rules.map(rule => `<Rule><ID>${escapeXml(rule.id)}</ID><Filter><Prefix>${escapeXml(rule.prefix)}</Prefix></Filter><Status>${rule.status}</Status>${rule.expirationDays ? `<Expiration><Days>${rule.expirationDays}</Days></Expiration>` : ''}${rule.noncurrentDays ? `<NoncurrentVersionExpiration><NoncurrentDays>${rule.noncurrentDays}</NoncurrentDays></NoncurrentVersionExpiration>` : ''}</Rule>`).join('')}</LifecycleConfiguration>`;
    await this.signedFetch('PUT', bucket, '', { lifecycle: '' }, body, await checksumHeaders(body));
  }

  async presign(method: 'GET' | 'PUT', bucket: string, key: string, expires: number): Promise<string> {
    const url = this.url(bucket, key);
    const now = new Date(); const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); const shortDate = amzDate.slice(0, 8);
    const scope = `${shortDate}/${this.connection.region}/s3/aws4_request`;
    url.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
    url.searchParams.set('X-Amz-Credential', `${this.connection.accessKey}/${scope}`);
    url.searchParams.set('X-Amz-Date', amzDate); url.searchParams.set('X-Amz-Expires', String(expires)); url.searchParams.set('X-Amz-SignedHeaders', 'host');
    if (this.connection.sessionToken) url.searchParams.set('X-Amz-Security-Token', this.connection.sessionToken);
    const canonical = [method, url.pathname, canonicalQuery(url.searchParams), `host:${url.host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${hex(await sha256(canonical))}`;
    let keyBytes = await hmac(encoder.encode(`AWS4${this.connection.secretKey}`).buffer as ArrayBuffer, shortDate); keyBytes = await hmac(keyBytes, this.connection.region); keyBytes = await hmac(keyBytes, 's3'); keyBytes = await hmac(keyBytes, 'aws4_request');
    url.searchParams.set('X-Amz-Signature', hex(await hmac(keyBytes, stringToSign)));
    return url.toString();
  }
}
