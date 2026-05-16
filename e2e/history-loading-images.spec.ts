import { expect, test } from '@playwright/test';

const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

async function seedAuth(page: import('@playwright/test').Page) {
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

function buildScan(imageUrl: string | null) {
  return {
    id: imageUrl ? 'scan-with-image' : 'scan-without-image',
    timestamp: new Date().toISOString(),
    imageUrl,
    ocrRaw: '商品名 VES 529CT',
    ocrStructured: {
      title: imageUrl ? 'Scan With Image' : 'Scan Without Image',
      fields: [{ field: '商品名', value: 'VES 529CT', confidence: 'high', category: 'main' }],
      sizes: [],
      rawText: '商品名 VES 529CT',
      notes: [],
    },
    edited: false,
    tokenUsage: { input: 10, output: 20, cost: 0.001 },
    apiKeyIndex: 1,
    modelTier: 'default',
  };
}

test.describe('History loading and images', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await page.route('**/api/settings', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 'app-settings', selectedModelTier: 'default' } }) });
    });
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({ status: 204 });
    });
  });

  test('shows loading feedback before a slow history response resolves', async ({ page }) => {
    await page.route('**/api/scans**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });

    await page.goto('/history');

    // Loading skeleton visible during fetch
    await expect(page.getByText('Đang tải lịch sử')).toBeVisible();
    await expect(page.locator('[data-testid="history-skeleton-card"]')).toHaveCount(4);

    // After slow response: empty state shows count-based message
    await expect(page.getByText('0 lượt quét')).toBeVisible();
    await expect(page.getByText('Đang tải lịch sử')).not.toBeVisible();
  });

  test('shows thumbnails when backend history returns imageUrl', async ({ page }) => {
    await page.route('**/api/scans**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [buildScan('https://example.test/scan.jpg')] }) });
    });

    await page.goto('/history');

    await expect(page.getByText('Scan With Image')).toBeVisible();
    await expect(page.locator('[data-testid="history-scan-thumbnail"]')).toHaveAttribute('src', 'https://example.test/scan.jpg');
  });

  test('shows fallback when backend history has no imageUrl', async ({ page }) => {
    await page.route('**/api/scans**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [buildScan(null)] }) });
    });

    await page.goto('/history');

    await expect(page.getByText('Scan Without Image')).toBeVisible();
    await expect(page.locator('[data-testid="history-scan-thumbnail"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="history-scan-image-fallback"]')).toBeVisible();
  });
});
