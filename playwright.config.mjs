import { defineConfig, devices } from '@playwright/test';

const localEnv = { APP_ENV: 'development', NODE_ENV: 'development', MOCK_AUTH: 'false' };

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'chromium-narrow',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: [
    {
      command: 'node apps/api/dist/dev.js',
      url: 'http://127.0.0.1:8787/health',
      env: localEnv,
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'pnpm --filter @finpath/web preview',
      url: 'http://127.0.0.1:4173',
      env: localEnv,
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
