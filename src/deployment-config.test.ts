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

describe('host-served static 404 contract', () => {
  it('maps excluded missing assets to the complete noindex 404 document', () => {
    const config = JSON.parse(readFileSync(resolve(root, 'public/staticwebapp.config.json'), 'utf8')) as { responseOverrides: Record<string, { rewrite: string; statusCode: number }>; navigationFallback: { exclude: string[] } };
    const page = readFileSync(resolve(root, 'public/404.html'), 'utf8');
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
    expect(config.navigationFallback.exclude.some(item => item.includes('/assets/'))).toBe(true);
    for (const required of [
      '<html lang="en">', '<meta name="robots" content="noindex">', '<meta name="description"', '<link rel="canonical"',
      '<meta property="og:title"', '<meta name="twitter:card"', '<link rel="apple-touch-icon"',
      '<nav aria-label="Main navigation">', 'Built by Param Factory', 'Build v1.0.0 · polish-3'
    ]) expect(page).toContain(required);
    expect(page.match(/<main\b/g)).toHaveLength(1);
    expect(page.match(/<h1\b/g)).toHaveLength(1);
    expect(page).toContain('<a href="/privacy">Privacy</a>');
    expect(page).toContain('<a href="/terms">Terms</a>');
  });
});
