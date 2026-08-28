import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

test('first screen states the job, audience, action, and facts on phone and desktop', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport); await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Manage S3-compatible storage/ })).toBeVisible();
    await expect(page.getByText(/self-hosters and small ops teams/)).toBeVisible();
    const action = page.getByRole('link', { name: 'Try it with sample data' }); await expect(action).toBeVisible();
    expect((await action.boundingBox())!.y + (await action.boundingBox())!.height).toBeLessThan(viewport.height);
    await expect(page.getByText('Opens a disposable storage workspace.')).toBeVisible();
    for (const fact of ['Free to use', 'The sample workspace reloads offline after one visit', 'Your secret key is not sent in storage requests']) {
      const item = page.getByText(fact, { exact: true });
      await expect(item).toBeVisible();
      const box = await item.boundingBox();
      expect(box!.y + box!.height).toBeLessThan(viewport.height);
    }
    if (viewport.width === 390) {
      const caption = await page.getByText('Opens a disposable storage workspace.').boundingBox();
      const realConnect = await page.getByRole('link', { name: 'Connect your object store' }).boundingBox();
      expect(caption!.y).toBeLessThan(realConnect!.y);
    }
  }
});

test('workflow headings identify their task without nearby copy', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Connect an object store', 'Browse buckets and objects', 'Upload files and edit settings']) {
    await expect(page.getByRole('heading', { level: 3, name })).toBeVisible();
  }
});

test('routes update title, metadata, focus, history, and 404 state', async ({ page }) => {
  await page.goto('/'); await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveTitle('Privacy — S3 Console'); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/privacy$/);
  await expect(page.locator(':focus')).toHaveText('How your storage data is handled');
  await expect(page.locator('#route-status')).toHaveText('How your storage data is handled');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goBack(); await expect(page).toHaveTitle('S3 Console — manage S3-compatible storage'); await expect(page.locator(':focus')).toHaveText(/Manage S3-compatible storage/);
  await expect(page.locator('#route-status')).toContainText('Manage S3-compatible storage');
  await page.goto('/missing-aisle'); await expect(page).toHaveTitle('Page not found — S3 Console'); await expect(page.getByRole('heading', { level: 1 })).toHaveText('This storage aisle does not exist');
});

test('every route keeps the shared navigation, footer, and route metadata', async ({ page }) => {
  for (const [path, title, canonical] of [['/', 'S3 Console — manage S3-compatible storage', '/'], ['/demo', 'Demo — S3 Console', '/demo'], ['/?demo=1', 'Demo — S3 Console', '/demo'], ['/privacy', 'Privacy — S3 Console', '/privacy'], ['/terms', 'Terms — S3 Console', '/terms'], ['/missing-aisle', 'Page not found — S3 Console', '/404']]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    expect(title.length).toBeLessThanOrEqual(60);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    expect((await page.locator('meta[name="description"]').getAttribute('content'))!.length).toBeLessThanOrEqual(155);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://s3-console.sociobot.in${canonical}`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://s3-console.sociobot.in${canonical}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/assets\/social-preview\.png$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Home' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Demo' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy' }).first()).toBeVisible();
    await expect(page.getByRole('contentinfo').getByText(/v1\.0\.0 · polish-5/)).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toBeVisible();
  }
});

test('390px console header keeps bucket control and route menu separate and keyboard-operable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const bucketControl = page.getByRole('button', { name: 'Show buckets' });
  await expect(bucketControl).toBeVisible();
  const menu = page.locator('#site-menu-toggle');
  await expect(menu).toBeVisible();
  const menuBox = await menu.boundingBox();
  expect(menuBox!.width).toBeGreaterThanOrEqual(44); expect(menuBox!.height).toBeGreaterThanOrEqual(44);
  await expect(menu).toHaveAccessibleName('Open navigation menu');
  await menu.focus(); await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Console links' })).toBeVisible();
  for (const name of ['Home', 'Demo', 'Privacy']) {
    const link = page.getByRole('navigation', { name: 'Console links' }).getByRole('link', { name });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(await link.evaluate(element => document.elementFromPoint(element.getBoundingClientRect().x + 12, element.getBoundingClientRect().y + 12)?.closest('a') === element)).toBeTruthy();
  }
  await expect(page.locator(':focus')).toHaveText('Home');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false'); await expect(menu).toHaveAccessibleName('Open navigation menu'); await expect(menu).toBeFocused();
  await bucketControl.click(); await expect(page.locator('#bucket-rail')).toHaveClass(/open/);
});

test('home, demo, privacy, terms, and 404 have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-aisle']) {
    await page.goto(path); await expect(page.locator('main h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  }
});

test('keyboard reaches and activates the sample workspace', async ({ page }) => {
  await page.goto('/'); await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.getByRole('link', { name: 'Try it with sample data' }).focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/); await expect(page.locator(':focus')).toHaveText('media-archive');
});
