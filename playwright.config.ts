import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // Allow cross-origin requests to be mocked
    contextOptions: {
      // Disable web security to allow cross-origin mocking
      ignoreHTTPSErrors: true,
    },
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop 1280 x 800'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});