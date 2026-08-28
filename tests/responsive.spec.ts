import { expect, test } from 'playwright/test';

test('390px layouts do not overflow and visible controls meet touch targets', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-aisle']) {
    await page.goto(path); await expect(page.locator('body')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
    const undersized = await page.locator('a:visible, button:visible, input:visible:not(.sr-only), select:visible, summary:visible').evaluateAll(elements => elements.filter(element => {
      const box = element.getBoundingClientRect(); return box.width < 44 || box.height < 44;
    }).map(element => `${element.tagName}:${(element.textContent || (element as HTMLInputElement).name || '').trim().slice(0, 30)}:${Math.round(element.getBoundingClientRect().width)}x${Math.round(element.getBoundingClientRect().height)}`));
    expect(undersized).toEqual([]);
  }
});
