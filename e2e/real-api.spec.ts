import { test } from '@playwright/test';

const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

async function setAuthStorage(page: import('@playwright/test').Page) {
  await page.addInitScript(({ expiresAt }) => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', role: 'user', displayName: 'Test User', createdAt: new Date().toISOString() },
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        expiresAt,
      },
      version: 0,
    }));
  }, { expiresAt });
}

async function waitForAuthHydration(page: import('@playwright/test').Page) {
  await page.waitForSelector('text=Đang kiểm tra phiên đăng nhập...', { state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
}

test.describe('Real API Test', () => {
  test('/history - see what backend returns', async ({ page }) => {
    await setAuthStorage(page);
    // No mocking - let it hit real API

    // Log network requests
    page.on('response', (resp) => {
      if (resp.url().includes('/api/scans')) {
        console.log(`API ${resp.status()}: ${resp.url()}`);
        resp.text().then(text => console.log('Response:', text.substring(0, 200)));
      }
    });

    await page.goto('/history');
    await waitForAuthHydration(page);
    await page.waitForTimeout(3000);

    // Check what's on page
    const body = await page.locator('body').textContent();
    console.log('Body preview:', body?.substring(0, 500));
  });
});