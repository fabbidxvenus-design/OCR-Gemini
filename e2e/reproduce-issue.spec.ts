import { test, expect } from '@playwright/test';

test.describe('OCR Result UI Reproduction', () => {
  test('should render OCR fields correctly and verify categorization', async ({ page }) => {
    // 1. Seed auth session
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    await page.goto('/');
    await page.evaluate((exp) => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          accessToken: 'test-token',
          expiresAt: exp,
        },
        version: 0,
      }));
    }, expiresAt);

    // 2. Mock the scan API response
    const mockScanId = 'mock-scan-123';
    const mockScanData = {
      id: mockScanId,
      timestamp: new Date().toISOString(),
      imageUrl: 'https://via.placeholder.com/400x600',
      ocrRaw: 'Raw text...',
      ocrStructured: {
        title: 'Mock Invoice',
        fields: [
          // Main fields (repeated as reported)
          { field: '商品名', value: 'Product A', confidence: 'high' },
          { field: 'サイズ', value: 'Large', confidence: 'high' },
          { field: '数量', value: '10', confidence: 'high' },
          { field: '商品名', value: 'Product A', confidence: 'high' },
          { field: 'サイズ', value: 'Large', confidence: 'high' },
          { field: '数量', value: '10', confidence: 'high' },

          // Other fields (reported to be in "other" but maybe should be "main")
          { field: '契約No.', value: 'CONT-001', confidence: 'high' },
          { field: 'CT No.', value: 'CT-999', confidence: 'high' },
          { field: '12345', value: 'Some Value', confidence: 'low' }, // Numeric field name
        ],
        notes: ['Reproduction note'],
      },
      tokenUsage: { input: 100, output: 50, cost: 0.01 },
      apiKeyIndex: 1,
      edited: false
    };

    await page.route(`**/api/scans/${mockScanId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockScanData }),
      });
    });

    // 3. Navigate to the OCR result page
    await page.goto(`/ocr-result/${mockScanId}`);
    await page.reload(); // Ensure localStorage is picked up
    await page.waitForLoadState('networkidle');

    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'e2e/screenshots/repro-debug.png', fullPage: true });

    // 4. Verify rendering
    // If it's still loading, wait a bit more or check for loading text
    const loadingText = page.getByText('Đang tải kết quả...');
    if (await loadingText.isVisible()) {
      await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    }

    await expect(page.getByText('Thông tin chính')).toBeVisible();

    // Check for "Thông tin khác" (Other information)
    await expect(page.getByText('Thông tin khác')).toBeVisible();

    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'e2e/screenshots/repro-ocr-result.png', fullPage: true });

    // 5. Assert counts based on current categorization logic in src/lib/fieldCategories.ts
    // Based on my analysis of fieldCategories.ts:
    // 商品名, サイズ, 数量 ARE in MAIN_FIELD_PATTERNS.
    // 契約No. (with dot) and CT No. (with dot/space) might NOT be in MAIN_FIELD_PATTERNS correctly.

    // Let's check how many fields are in "Thông tin chính"
    const mainFields = page.locator('section:has-text("Thông tin chính") .rounded-2xl');
    const otherFields = page.locator('section:has-text("Thông tin khác") .rounded-2xl');

    console.log(`Main fields count: ${await mainFields.count()}`);
    console.log(`Other fields count: ${await otherFields.count()}`);

    // Log the field names in each section to verify
    const mainFieldNames = await mainFields.locator('p.text-caption').allTextContents();
    const otherFieldNames = await otherFields.locator('p.text-caption').allTextContents();

    console.log('Main field names:', mainFieldNames);
    console.log('Other field names:', otherFieldNames);
  });
});
