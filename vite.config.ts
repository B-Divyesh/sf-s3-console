import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function precachedServiceWorker(): Plugin {
  return {
    name: 's3-console-precache-service-worker',
    apply: 'build',
    writeBundle(options, bundle) {
      const assets = Object.keys(bundle)
        .filter(file => file.startsWith('assets/') && /\.(?:js|css)$/.test(file))
        .map(file => `/${file}`);
      const source = readFileSync(resolve(import.meta.dirname, 'public/sw.js'), 'utf8')
        .replace(/const SHELL = \[[^\n]*\];/, `const SHELL = ${JSON.stringify(['/', '/demo', '/privacy', '/terms', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/apple-touch-icon.png', ...assets])};`);
      writeFileSync(resolve(options.dir!, 'sw.js'), source);
    }
  };
}

export default defineConfig({
  plugins: [precachedServiceWorker()],
  build: { target: 'es2022', cssCodeSplit: false },
  test: { environment: 'node', include: ['src/**/*.test.ts'] }
});
