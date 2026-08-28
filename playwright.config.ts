import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', testMatch: /responsive\.spec\.ts/, use: { ...devices['iPhone 13'], browserName: 'chromium' } }
  ],
  webServer: { command: 'npm run build && npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: false }
});
