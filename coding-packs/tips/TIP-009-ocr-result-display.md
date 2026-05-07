# TIP-009: OCR Result Display (Structured Fields)

## HEADER
- **TIP-ID**: TIP-009
- **Project**: OCR Gemini Mobile Web POC
- **Module**: OCR Display
- **Priority**: P0
- **Depends on**: TIP-007
- **Estimated**: 6 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3 + Lucide React
- **Key files to read first**: 
  - `src/lib/gemini.ts` (OCRResponse interface)
  - `src/pages/CameraPage.tsx` (will navigate to result page)
- **Patterns to follow**: Mobile-first card layout, confidence badges, collapsible sections

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Create OCR result display page that shows structured fields, size table, and raw text from Gemini API response. Display confidence levels with color-coded badges. Organize content in collapsible sections for better mobile UX. Add action buttons for edit and export. Navigate to this page after successful OCR processing.

---

## SPECIFICATIONS

### Business Rules

1. **Display sections**: Title, Structured Fields, Size Table, Raw Text, Notes
2. **Confidence badges**: Color-coded (high=green, medium=yellow, low=red)
3. **Collapsible sections**: Expand/collapse for better mobile UX
4. **Action buttons**: Edit (navigate to edit page), Export (placeholder for TIP-012)
5. **Empty states**: Show placeholder when no data in section
6. **Responsive**: Mobile-first, readable on small screens
7. **Navigation**: From CameraPage after OCR success

### OCR Result Page

**src/pages/OCRResultPage.tsx**:
```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { Edit, Download, ChevronDown, ChevronUp } from 'lucide-react';
import type { ScanRecord } from '@/db/schema';

export default function OCRResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const [expandedSections, setExpandedSections] = useState({
    fields: true,
    sizes: true,
    rawText: false,
    notes: false,
  });

  if (!scan) {
    return (
      <Layout title="Đang tải...">
        <div className="flex items-center justify-center h-full">
          <p className="text-neutral">Đang tải kết quả...</p>
        </div>
      </Layout>
    );
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleEdit = () => {
    navigate(`/edit/${scanId}`);
  };

  const handleExport = () => {
    // Placeholder for TIP-012
    alert('Export functionality will be implemented in TIP-012');
  };

  return (
    <Layout title="Kết quả OCR">
      <div className="p-4 space-y-4 pb-20">
        {/* Title */}
        {scan.ocrStructured.title && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-900">
              {scan.ocrStructured.title}
            </h2>
          </div>
        )}

        {/* Structured Fields */}
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('fields')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h3 className="font-semibold text-gray-900">
              Thông tin ({scan.ocrStructured.fields?.length || 0})
            </h3>
            {expandedSections.fields ? (
              <ChevronUp className="w-5 h-5 text-neutral" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral" />
            )}
          </button>
          
          {expandedSections.fields && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {scan.ocrStructured.fields && scan.ocrStructured.fields.length > 0 ? (
                scan.ocrStructured.fields.map((field, index) => (
                  <div key={index} className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-neutral">{field.field}</p>
                      <p className="text-base font-medium text-gray-900">{field.value}</p>
                    </div>
                    <ConfidenceBadge confidence={field.confidence} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral">Không có thông tin</p>
              )}
            </div>
          )}
        </div>

        {/* Size Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('sizes')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h3 className="font-semibold text-gray-900">
              Bảng size ({scan.ocrStructured.sizes?.length || 0})
            </h3>
            {expandedSections.sizes ? (
              <ChevronUp className="w-5 h-5 text-neutral" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral" />
            )}
          </button>
          
          {expandedSections.sizes && (
            <div className="border-t border-gray-200 p-4">
              {scan.ocrStructured.sizes && scan.ocrStructured.sizes.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-semibold text-gray-900">Size</th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-900">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scan.ocrStructured.sizes.map((size, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 text-base text-gray-900">{size.size}</td>
                        <td className="py-2 text-base text-gray-900 text-right">{size.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-neutral">Không có bảng size</p>
              )}
            </div>
          )}
        </div>

        {/* Raw Text */}
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('rawText')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h3 className="font-semibold text-gray-900">Văn bản gốc</h3>
            {expandedSections.rawText ? (
              <ChevronUp className="w-5 h-5 text-neutral" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral" />
            )}
          </button>
          
          {expandedSections.rawText && (
            <div className="border-t border-gray-200 p-4">
              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                {scan.ocrStructured.raw_text || 'Không có văn bản'}
              </pre>
            </div>
          )}
        </div>

        {/* Notes */}
        {scan.ocrStructured.notes && scan.ocrStructured.notes.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => toggleSection('notes')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="font-semibold text-gray-900">
                Ghi chú ({scan.ocrStructured.notes.length})
              </h3>
              {expandedSections.notes ? (
                <ChevronUp className="w-5 h-5 text-neutral" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral" />
              )}
            </button>
            
            {expandedSections.notes && (
              <div className="border-t border-gray-200 p-4 space-y-2">
                {scan.ocrStructured.notes.map((note, index) => (
                  <p key={index} className="text-sm text-neutral">• {note}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors touch-target"
            >
              <Edit className="w-5 h-5" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors touch-target"
            >
              <Download className="w-5 h-5" />
              Xuất Excel
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

### Confidence Badge Component

**src/components/ocr/ConfidenceBadge.tsx**:
```typescript
interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const styles = {
    high: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-error/10 text-error border-error/20',
  };

  const labels = {
    high: 'Cao',
    medium: 'TB',
    low: 'Thấp',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${styles[confidence]}`}
    >
      {labels[confidence]}
    </span>
  );
}
```

### Update Camera Page Navigation

**src/pages/CameraPage.tsx** (modify handleConfirm):
```typescript
const handleConfirm = async () => {
  if (!capturedImage) return;

  // Compress image before OCR
  const compressionResult = await compress(capturedImage.blob);

  // Process OCR with compressed image
  const scanId = await processImage(
    compressionResult.compressedBlob,
    compressionResult.compressedDataUrl
  );
  
  if (scanId) {
    // Navigate to OCR result page
    navigate(`/ocr-result/${scanId}`);
  }
};
```

### Add Route

**src/App.tsx** (add route):
```typescript
import OCRResultPage from './pages/OCRResultPage';

// Inside Routes:
<Route
  path="/ocr-result/:scanId"
  element={
    <ProtectedRoute>
      <OCRResultPage />
    </ProtectedRoute>
  }
/>
```

### Validation

1. **Display all sections**: Title, Fields, Sizes, Raw Text, Notes
2. **Confidence badges**: Color-coded correctly
3. **Collapsible sections**: Expand/collapse works
4. **Empty states**: Show placeholder when no data
5. **Action buttons**: Fixed at bottom, above BottomNav
6. **Navigation**: From CameraPage with scanId parameter

### Error Handling

- **Scan not found**: Show "Đang tải..." then handle gracefully
- **Missing data**: Show empty state placeholders
- **Navigation error**: React Router handles invalid scanId

---

## ACCEPTANCE CRITERIA

### AC-001: Page Load
- **Given**: User completes OCR successfully with scanId "abc-123"
- **When**: Navigating to `/ocr-result/abc-123`
- **Then**:
  - OCRResultPage renders
  - Scan data loads from IndexedDB
  - All sections display

### AC-002: Title Display
- **Given**: OCR result has title "INVOICE #12345"
- **When**: Page renders
- **Then**:
  - Title displays in white card at top
  - Font size is xl, bold
  - Card has border and padding

### AC-003: Structured Fields
- **Given**: OCR result has 5 fields
- **When**: Fields section is expanded
- **Then**:
  - Section header shows "Thông tin (5)"
  - All 5 fields display with label and value
  - Each field has confidence badge
  - Fields are vertically stacked with spacing

### AC-004: Confidence Badges
- **Given**: Field has confidence "high"
- **When**: Badge renders
- **Then**:
  - Badge shows "Cao"
  - Background is green (success/10)
  - Text is green (success)
  - Border is green (success/20)

### AC-005: Size Table
- **Given**: OCR result has sizes [{"size": "M", "quantity": 10}, {"size": "L", "quantity": 15}]
- **When**: Sizes section is expanded
- **Then**:
  - Section header shows "Bảng size (2)"
  - Table displays with 2 columns: Size, Số lượng
  - Row 1: M, 10
  - Row 2: L, 15
  - Table is full width with proper alignment

### AC-006: Collapsible Sections
- **Given**: Fields section is expanded
- **When**: User taps section header
- **Then**:
  - Section collapses (content hidden)
  - ChevronUp changes to ChevronDown
  - Other sections remain in their current state

### AC-007: Raw Text
- **Given**: OCR result has raw_text with line breaks
- **When**: Raw Text section is expanded
- **Then**:
  - Text displays in monospace font
  - Line breaks are preserved (whitespace-pre-wrap)
  - Text is readable on mobile

### AC-008: Empty States
- **Given**: OCR result has no sizes
- **When**: Sizes section is expanded
- **Then**:
  - Section header shows "Bảng size (0)"
  - Content shows "Không có bảng size"
  - No table displays

### AC-009: Edit Button
- **Given**: User is viewing OCR result
- **When**: User taps "Chỉnh sửa" button
- **Then**:
  - Navigates to `/edit/abc-123`
  - Edit page loads (placeholder for TIP-010)

### AC-010: Export Button
- **Given**: User is viewing OCR result
- **When**: User taps "Xuất Excel" button
- **Then**:
  - Alert shows "Export functionality will be implemented in TIP-012"
  - User remains on current page

---

## CONSTRAINTS

### DO NOT:
- ❌ Implement edit functionality — that's TIP-010
- ❌ Implement export functionality — that's TIP-012
- ❌ Show image preview — focus on text data
- ❌ Add copy-to-clipboard yet — that's TIP-016
- ❌ Implement inline editing — separate edit page
- ❌ Add animations — keep simple for MVP

### REUSE:
- ✅ Layout component from TIP-003
- ✅ useScan hook from TIP-004
- ✅ Lucide React icons
- ✅ Tailwind utility classes
- ✅ OCRResponse interface from TIP-007

### SKIP (out of scope for TIP-009):
- ⏭️ Edit functionality (will be in TIP-010)
- ⏭️ Export functionality (will be in TIP-012)
- ⏭️ Image preview
- ⏭️ Copy to clipboard (will be in TIP-016)
- ⏭️ Share functionality (will be in TIP-016)
- ⏭️ Print functionality

---

## COMPLETION CHECKLIST

- [ ] `src/pages/OCRResultPage.tsx` created
- [ ] `src/components/ocr/ConfidenceBadge.tsx` created
- [ ] `src/pages/CameraPage.tsx` updated to navigate to result page
- [ ] `src/App.tsx` updated with new route
- [ ] Page loads with scan data
- [ ] Title displays (if present)
- [ ] Structured fields display with confidence badges
- [ ] Size table displays
- [ ] Raw text displays
- [ ] Notes display (if present)
- [ ] Collapsible sections work
- [ ] Empty states show correctly
- [ ] Edit button navigates to edit page
- [ ] Export button shows placeholder alert
- [ ] Action buttons fixed at bottom
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-009 | Generated: 2026-05-05 | Vibecode Kit v5.0*
