import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const revalidate = 'no-cache, max-age=0, must-revalidate';
const immutable = 'public, max-age=31536000, immutable';

describe('static deployment cache policy', () => {
  it('keeps the shell and service worker revalidating while fingerprinted assets are immutable', () => {
    const config = JSON.parse(readFileSync(resolve(root, 'public/staticwebapp.config.json'), 'utf8')) as {
      globalHeaders: Record<string, string>;
      routes: Array<{ route: string; headers: Record<string, string> }>;
    };
    const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8');
    const nginx = readFileSync(resolve(root, 'nginx.conf'), 'utf8');

    expect(config.globalHeaders['cache-control']).toBe(revalidate);
    expect(config.routes.find(route => route.route === '/assets/*')?.headers['cache-control']).toBe(immutable);
    expect(config.routes.find(route => route.route === '/sw.js')?.headers['cache-control']).toBe(revalidate);
    expect(headers).toContain(`/*\n  Cache-Control: ${revalidate}`);
    expect(headers).toContain(`/assets/*\n  Cache-Control: ${immutable}`);
    expect(nginx).toContain(`Cache-Control "${immutable}"`);
    expect(nginx).toContain(`Cache-Control "${revalidate}"`);
  });
});
