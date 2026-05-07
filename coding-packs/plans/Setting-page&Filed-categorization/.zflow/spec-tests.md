# SPEC Phase: Test Specifications (Red Gate)

## TIP-037: Settings Page - Model Selector

### Given-When-Then Specs

#### Spec 1: Model Tier Selection Persistence
**Given** user is on Settings page  
**When** user selects "High" tier and navigates away  
**Then** selection persists in IndexedDB and is restored on return

**Test**: `src/__tests__/settings/model-selection.test.ts`
```typescript
describe('Model Selection Persistence', () => {
  it('should persist selected tier to IndexedDB', async () => {
    // Arrange
    const { getByRole } = render(<SettingsPage />);
    
    // Act
    const highRadio = getByRole('radio', { name: /high quality/i });
    fireEvent.click(highRadio);
    
    // Assert
    const settings = await db.settings.get('app-settings');
    expect(settings?.selectedModelTier).toBe('high');
  });
  
  it('should restore selected tier on page load', async () => {
    // Arrange
    await db.settings.put({
      id: 'app-settings',
      selectedModelTier: 'free',
      lastUpdated: new Date()
    });
    
    // Act
    const { getByRole } = render(<SettingsPage />);
    
    // Assert
    const freeRadio = getByRole('radio', { name: /free/i });
    expect(freeRadio).toBeChecked();
  });
});
```

#### Spec 2: Token Usage Statistics Display
**Given** user has scans from multiple tiers  
**When** user views Settings page  
**Then** token usage table shows correct aggregated statistics per tier

**Test**: `src/__tests__/settings/token-stats.test.ts`
```typescript
describe('Token Usage Statistics', () => {
  it('should aggregate token usage per tier', async () => {
    // Arrange
    await db.scans.bulkAdd([
      { id: '1', modelTier: 'free', tokenUsage: { input: 1000, output: 500, cost: 0 }, /* ... */ },
      { id: '2', modelTier: 'default', tokenUsage: { input: 2000, output: 1000, cost: 0.005 }, /* ... */ },
      { id: '3', modelTier: 'default', tokenUsage: { input: 1500, output: 800, cost: 0.004 }, /* ... */ }
    ]);
    
    // Act
    const { getByText } = render(<SettingsPage />);
    
    // Assert
    expect(getByText(/free.*1.*1.5K.*\$0\.000/i)).toBeInTheDocument();
    expect(getByText(/default.*2.*5.3K.*\$0\.009/i)).toBeInTheDocument();
  });
});
```

#### Spec 3: New Scan Uses Selected Model
**Given** user selects "Free" tier  
**When** user performs a new scan  
**Then** scan uses `openrouter/auto` model with simplified prompt

**Test**: `src/__tests__/integration/model-tier-integration.test.ts`
```typescript
describe('Model Tier Integration', () => {
  it('should use selected model tier for new scans', async () => {
    // Arrange
    await db.settings.put({
      id: 'app-settings',
      selectedModelTier: 'free',
      lastUpdated: new Date()
    });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{}' } }] })
    });
    global.fetch = mockFetch;
    
    // Act
    await processOCR(mockImageBlob);
    
    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"model":"openrouter/auto"')
      })
    );
  });
});
```

---

## TIP-038: Field Categorization - Main vs Other

### Given-When-Then Specs

#### Spec 1: Field Categorization Logic
**Given** OCR detects fields including "Barcode" and "Ngày sản xuất"  
**When** categorization runs  
**Then** "Barcode" is categorized as 'main' and "Ngày sản xuất" as 'other'

**Test**: `src/__tests__/lib/fieldCategories.test.ts`
```typescript
describe('Field Categorization', () => {
  it('should categorize Barcode as main', () => {
    expect(categorizeField('Barcode')).toBe('main');
    expect(categorizeField('Bar code')).toBe('main');
    expect(categorizeField('Mã vạch')).toBe('main');
  });
  
  it('should categorize Lot No as main', () => {
    expect(categorizeField('Lot No')).toBe('main');
    expect(categorizeField('Lot Number')).toBe('main');
    expect(categorizeField('Số lô')).toBe('main');
  });
  
  it('should categorize unknown fields as other', () => {
    expect(categorizeField('Ngày sản xuất')).toBe('other');
    expect(categorizeField('Xuất xứ')).toBe('other');
  });
  
  it('should handle all main field patterns', () => {
    const mainFields = [
      'Barcode', 'Lot No', 'Tên sản phẩm', 'Mã sản phẩm',
      'Số lượng', 'Size', 'Contract No', 'Số hợp đồng'
    ];
    
    mainFields.forEach(field => {
      expect(categorizeField(field)).toBe('main');
    });
  });
});
```

#### Spec 2: UI Display with Categories
**Given** OCR result has 3 main fields and 5 other fields  
**When** user views OCR result page  
**Then** Main section displays 3 fields prominently, Other section is collapsible with 5 fields

**Test**: `src/__tests__/pages/OCRResultPage.test.ts`
```typescript
describe('OCR Result Display with Categories', () => {
  it('should display main fields in prominent section', () => {
    // Arrange
    const mockScan = {
      ocrStructured: {
        fields: [
          { field: 'Barcode', value: '123456', category: 'main' },
          { field: 'Lot No', value: 'LOT-001', category: 'main' },
          { field: 'Ngày sản xuất', value: '2026-05-01', category: 'other' }
        ]
      }
    };
    
    // Act
    const { getByText, queryByText } = render(<OCRResultPage scan={mockScan} />);
    
    // Assert
    expect(getByText('Thông tin chính')).toBeInTheDocument();
    expect(getByText('Barcode')).toBeInTheDocument();
    expect(getByText('Lot No')).toBeInTheDocument();
  });
  
  it('should display other fields in collapsible section', () => {
    // Arrange
    const mockScan = {
      ocrStructured: {
        fields: [
          { field: 'Ngày sản xuất', value: '2026-05-01', category: 'other' },
          { field: 'Xuất xứ', value: 'Vietnam', category: 'other' }
        ]
      }
    };
    
    // Act
    const { getByText, getByRole } = render(<OCRResultPage scan={mockScan} />);
    
    // Assert
    expect(getByText(/Thông tin khác.*2/i)).toBeInTheDocument();
    const toggleButton = getByRole('button', { name: /thông tin khác/i });
    expect(toggleButton).toBeInTheDocument();
  });
});
```

#### Spec 3: Category Persistence
**Given** user edits a scan with categorized fields  
**When** user saves changes  
**Then** field categories are preserved in IndexedDB

**Test**: `src/__tests__/integration/field-category-persistence.test.ts`
```typescript
describe('Field Category Persistence', () => {
  it('should preserve categories when saving edited scan', async () => {
    // Arrange
    const scanId = 'test-scan-1';
    await db.scans.add({
      id: scanId,
      ocrStructured: {
        fields: [
          { field: 'Barcode', value: '123', category: 'main' },
          { field: 'Notes', value: 'Test', category: 'other' }
        ]
      },
      /* ... */
    });
    
    // Act
    const scan = await db.scans.get(scanId);
    scan.ocrStructured.fields[0].value = '456'; // Edit value
    await db.scans.put(scan);
    
    // Assert
    const updated = await db.scans.get(scanId);
    expect(updated.ocrStructured.fields[0].category).toBe('main');
    expect(updated.ocrStructured.fields[1].category).toBe('other');
  });
});
```

---

## Red Gate Status: FAIL (Expected)

All tests written above should **FAIL** before implementation begins. This confirms:
- ✅ Test infrastructure is working
- ✅ Specs are executable
- ✅ We're testing the right behavior

**Next Phase**: DECOMPOSE → Break down implementation tasks

---

*SPEC phase complete | Red Gate: FAIL (as expected) | Ready for DECOMPOSE*
