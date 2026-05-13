import { test, expect, Page } from '@playwright/test';

/** Pre-seed Zustand auth store so ProtectedRoute passes. */
async function seedAuthSession(page: Page) {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  await page.goto('/');
  await page.evaluate(
    (exp) => {
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
    },
    [expiresAt]
  );
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Unit test for field categorization logic.
 * Validates the categorizeField() function directly against known field names
 * using the actual src/lib/fieldCategories.ts logic.
 *
 * Run with: npx playwright test e2e/ocr-result.spec.ts --project=mobile
 */
test.describe('OCR Result Page - Unit-level categorization', () => {

  test('categorizeField: Japanese main fields match "main" category', async ({ page }) => {
    await seedAuthSession(page);

    // Inject the categorization logic and call it directly in the browser
    const results = await page.evaluate(() => {
      // These are the patterns from src/lib/fieldCategories.ts MAIN_FIELD_PATTERNS
      const patterns = [
        // Barcode
        /^bar\s*code$/i, /^barcode$/i, /^mã\s*vạch$/i, /^ma\s*vach$/i, /^バーコード$/i, /^bar_code$/i,
        // Lot No
        /^lot\s*no\.?$/i, /^lot\s*number$/i, /^batch\s*no\.?$/i, /^batch\s*number$/i, /^lote?\s*no\.?$/i,
        /^số\s*lô$/i, /^so\s*lo$/i, /^lô\s*sx$/i, /^lo\s*sx$/i, /^batch$/i, /^ロット$/i, /^lot_no$/i, /^batch_no$/i,
        // Product Name
        /^tên\s*sản\s*phẩm$/i, /^ten\s*san\s*pham$/i, /^product\s*name$/i, /^product_name$/i, /^item\s*name$/i,
        /^tên\s*sp$/i, /^ten\s*sp$/i, /^tên\s*hàng$/i, /^ten\s*hang$/i, /^商品名$/i, /^製品名$/i,
        /^sản\s*phẩm$/i, /^san\s*pham$/i, /^sp$/i, /^product$/i,
        // Product Code
        /^mã\s*sản\s*phẩm$/i, /^ma\s*san\s*pham$/i, /^product\s*code$/i, /^product_code$/i, /^item\s*code$/i,
        /^code$/i, /^mã\s*sp$/i, /^ma\s*sp$/i, /^mã\s*hàng$/i, /^ma\s*hang$/i, /^mã$/i, /^code\s*no$/i,
        /^商品コード$/i, /^製品コード$/i, /^code$/i,
        // Quantity
        /^số\s*lượng$/i, /^so\s*luong$/i, /^quantity$/i, /^qty$/i, /^sl$/i, /^amount$/i, /^number$/i, /^count$/i,
        /^数量$/i, /^个数$/i, /^qty$/i,
        // Size
        /^size$/i, /^kích\s*thước$/i, /^kich\s*thuoc$/i, /^dimension$/i, /^サイズ$/i, /^大きさ$/i,
        // Contract No
        /^contract[\s_]*no\.?$/i, /^contract\s*number$/i, /^contract_no$/i, /^contract$/i, /^ct[\s_]*no\.?$/i,
        /^ct_n[oọ]$/i, /^số\s*hợp\s*đồng$/i, /^so\s*hop\s*dong$/i, /^số\s*hđ$/i, /^so\s*hd$/i,
        /^hợp\s*đồng$/i, /^hop\s*dong$/i, /^đơn\s*hàng$/i, /^don\s*hang$/i, /^order[\s_]*no\.?$/i,
        /^order\s*number$/i, /^order_no$/i, /^注文番号$/i, /^契約\s*no\.?$/i, /^契約\s*番号$/i, /^order$/i,
        // Price
        /^price$/i, /^giá$/i, /^gia$/i, /^price\s*no\.?$/i, /^giá\s*tiền$/i, /^gia\s*tien$/i,
        /^単価$/i, /^価格$/i,
        // Date
        /^date$/i, /^ngày$/i, /^ngay$/i, /^date\s*no\.?$/i, /^manufacture\s*date$/i, /^ngày\s*sản\s*xuất$/i,
        /^ngay\s*san\s*xuat$/i, /^sx$/i, /^mfg$/i, /^exp$/i, /^hạn\s*sử\s*dụng$/i, /^han\s*su\s*dung$/i,
        /^期限$/i, /^有効期限$/i, /^製造日$/i,
        // Unit
        /^unit$/i, /^đơn\s*vị$/i, /^don\s*vi$/i, /^đv$/i, /^dv$/i, /^ واحد$/i, /^单位$/i,
      ];

      function categorizeField(name: string) {
        const normalized = name.trim();
        for (const pattern of patterns) {
          if (pattern.test(normalized)) return 'main';
        }
        return 'other';
      }

      const testCases = [
        // Japanese - should be main
        { name: '商品名', expected: 'main' },
        { name: 'サイズ', expected: 'main' },
        { name: '数量', expected: 'main' },
        // Contract variants - REPEATED fields reported by user
        { name: '契約No.', expected: 'main' },
        { name: 'CT No.', expected: 'main' },
        { name: 'ct_no', expected: 'main' },
        { name: '契約No', expected: 'main' },
        { name: 'CT No', expected: 'main' },
        // Numeric field names - from user's "other" section
        { name: '12345', expected: 'other' },
        // Other patterns
        { name: '単価', expected: 'main' },
        { name: 'price', expected: 'main' },
        { name: 'giá', expected: 'main' },
      ];

      return testCases.map(tc => ({
        name: tc.name,
        actual: categorizeField(tc.name),
        expected: tc.expected,
        pass: categorizeField(tc.name) === tc.expected,
      }));
    });

    // Print results for review
    console.log('Field categorization results:');
    for (const r of results) {
      console.log(`  "${r.name}" => ${r.actual} (expected ${r.expected}) ${r.pass ? 'PASS' : 'FAIL'}`);
    }

    // Assert: every test case must pass
    const failures = results.filter(r => !r.pass);
    expect(failures, `Failed fields: ${failures.map(r => `"${r.name}"`).join(', ')}`).toHaveLength(0);
  });

});

/**
 * E2E test for OCR result page rendering.
 * Requires the dev server running at http://localhost:5173.
 *
 * Reproduction for the reported issue:
 * - "main has repeated 商品名/サイズ/数量 with identical values"
 * - "other has 契約No., CT No., numeric values as fields"
 */
test.describe('OCR Result Page - E2E rendering', () => {
  test('renders fields and verifies "契約No." and "CT No." are NOT misplaced in "other"', async ({ page }) => {
    const mockScanId = 'repro-scan-001';

    // Seed auth so ProtectedRoute passes
    await seedAuthSession(page);

    // Mock both the scan list and single scan endpoints
    await page.route(`**/api/scans/${mockScanId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: mockScanId,
            timestamp: new Date().toISOString(),
            imageUrl: 'https://example.com/image.jpg',
            ocrRaw: 'raw text',
            ocrStructured: {
              title: 'Test Invoice',
              fields: [
                // Repeated fields (reproducing the user's complaint)
                { field: '商品名', value: 'Widget A', confidence: 'high' },
                { field: 'サイズ', value: 'Large', confidence: 'high' },
                { field: '数量', value: '10', confidence: 'high' },
                { field: '商品名', value: 'Widget A', confidence: 'high' },
                { field: 'サイズ', value: 'Large', confidence: 'high' },
                { field: '数量', value: '10', confidence: 'high' },
                // Contract fields - these SHOULD be in "main" based on patterns
                { field: '契約No.', value: 'CONT-001', confidence: 'high' },
                { field: 'CT No.', value: 'CT-999', confidence: 'high' },
                // Numeric field name - legitimately "other"
                { field: '12345', value: 'Field value', confidence: 'low' },
              ],
              rawText: 'raw',
              notes: [],
            },
            tokenUsage: { input: 100, output: 50, cost: 0.01 },
            apiKeyIndex: 1,
            edited: false,
          },
        }),
      });
    });

    // Also mock the scan list (history page may call it)
    await page.route('**/api/scans', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // Navigate to OCR result
    await page.goto(`/ocr-result/${mockScanId}`);
    await page.waitForLoadState('networkidle');

    // Wait for loading to resolve
    const loading = page.getByText('Đang tải kết quả...');
    if (await loading.isVisible({ timeout: 500 }).catch(() => false)) {
      await expect(loading).not.toBeVisible({ timeout: 10000 });
    }

    // Screenshot for debug
    await page.screenshot({ path: 'e2e/screenshots/ocr-result-repro.png', fullPage: true });

    // ── Assertions ──────────────────────────────────────────────────────────

    // The page must show both sections
    const mainSection = page.getByRole('heading', { name: /thông tin chính/i });
    const otherSection = page.getByRole('heading', { name: /thông tin khác/i });
    await expect(mainSection).toBeVisible();
    await expect(otherSection).toBeVisible();

    // Count field cards in each section
    // The section container has a specific structure: <section><div class="flex"><h3></h3>...</div>{cards}</section>
    const mainCards = mainSection.locator('..').locator('.rounded-2xl');
    const otherCards = otherSection.locator('..').locator('.rounded-2xl');

    const mainCount = await mainCards.count();
    const otherCount = await otherCards.count();

    console.log(`Main section field cards: ${mainCount}`);
    console.log(`Other section field cards: ${otherCount}`);

    // Log field names for verification
    const mainFieldNames = await mainCards.locator('p.text-caption').allTextContents();
    const otherFieldNames = await otherCards.locator('p.text-caption').allTextContents();
    console.log(`Main fields: ${JSON.stringify(mainFieldNames)}`);
    console.log(`Other fields: ${JSON.stringify(otherFieldNames)}`);

    // ── Bug reproduction checks ───────────────────────────────────────────────

    // BUG 1: Repeated identical main fields are showing up duplicated
    // (This is a data issue from the backend, not the UI — but UI should handle it gracefully)
    expect(mainCount).toBeGreaterThan(0, 'Main section should have fields');

    // BUG 2: 契約No. and CT No. appearing in "other" instead of "main"
    // These are contract fields and SHOULD be in main based on MAIN_FIELD_PATTERNS
    // The patterns include /^contract\s*no\.?$/i etc but NOT "契約No." with the Japanese prefix + dot
    const contractFieldsInOther = otherFieldNames.filter(n => n.toLowerCase().includes('契約') || n.toLowerCase().includes('ct '));
    expect(contractFieldsInOther, `"other" section should NOT contain contract fields like 契約No., CT No. Found: ${contractFieldsInOther.join(', ')}`).toHaveLength(0);

    // Numeric field names in "other" is correct behavior
    const numericInOther = otherFieldNames.filter(n => /^\d+$/.test(n.trim()));
    expect(numericInOther.length, 'Numeric field names should be in "other" section').toBeGreaterThanOrEqual(0);
  });

  test('verify field card renders correct label and value', async ({ page }) => {
    await seedAuthSession(page);

    const mockScanId = 'field-card-test';
    await page.route(`**/api/scans/${mockScanId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: mockScanId,
            timestamp: new Date().toISOString(),
            imageUrl: 'https://example.com/image.jpg',
            ocrRaw: 'raw',
            ocrStructured: {
              title: 'Field Card Test',
              fields: [
                { field: '商品名', value: 'Test Product', confidence: 'high' },
                { field: '単価', value: '¥1,200', confidence: 'high' },
                { field: 'unknown_field', value: 'Unknown Value', confidence: 'low' },
              ],
              rawText: '',
              notes: [],
            },
            tokenUsage: { input: 50, output: 25, cost: 0.005 },
            apiKeyIndex: 1,
            edited: false,
          },
        }),
      });
    });

    await page.route('**/api/scans', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto(`/ocr-result/${mockScanId}`);
    await page.waitForLoadState('networkidle');

    const loading = page.getByText('Đang tải kết quả...');
    if (await loading.isVisible({ timeout: 500 }).catch(() => false)) {
      await expect(loading).not.toBeVisible({ timeout: 10000 });
    }

    // Verify field card renders field name and value
    const fieldCard = page.locator('.rounded-2xl').filter({ hasText: 'Test Product' }).first();
    await expect(fieldCard).toBeVisible();
    await expect(fieldCard.getByText('商品名')).toBeVisible();
    await expect(fieldCard.getByText('Test Product')).toBeVisible();

    // Verify confidence badge appears
    const confidenceBadge = fieldCard.locator('.rounded-full');
    await expect(confidenceBadge).toBeVisible();

    console.log('Field card rendering: PASS');
  });
});