import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

describe('published product contract', () => {
  it('@claim:open-source publishes the MIT license and source link', () => {
    expect(readFileSync(resolve(root, 'LICENSE'), 'utf8')).toContain('MIT License');
    expect(readFileSync(resolve(root, 'src/main.ts'), 'utf8')).toContain('https://github.com/B-Divyesh/sf-s3-console');
  });

  it('@claim:build-output writes the static entry point and deployment configuration', () => {
    expect(existsSync(resolve(root, 'dist/index.html'))).toBe(true);
    expect(existsSync(resolve(root, 'dist/staticwebapp.config.json'))).toBe(true);
  });

  it('@claim:artwork-provenance records the generated source and publishes its disclosure', () => {
    expect(readFileSync(resolve(root, '.factory/design.md'), 'utf8')).toContain('Generated with Azure OpenAI');
    expect(existsSync(resolve(root, 'assets/src/storage-workbench.png'))).toBe(true);
    expect(readFileSync(resolve(root, 'src/main.ts'), 'utf8')).toContain('Artwork provenance');
  });
});
