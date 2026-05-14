import { test, expect, Page } from '@playwright/test';

const OCR_RESPONSE = {
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
};

const LOCAL_SCAN_ID = 'local-e2e-cache';

function buildLocalScan(id = LOCAL_SCAN_ID) {
  return {
    id,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ocrRaw: OCR_RESPONSE.ocrRaw,
    ocrStructured: {
      title: OCR_RESPONSE.ocrStructured.title,
      fields: OCR_RESPONSE.ocrStructured.fields,
      sizes: OCR_RESPONSE.ocrStructured.sizes,
      raw_text: OCR_RESPONSE.ocrStructured.rawText,
      notes: OCR_RESPONSE.ocrStructured.notes,
    },
    tokenUsage: OCR_RESPONSE.tokenUsage,
    apiKeyIndex: OCR_RESPONSE.apiKeyIndex,
    modelTier: 'default',
  };
}

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
          data: OCR_RESPONSE,
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
      const payload = route.request().postDataJSON();
      expect(JSON.stringify(payload)).not.toContain('data:image');
      expect(payload).not.toHaveProperty('imageDataUrl');
      expect(payload).not.toHaveProperty('imageBase64');
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
    const confirmStartedAt = Date.now();
    await page.getByRole('button', { name: /xác nhận/i }).click();

    await expect(page).toHaveURL(/\/ocr-result\/local-/);
    await expect(page.getByText('Mock OCR Result')).toBeVisible();
    await expect(page.getByText('VES 529CT')).toBeVisible();
    expect(Date.now() - confirmStartedAt).toBeLessThan(2000);
    await expect(page.getByText('Kết quả đã hiển thị nhưng chưa lưu được vào lịch sử')).not.toBeVisible({ timeout: 10000 });
    await expect.poll(() => createScanAttempts, { timeout: 15000 }).toBe(3);
    expect(await page.evaluate(() => localStorage.getItem('hlvn.localOcrScans'))).toContain('VES 529CT');
  });

  test('deletes the local OCR result after scan history save succeeds', async ({ page }) => {
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
        body: JSON.stringify({ success: true, data: OCR_RESPONSE }),
      });
    });
    await page.route('**/api/scans', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'remote-scan-1' } }),
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
    await page.getByRole('button', { name: /xác nhận/i }).click();

    await expect(page).toHaveURL(/\/ocr-result\/local-/);
    await expect(page.getByText('Mock OCR Result')).toBeVisible();
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('hlvn.localOcrScans'))).toBe('[]');
  });

  test('does not create a local result when OCR fails', async ({ page }) => {
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 'app-settings', selectedModelTier: 'default' } }) });
    });
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({ status: 204 });
    });
    await login(page);
    await page.route('**/api/ocr/process', async (route) => {
      await route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ success: false, error: 'OCR failed', code: 'PROVIDER_ERROR' }) });
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
    await page.getByRole('button', { name: /xác nhận/i }).click();

    await expect(page.getByText('Xử lý thất bại')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('hlvn.localOcrScans'))).toBeNull();
  });

  test('shows an actionable error for a missing local result', async ({ page }) => {
    await page.addInitScript(({ expiresAt }) => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: '1', email: 'test@example.com', role: 'user', displayName: 'Test User', createdAt: new Date().toISOString() },
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          expiresAt,
          isAuthenticated: true,
        },
        version: 0,
      }));
    }, { expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() });
    await page.route('**/api/settings', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 'app-settings', selectedModelTier: 'default' } }) });
    });

    await page.goto('/ocr-result/local-missing');
    await expect(page.getByText('Không tìm thấy kết quả OCR')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thử lại' })).toBeFocused();
  });

  test('does not show local-only OCR results in History', async ({ page }) => {
    await page.addInitScript(({ localScan, expiresAt }) => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: '1', email: 'test@example.com', role: 'user', displayName: 'Test User', createdAt: new Date().toISOString() },
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          expiresAt,
          isAuthenticated: true,
        },
        version: 0,
      }));
      localStorage.setItem('hlvn.localOcrScans', JSON.stringify([localScan]));
    }, {
      localScan: buildLocalScan(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    });

    await page.route('**/api/scans**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/settings', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 'app-settings', selectedModelTier: 'default' } }) });
    });

    await page.goto('/history');
    await expect(page.getByText('0 lượt quét')).toBeVisible();
    await expect(page.getByText('Mock OCR Result')).not.toBeVisible();
    await expect(page.getByText('VES 529CT')).not.toBeVisible();
  });

  test('reloads a local OCR result from localStorage', async ({ page }) => {
    await page.addInitScript(({ localScan, expiresAt }) => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: '1', email: 'test@example.com', role: 'user', displayName: 'Test User', createdAt: new Date().toISOString() },
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          expiresAt,
          isAuthenticated: true,
        },
        version: 0,
      }));
      localStorage.setItem('hlvn.localOcrScans', JSON.stringify([localScan]));
    }, {
      localScan: buildLocalScan(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    });

    await page.route('**/api/ocr/process', async (route) => {
      throw new Error(`OCR should not run while loading cached local result: ${route.request().url()}`);
    });
    await page.route('**/api/scans**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/settings', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 'app-settings', selectedModelTier: 'default' } }) });
    });

    await page.goto(`/ocr-result/${LOCAL_SCAN_ID}`);
    await expect(page.getByText('Mock OCR Result')).toBeVisible();
    await expect(page.getByText('VES 529CT')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Mock OCR Result')).toBeVisible();
    await expect(page.getByText('VES 529CT')).toBeVisible();
  });
});
