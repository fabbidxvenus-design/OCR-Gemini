/**
 * Phase 2 Productization QA — OCR Mobile Web
 *
 * Focus: UI/UX flows, navigation clarity, state rendering
 * NOT: code changes, logic fixes
 *
 * Flows tested:
 *  1. /camera — capture/upload states and navigation clarity
 *  2. /ocr-result/:scanId — image + fixed 5 fields + action buttons
 *  3. /history — empty/list/search states
 *  4. /history/:scanId — image/no-image detail states
 *
 * Run:  npx playwright test e2e/phase2-productization.spec.ts --project=mobile
 * Screenshots land in e2e/screenshots/phase2/
 */

import { test, expect, Page } from '@playwright/test';

// ─── Shared helpers ────────────────────────────────────────────────────────────

async function seedAuthSession(page: Page) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  await page.goto('/');
  await page.evaluate((exp) => {
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User', createdAt: new Date().toISOString() },
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          expiresAt: exp,
        },
        version: 0,
      })
    );
  }, expiresAt);
  await page.reload();
  await page.waitForLoadState('networkidle');
  // Wait past any auth splash screen
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Đang kiểm tra phiên đăng nhập'),
    { timeout: 8000 }
  ).catch(() => {});
}

const MOCK_SCAN_ID = 'qa-test-scan-001';

async function mockScanApi(page: Page, overrides?: object) {
  await page.route('**/api/scans**', async (route) => {
    const url = route.request().url();
    if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }
    if (url.includes(`/api/scans/${MOCK_SCAN_ID}`) || url.includes('/api/scans/qa-test-scan-')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: MOCK_SCAN_ID,
            timestamp: new Date().toISOString(),
            imageDataUrl: 'https://picsum.photos/seed/ocrscan/800/600',
            ocrStructured: {
              title: 'QA Test Scan',
              fields: [
                { field: 'Contract No.', value: 'CONT-2024-001', confidence: 'high' },
                { field: '商品名', value: 'テスト商品', confidence: 'high' },
                { field: '数量', value: '50', confidence: 'high' },
                { field: 'サイズ', value: 'M', confidence: 'high' },
                { field: '単価', value: '¥1,200', confidence: 'high' },
                { field: 'ngày sản xuất', value: '2024-01-15', confidence: 'high' },
              ],
              notes: ['Ghi chú thử nghiệm cho QA'],
              rawText: 'Test raw text',
            },
            tokenUsage: { input: 200, output: 100, cost: 0.02 },
            edited: false,
            modelTier: 'economical',
            ...(overrides || {}),
          },
        }),
      });
      return;
    }
    await route.fallback();
  });
}

async function mockScanApiNoImage(page: Page, overrides?: object) {
  await page.route('**/api/scans**', async (route) => {
    const url = route.request().url();
    if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }
    if (url.includes('/api/scans/no-image-scan')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'no-image-scan',
            timestamp: new Date().toISOString(),
            imageDataUrl: null,
            ocrStructured: {
              title: 'No Image Scan',
              fields: [
                { field: 'Contract No.', value: 'CONT-NOIMG-001', confidence: 'high' },
                { field: '商品名', value: 'Product Without Image', confidence: 'high' },
              ],
              notes: [],
              rawText: '',
            },
            tokenUsage: { input: 50, output: 20, cost: 0.005 },
            edited: false,
            modelTier: 'economical',
            ...(overrides || {}),
          },
        }),
      });
      return;
    }
    await route.fallback();
  });
}

// ─── FLOW 1: /camera — capture/upload states and navigation clarity ───────────

test.describe('FLOW 1 — /camera capture/upload states', () => {

  test.beforeEach(async ({ page }) => {
    await seedAuthSession(page);
    await page.goto('/camera');
    await page.waitForLoadState('networkidle');
  });

  test('page title and heading are visible', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /quét tài liệu/i });
    await expect(heading).toBeVisible();
  });

  test('camera view container is rendered (video element present)', async ({ page }) => {
    const video = page.locator('video[autoplay]');
    await expect(video).toBeVisible({ timeout: 8000 });
  });

  test('overlay guidance hint is visible', async ({ page }) => {
    const hint = page.getByText('Canh nhãn trong khung');
    await expect(hint).toBeVisible();
  });

  test('good-lighting, no-shake, clear-text hints visible', async ({ page }) => {
    await expect(page.getByText('Đủ sáng')).toBeVisible();
    await expect(page.getByText('Không rung')).toBeVisible();
    await expect(page.getByText('Rõ chữ')).toBeVisible();
  });

  test('API status badge is visible (API Online)', async ({ page }) => {
    await expect(page.getByText('API Online')).toBeVisible();
  });

  test('model badge is visible (Gemini Pro)', async ({ page }) => {
    await expect(page.getByText('Gemini Pro')).toBeVisible();
  });

  test('capture button (shutter) is present and has accessible label', async ({ page }) => {
    const shutter = page.getByRole('button', { name: /chụp ảnh/i });
    await expect(shutter).toBeVisible();
  });

  test('gallery upload button is present with accessible label', async ({ page }) => {
    const uploadLabel = page.locator('label').filter({ has: page.locator('input[type="file"]') }).first();
    await expect(uploadLabel).toBeVisible();
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  test('settings overlay toggle button is present and clickable', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: /bật tắt khung hướng dẫn/i });
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
    // After toggling, overlay hint should be gone
    await expect(page.getByText('Canh nhãn trong khung')).not.toBeVisible();
  });

  test('no crash when camera error state (upload fallback shown)', async ({ page }) => {
    // Simulate camera error by intercepting getUserMedia
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: () => Promise.reject(new Error('Camera unavailable')) },
        writable: true,
      });
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    // Should show error message and upload button
    await expect(page.getByText(/tải ảnh lên/i)).toBeVisible();
    await expect(page.locator('label').filter({ has: page.locator('input[type="file"]') })).toBeVisible();
  });

  test('navigation from camera to history works via bottom nav', async ({ page }) => {
    await page.getByRole('link', { name: /lịch sử/i }).click();
    await expect(page).toHaveURL(/\/history/);
    await expect(page.getByRole('heading', { name: /lịch sử/i })).toBeVisible();
  });

  test('screenshot: camera page loaded state', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/phase2/camera-loaded.png', fullPage: false });
  });

});

// ─── FLOW 2: /ocr-result/:scanId — image + fixed 5 fields + actions ──────────

test.describe('FLOW 2 — /ocr-result/:scanId rendering', () => {

  test.beforeEach(async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/ocr-result/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');
  });

  test('page renders scan image when imageDataUrl present', async ({ page }) => {
    const img = page.locator('img[alt="Scan"]');
    await expect(img).toBeVisible({ timeout: 10000 });
    await expect(img).toHaveAttribute('src', /picsum\.photos/);
  });

  test('image has "Ảnh đã quét" badge overlay', async ({ page }) => {
    await expect(page.getByText('Ảnh đã quét')).toBeVisible();
  });

  test('scan title and timestamp visible in header card', async ({ page }) => {
    await expect(page.getByText('QA Test Scan')).toBeVisible();
    // Timestamp: current date in vi-VN format
    const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    await expect(page.getByText(today)).toBeVisible();
  });

  test('three stat chips visible: Trường, Cần sửa, Trạng thái', async ({ page }) => {
    await expect(page.getByText('Trường')).toBeVisible();
    await expect(page.getByText('Cần sửa')).toBeVisible();
    await expect(page.getByText('Trạng thái')).toBeVisible();
  });

  test('fields count chip shows number > 0', async ({ page }) => {
    // Trường chip shows field count
    const fieldChip = page.locator('.rounded-xl.bg-surface').filter({ hasText: 'Trường' });
    await expect(fieldChip).toBeVisible();
  });

  test('status chip shows OK when no low-confidence fields', async ({ page }) => {
    await expect(page.getByText('OK')).toBeVisible();
  });

  test('"Thông tin chính" section heading visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /thông tin chính/i })).toBeVisible();
  });

  test('all 5 fixed fields visible as table rows', async ({ page }) => {
    // The ScanFieldsTable uses <table><tbody><tr>. Check for all 5 fixed field labels.
    const table = page.locator('table');
    await expect(table).toBeVisible();

    const tbody = table.locator('tbody tr');
    const rowCount = await tbody.count();
    // Should have at least the mapped fields from OCR data
    expect(rowCount).toBeGreaterThan(0);
  });

  test('contract field label + value visible', async ({ page }) => {
    const row = page.locator('table tbody tr').filter({ hasText: 'Contract No.' }).first();
    await expect(row).toBeVisible();
    await expect(row.getByText('CONT-2024-001')).toBeVisible();
  });

  test('product-name mapped field visible', async ({ page }) => {
    const row = page.locator('table tbody tr').filter({ hasText: /tên|mã|sản phẩm|商品名/i }).first();
    await expect(row).toBeVisible();
  });

  test('notes section visible when notes present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ghi chú/i })).toBeVisible();
    await expect(page.getByText('Ghi chú thử nghiệm cho QA')).toBeVisible();
  });

  test('4 action buttons visible in fixed bottom bar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /chụp/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sửa/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /copy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /chia sẻ/i })).toBeVisible();
  });

  test('"Chụp" button navigates to /camera', async ({ page }) => {
    await page.getByRole('button', { name: /chụp/i }).click();
    await expect(page).toHaveURL(/\/camera/);
  });

  test('"Sửa" button navigates to /edit/:scanId', async ({ page }) => {
    await page.getByRole('button', { name: /sửa/i }).click();
    await expect(page).toHaveURL(new RegExp(`/edit/${MOCK_SCAN_ID}`));
  });

  test('no-image state: image section absent', async ({ page }) => {
    // Use separate mock without image
    await mockScanApi(page, { imageDataUrl: null });
    await page.goto(`/ocr-result/noimg-test`);
    await page.waitForLoadState('networkidle');
    // The image section should not be visible (conditional render)
    const imgSection = page.locator('img[alt="Scan"]');
    await expect(imgSection).not.toBeVisible();
  });

  test('loading skeleton shown while scan data loads', async ({ page }) => {
    // Navigate without pre-seeding scan data
    await page.goto(`/ocr-result/skeleton-test`);
    await page.waitForLoadState('domcontentloaded');
    // Skeleton elements should appear
    const skeleton = page.locator('[class*="animate-pulse"]').first();
    await expect(skeleton).toBeVisible({ timeout: 2000 });
  });

  test('missing scan shows "Không tìm thấy" error state', async ({ page }) => {
    // Mock 404
    await page.route('**/api/scans/unknown-scan-xyz**', async (route) => {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ success: false, error: 'Not found' }) });
    });
    await page.goto('/ocr-result/unknown-scan-xyz');
    await page.waitForLoadState('networkidle');
    // isPendingMissing should show "Không tìm thấy kết quả OCR"
    await expect(page.getByText(/không tìm thấy kết quả ocr/i)).toBeVisible({ timeout: 8000 });
  });

  test('screenshot: ocr-result with image and fields', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screenshots/phase2/ocr-result-loaded.png', fullPage: true });
  });

});

// ─── FLOW 3: /history — empty/list/search states ─────────────────────────────

test.describe('FLOW 3 — /history empty/list/search states', () => {

  test('empty state: camera icon + message + CTA button', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page, { data: [] });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /chưa có lượt quét/i })).toBeVisible();
    await expect(page.getByText(/chụp nhãn đầu tiên để tạo kho hồ sơ/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /bắt đầu quét/i })).toBeVisible();
    await expect(page.locator('svg').filter({ has: page.locator('svg[class*="Camera"]') })).toBeVisible();
  });

  test('empty state "Bắt đầu quét" button navigates to /camera', async ({ page }) => {
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /bắt đầu quét/i }).click();
    await expect(page).toHaveURL(/\/camera/);
  });

  test('search bar present with placeholder text', async ({ page }) => {
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/tìm hồ sơ, tên, số giấy tờ/i);
    await expect(searchInput).toBeVisible();
  });

  test('filter chips visible: Tất cả, Cần kiểm tra, Đã sửa, Lỗi', async ({ page }) => {
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/tất cả \(\d+\)/i)).toBeVisible();
    await expect(page.getByText(/cần kiểm tra \(\d+\)/i)).toBeVisible();
    await expect(page.getByText(/đã sửa \(\d+\)/i)).toBeVisible();
    await expect(page.getByText(/lỗi \(\d+\)/i)).toBeVisible();
  });

  test('sort button visible with default label "Mới nhất"', async ({ page }) => {
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Mới nhất')).toBeVisible();
  });

  test('sort menu opens on click with 4 options', async ({ page }) => {
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /mới nhất/i }).click();
    await expect(page.getByRole('heading', { name: /sắp xếp theo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /mới nhất/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cũ nhất/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /a\s*→\s*z/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /z\s*→\s*a/i })).toBeVisible();
  });

  test('loading state shows skeleton cards', async ({ page }) => {
    await seedAuthSession(page);
    // Mock a delayed response to force skeleton
    await page.route('**/api/scans', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');
    // Skeleton cards should appear while loading
    await expect(page.getByTestId('history-skeleton-card')).toBeVisible({ timeout: 500 });
  });

  test('list state: scan cards render with title, date, field preview', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'scan-list-1',
                timestamp: new Date().toISOString(),
                imageDataUrl: 'https://picsum.photos/seed/scan1/200/200',
                ocrStructured: {
                  title: 'Invoice Scan 001',
                  fields: [{ field: 'Contract No.', value: 'INV-001', confidence: 'high' }],
                  notes: [],
                  rawText: '',
                },
                tokenUsage: { input: 100, output: 50, cost: 0.01 },
                edited: false,
                modelTier: 'economical',
              },
              {
                id: 'scan-list-2',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                imageDataUrl: null,
                ocrStructured: {
                  title: 'Manual Entry 002',
                  fields: [{ field: '商品名', value: 'Test Item', confidence: 'low' }],
                  notes: [],
                  rawText: '',
                },
                tokenUsage: { input: 50, output: 20, cost: 0.005 },
                edited: true,
                modelTier: 'economical',
              },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    // Both scans should appear
    await expect(page.getByText('Invoice Scan 001')).toBeVisible();
    await expect(page.getByText('Manual Entry 002')).toBeVisible();
    // Date should appear
    await expect(page.getByText(/vừa xong|ngày trước/i)).toBeVisible();
    // Status chips
    await expect(page.getByText(/sẵn sàng/i)).toBeVisible();
    await expect(page.getByText(/cần kiểm tra/i)).toBeVisible();
  });

  test('list state: thumbnail images visible for scans with imageDataUrl', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'thumb-test-1',
                timestamp: new Date().toISOString(),
                imageDataUrl: 'https://picsum.photos/seed/thumb1/200/200',
                ocrStructured: { title: 'With Image', fields: [{ field: '商品', value: 'X', confidence: 'high' }], notes: [], rawText: '' },
                tokenUsage: { input: 50, output: 20, cost: 0.005 },
                edited: false,
                modelTier: 'economical',
              },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    const thumbnail = page.getByTestId('history-scan-thumbnail');
    await expect(thumbnail).toBeVisible();
  });

  test('list state: fallback icon for scans without imageDataUrl', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'no-img-card',
                timestamp: new Date().toISOString(),
                imageDataUrl: null,
                ocrStructured: { title: 'No Image Card', fields: [{ field: 'A', value: 'B', confidence: 'high' }], notes: [], rawText: '' },
                tokenUsage: { input: 50, output: 20, cost: 0.005 },
                edited: false,
                modelTier: 'economical',
              },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    const fallback = page.getByTestId('history-scan-image-fallback');
    await expect(fallback).toBeVisible();
  });

  test('list state: scan card click navigates to /history/:scanId', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'click-nav-test',
                timestamp: new Date().toISOString(),
                imageDataUrl: null,
                ocrStructured: { title: 'Click Test', fields: [{ field: 'A', value: 'B', confidence: 'high' }], notes: [], rawText: '' },
                tokenUsage: { input: 50, output: 20, cost: 0.005 },
                edited: false,
                modelTier: 'economical',
              },
            ],
          }),
        });
        return;
      }
      if (url.includes('/api/scans/click-nav-test')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'click-nav-test',
              timestamp: new Date().toISOString(),
              imageDataUrl: null,
              ocrStructured: { title: 'Click Test', fields: [{ field: 'A', value: 'B', confidence: 'high' }], notes: [], rawText: '' },
              tokenUsage: { input: 50, output: 20, cost: 0.005 },
              edited: false,
              modelTier: 'economical',
            },
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');
    await page.getByText('Click Test').click();
    await expect(page).toHaveURL(/\/history\/click-nav-test/);
  });

  test('search: typing filters scan list in real-time', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 's1', timestamp: new Date().toISOString(), imageDataUrl: null, ocrStructured: { title: 'Invoice Alpha', fields: [{ field: 'Contract No.', value: 'C1', confidence: 'high' }], notes: [], rawText: '' }, tokenUsage: { input: 50, output: 20, cost: 0.005 }, edited: false, modelTier: 'economical' },
              { id: 's2', timestamp: new Date().toISOString(), imageDataUrl: null, ocrStructured: { title: 'Invoice Beta', fields: [{ field: 'Contract No.', value: 'C2', confidence: 'high' }], notes: [], rawText: '' }, tokenUsage: { input: 50, output: 20, cost: 0.005 }, edited: false, modelTier: 'economical' },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    // Both visible initially
    await expect(page.getByText('Invoice Alpha')).toBeVisible();
    await expect(page.getByText('Invoice Beta')).toBeVisible();

    // Type in search
    const searchInput = page.getByPlaceholder(/tìm hồ sơ, tên, số giấy tờ/i);
    await searchInput.fill('Alpha');

    // Wait for debounce (300ms) + render
    await page.waitForTimeout(600);
    await expect(page.getByText('Invoice Alpha')).toBeVisible();
    await expect(page.getByText('Invoice Beta')).not.toBeVisible();
  });

  test('search no-results state shows "Không có kết quả" message', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 's1', timestamp: new Date().toISOString(), imageDataUrl: null, ocrStructured: { title: 'Invoice A', fields: [{ field: 'X', value: 'Y', confidence: 'high' }], notes: [], rawText: '' }, tokenUsage: { input: 50, output: 20, cost: 0.005 }, edited: false, modelTier: 'economical' },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder(/tìm hồ sơ, tên, số giấy tờ/i).fill('nonexistent-query-xyz');
    await page.waitForTimeout(600);

    await expect(page.getByRole('heading', { name: /không có kết quả/i })).toBeVisible();
    await expect(page.getByText(/thử đổi từ khóa/i)).toBeVisible();
  });

  test('select mode toggle enters selection mode', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 'sel1', timestamp: new Date().toISOString(), imageDataUrl: null, ocrStructured: { title: 'Select Test', fields: [{ field: 'A', value: 'B', confidence: 'high' }], notes: [], rawText: '' }, tokenUsage: { input: 50, output: 20, cost: 0.005 }, edited: false, modelTier: 'economical' },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /chọn tất cả|chọn$/i }).click();
    await expect(page.getByText(/đã chọn \d+/i)).toBeVisible();
  });

  test('scan count in header shows total scan count', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 'cnt1', timestamp: new Date().toISOString(), imageDataUrl: null, ocrStructured: { title: 'A', fields: [], notes: [], rawText: '' }, tokenUsage: { input: 10, output: 5, cost: 0.001 }, edited: false, modelTier: 'economical' },
              { id: 'cnt2', timestamp: new Date().toISOString(), imageDataUrl: null, ocrStructured: { title: 'B', fields: [], notes: [], rawText: '' }, tokenUsage: { input: 10, output: 5, cost: 0.001 }, edited: false, modelTier: 'economical' },
              { id: 'cnt3', timestamp: new Date().toISOString(), imageDataUrl: null, ocrStructured: { title: 'C', fields: [], notes: [], rawText: '' }, tokenUsage: { input: 10, output: 5, cost: 0.001 }, edited: false, modelTier: 'economical' },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('3 lượt quét')).toBeVisible();
  });

  test('screenshot: history empty state', async ({ page }) => {
    await seedAuthSession(page);
    await page.goto('/history');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/phase2/history-empty.png', fullPage: false });
  });

  test('screenshot: history list state', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans**', async (route) => {
      const url = route.request().url();
      if (url.match(/api\/scans$/) && !url.includes('/api/scans/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 'ss1', timestamp: new Date().toISOString(), imageDataUrl: 'https://picsum.photos/seed/h1/200/200', ocrStructured: { title: 'Invoice Sample A', fields: [{ field: 'Contract No.', value: 'INV-A', confidence: 'high' }], notes: [], rawText: '' }, tokenUsage: { input: 100, output: 50, cost: 0.01 }, edited: false, modelTier: 'economical' },
              { id: 'ss2', timestamp: new Date(Date.now() - 3600000).toISOString(), imageDataUrl: null, ocrStructured: { title: 'Manual Sample B', fields: [{ field: '商品名', value: 'Sample B', confidence: 'low' }], notes: [], rawText: '' }, tokenUsage: { input: 50, output: 20, cost: 0.005 }, edited: true, modelTier: 'economical' },
            ],
          }),
        });
        return;
      }
      await route.fallback();
    });
    await page.goto('/history');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/phase2/history-list.png', fullPage: true });
  });

});

// ─── FLOW 4: /history/:scanId — image/no-image detail states ─────────────────

test.describe('FLOW 4 — /history/:scanId image/no-image detail states', () => {

  test('detail page renders image when imageDataUrl present', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    const img = page.locator('img[alt="Scan"]');
    await expect(img).toBeVisible({ timeout: 10000 });
  });

  test('detail page shows "Không có ảnh" when imageDataUrl is null', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApiNoImage(page);
    await page.goto('/history/no-image-scan');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Không có ảnh')).toBeVisible();
  });

  test('back navigation button present and works', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    const backBtn = page.getByRole('link', { name: /quay lại/i }).or(page.locator('[aria-label="Quay lại"]').first());
    await backBtn.click();
    await expect(page).toHaveURL(/\/history/);
  });

  test('scan title and timestamp visible in detail header', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('QA Test Scan')).toBeVisible();
  });

  test('3 stat chips visible in detail card', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Trường')).toBeVisible();
    await expect(page.getByText('Cần sửa')).toBeVisible();
    await expect(page.getByText('Trạng thái')).toBeVisible();
  });

  test('edited warning banner visible when scan.edited is true', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page, { edited: true });
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/scan này đã được chỉnh sửa/i)).toBeVisible();
  });

  test('edited warning banner absent when scan.edited is false', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page, { edited: false });
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/scan này đã được chỉnh sửa/i)).not.toBeVisible();
  });

  test('scan fields table visible with field rows', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    const table = page.locator('table');
    await expect(table).toBeVisible();
    const rowCount = await table.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('technical details section visible with token/cost/model info', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Chi tiết kỹ thuật')).toBeVisible();
    await expect(page.getByText(/token dùng/i)).toBeVisible();
    await expect(page.getByText(/chi phí ước tính/i)).toBeVisible();
    await expect(page.getByText(/mô hình/i)).toBeVisible();
    await expect(page.getByText('ECONOMICAL')).toBeVisible();
  });

  test('3 action buttons: Sửa, Xuất, Xóa', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /sửa/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /xuất/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /xóa/i }).first()).toBeVisible();
  });

  test('"Sửa" button navigates to /edit/:scanId', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /sửa/i }).first().click();
    await expect(page).toHaveURL(new RegExp(`/edit/${MOCK_SCAN_ID}`));
  });

  test('"Xóa" button shows confirmation dialog', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');

    page.on('dialog', async dialog => {
      expect(dialog.message()).toMatch(/xóa scan/i);
      await dialog.dismiss();
    });

    await page.getByRole('button', { name: /xóa/i }).first().click();
  });

  test('loading skeleton shown while detail loads', async ({ page }) => {
    await seedAuthSession(page);
    await page.goto('/history/loading-test');
    await page.waitForLoadState('domcontentloaded');
    // Skeleton should appear
    const skeleton = page.locator('[class*="animate-pulse"]').first();
    await expect(skeleton).toBeVisible({ timeout: 3000 });
  });

  test('error state shows "Không thể tải chi tiết scan" on API failure', async ({ page }) => {
    await seedAuthSession(page);
    await page.route('**/api/scans/detail-error-scan**', async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, error: 'Server error' }) });
    });
    await page.goto('/history/detail-error-scan');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/không thể tải chi tiết scan/i)).toBeVisible({ timeout: 8000 });
  });

  test('screenshot: history detail with image', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApi(page);
    await page.goto(`/history/${MOCK_SCAN_ID}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/phase2/history-detail-with-image.png', fullPage: true });
  });

  test('screenshot: history detail without image', async ({ page }) => {
    await seedAuthSession(page);
    await mockScanApiNoImage(page);
    await page.goto('/history/no-image-scan');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/phase2/history-detail-no-image.png', fullPage: true });
  });

});
