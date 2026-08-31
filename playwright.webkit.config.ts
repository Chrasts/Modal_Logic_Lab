import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'mobile-webkit-smoke.spec.ts',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report-webkit' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/Modal_Logic_Lab/',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/Modal_Logic_Lab/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
