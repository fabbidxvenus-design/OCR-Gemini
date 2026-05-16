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

test.describe('Debug API', () => {
  test('check what URL is being called', async ({ page }) => {
    await setAuthStorage(page);

    // Log ALL requests to find out what's happening
    page.on('request', (req) => {
      console.log(`REQUEST: ${req.method()} ${req.url()}`);
    });

    page.on('response', (resp) => {
      console.log(`RESPONSE: ${resp.status()} ${resp.url()}`);
    });

    await page.goto('/history');
    await waitForAuthHydration(page);
    await page.waitForTimeout(3000);
  });
});