import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', role: 'user', displayName: 'Test User', createdAt: new Date().toISOString() },
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          expiresAt,
        },
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('password');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/camera/);
}

test.describe('OCR latency Phase 1', () => {
  test('renders OCR result before scan history persistence completes', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          enumerateDevices: async () => [],
          getUserMedia: async () => new MediaStream(),
        },
        configurable: true,
      });
    });

    await page.route('**/api/settings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'app-settings', selectedModelTier: 'default' } }),
      });
    });

    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({ status: 204 });
    });

    await login(page);

    await page.route('**/api/ocr/process', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ocrRaw: '商品名 VES 529CT\nサイズ M\n数量 10',
            ocrStructured: {
              title: 'Mock OCR Result',
              fields: [
                { field: '商品名', value: 'VES 529CT', confidence: 'high', category: 'main' },
                { field: 'サイズ / 数量', value: 'M: 10', confidence: 'high', category: 'main' },
              ],
              sizes: [{ size: 'M', quantity: 10 }],
              rawText: '商品名 VES 529CT\nサイズ M\n数量 10',
              notes: [],
            },
            tokenUsage: { input: 10, output: 20, cost: 0.001, model: 'mock' },
            apiKeyIndex: 0,
            model: 'mock',
          },
        }),
      });
    });

    let createScanAttempts = 0;
    await page.route('**/api/scans', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
        return;
      }

      createScanAttempts += 1;
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'save failed', code: 'INTERNAL_ERROR' }),
      });
    });

    await expect(page.getByText('Tải ảnh lên')).toBeVisible();
    const uploadInput = page.locator('input[type="file"]').first();
    await expect(uploadInput).toBeAttached();
    await uploadInput.setInputFiles({
      name: 'ocr-test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', 'base64'),
    });

    await expect(page.getByText('Xác nhận ảnh chụp')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('auth-storage'))).toContain('test-token');
    await page.getByRole('button', { name: /xác nhận/i }).click();

    await expect(page).toHaveURL(/\/ocr-result\/local-/);
    await expect(page.getByText('Mock OCR Result')).toBeVisible();
    await expect(page.getByText('VES 529CT')).toBeVisible();
    await expect(page.getByText('Kết quả đã hiển thị nhưng chưa lưu được vào lịch sử')).not.toBeVisible({ timeout: 10000 });
    expect(createScanAttempts).toBeGreaterThan(0);
    expect(await page.evaluate(() => localStorage.getItem('hlvn.localOcrScans'))).toContain('VES 529CT');
  });
});
