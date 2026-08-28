import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

test('first screen states the job, audience, action, and facts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Manage S3-compatible storage/ })).toBeVisible();
  await expect(page.getByText(/self-hosters and small ops teams/)).toBeVisible();
  const action = page.getByRole('link', { name: 'Try it with sample data' }); await expect(action).toBeVisible();
  expect((await action.boundingBox())!.y + (await action.boundingBox())!.height).toBeLessThan(844);
  await expect(page.getByText('Opens a disposable storage workspace.')).toBeVisible();
  for (const fact of ['Free and open source', 'Credentials stay in your browser', 'Your endpoint must allow browser requests']) {
    await expect(page.getByText(fact)).toBeVisible();
  }
});

test('routes update title, metadata, focus, history, and 404 state', async ({ page }) => {
  await page.goto('/'); await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveTitle('Privacy — S3 Console'); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/privacy$/);
  await expect(page.locator(':focus')).toHaveText('How your storage data is handled');
  await page.goBack(); await expect(page).toHaveTitle('S3 Console — manage S3-compatible storage'); await expect(page.locator(':focus')).toHaveText(/Manage S3-compatible storage/);
  await page.goto('/missing-aisle'); await expect(page).toHaveTitle('Page not found — S3 Console'); await expect(page.getByRole('heading', { level: 1 })).toHaveText('This storage aisle does not exist');
});

test('every route keeps the shared navigation, footer, and route metadata', async ({ page }) => {
  for (const [path, title] of [['/', 'S3 Console — manage S3-compatible storage'], ['/demo', 'Demo — S3 Console'], ['/privacy', 'Privacy — S3 Console'], ['/terms', 'Terms — S3 Console'], ['/missing-aisle', 'Page not found — S3 Console']]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /.+/);
    await expect(page.getByRole('link', { name: 'Home' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Demo' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy' }).first()).toBeVisible();
    await expect(page.getByRole('contentinfo').getByText(/v1\.0\.0 · polish-1/)).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toBeVisible();
  }
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
