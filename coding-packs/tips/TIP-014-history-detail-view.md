# TIP-014: History Detail View

## HEADER
- **TIP-ID**: TIP-014
- **Project**: OCR Gemini Mobile Web POC
- **Module**: History
- **Priority**: P0
- **Depends on**: TIP-013, TIP-010
- **Estimated**: 4 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3
- **Key files to read first**: 
  - `src/pages/OCRResultPage.tsx` (similar layout, will reuse components)
  - `src/pages/HistoryPage.tsx` (navigates to detail)
- **Patterns to follow**: Reuse OCRResultPage layout, add delete functionality

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Create history detail page that displays a past scan's full OCR results. Reuse the OCRResultPage component structure but add delete functionality. Show image preview, structured fields, size table, and raw text. Provide actions: edit, export, and delete. Confirm before deleting. Navigate back to history list after delete.

---

## SPECIFICATIONS

### Business Rules

1. **Display**: Reuse OCRResultPage layout and components
2. **Image preview**: Show full captured image at top
3. **Actions**: Edit, Export, Delete
4. **Delete confirmation**: Confirm dialog before deleting
5. **Navigation**: Back to /history after delete
6. **Route**: `/history/:scanId`

### History Detail Page

**src/pages/HistoryDetailPage.tsx**:
```typescript
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { deleteScan } from '@/db/queries';
import { useExport } from '@/hooks/useExport';
import { Edit, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import ConfidenceBadge from '@/components/ocr/ConfidenceBadge';

export default function HistoryDetailPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const { isExporting, exportScan } = useExport();
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
          <p className="text-neutral">Đang tải...</p>
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

  const handleExport = async () => {
    if (!scan) return;
    await exportScan(scan);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn xóa scan này? Hành động này không thể hoàn tác.'
    );
    
    if (!confirmed) return;

    try {
      await deleteScan(scanId!);
      navigate('/history');
    } catch (error) {
      console.error('[Delete] Error:', error);
      alert('Không thể xóa scan. Vui lòng thử lại.');
    }
  };

  return (
    <Layout title="Chi tiết scan">
      <div className="p-4 space-y-4 pb-32">
        {/* Image Preview */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <img
            src={scan.imageDataUrl}
            alt="Scan"
            className="w-full h-auto"
          />
        </div>

        {/* Title */}
        {scan.ocrStructured.title && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-900">
              {scan.ocrStructured.title}
            </h2>
          </div>
        )}

        {/* Edited Badge */}
        {scan.edited && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <p className="text-sm text-warning font-medium">
              ⚠️ Scan này đã được chỉnh sửa
            </p>
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

        {/* Metadata */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Thông tin scan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral">Thời gian:</span>
              <span className="text-gray-900">
                {new Date(scan.timestamp).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral">Token sử dụng:</span>
              <span className="text-gray-900">
                {scan.tokenUsage.input + scan.tokenUsage.output}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral">Chi phí:</span>
              <span className="text-gray-900">
                ${scan.tokenUsage.cost.toFixed(6)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleEdit}
              className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-primary text-primary py-3 px-2 rounded-lg font-medium hover:bg-primary/5 transition-colors touch-target"
            >
              <Edit className="w-5 h-5" />
              <span className="text-xs">Sửa</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex flex-col items-center justify-center gap-1 bg-primary text-white py-3 px-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors touch-target"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs">Xuất</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-error text-error py-3 px-2 rounded-lg font-medium hover:bg-error/5 transition-colors touch-target"
            >
              <Trash2 className="w-5 h-5" />
              <span className="text-xs">Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

### Add Route

**src/App.tsx** (add route):
```typescript
import HistoryDetailPage from './pages/HistoryDetailPage';

// Inside Routes:
<Route
  path="/history/:scanId"
  element={
    <ProtectedRoute>
      <HistoryDetailPage />
    </ProtectedRoute>
  }
/>
```

### Validation

1. **Display**: All scan data displays correctly
2. **Image**: Full image shows at top
3. **Sections**: Collapsible sections work
4. **Actions**: Edit, Export, Delete buttons work
5. **Delete confirmation**: Confirm dialog before delete
6. **Navigation**: Back to history after delete

### Error Handling

- **Scan not found**: Show loading state, handle gracefully
- **Delete failure**: Show alert, stay on page
- **Export failure**: Handle in useExport hook

---

## ACCEPTANCE CRITERIA

### AC-001: Page Load
- **Given**: User navigates to `/history/abc-123`
- **When**: Page loads
- **Then**:
  - HistoryDetailPage renders
  - Scan data loads from IndexedDB
  - Image displays at top
  - All sections display

### AC-002: Image Preview
- **Given**: Scan has imageDataUrl
- **When**: Page renders
- **Then**:
  - Full image displays at top
  - Image is responsive (full width)
  - Image maintains aspect ratio

### AC-003: Edited Badge
- **Given**: Scan has edited=true
- **When**: Page renders
- **Then**:
  - Yellow warning badge displays
  - Text: "⚠️ Scan này đã được chỉnh sửa"

### AC-004: Metadata Section
- **Given**: Scan has timestamp, token usage, cost
- **When**: Metadata section displays
- **Then**:
  - Timestamp shows in Vietnamese format
  - Token usage shows total (input + output)
  - Cost shows with 6 decimal places

### AC-005: Edit Button
- **Given**: User is viewing scan detail
- **When**: User taps "Sửa" button
- **Then**:
  - Navigates to `/edit/abc-123`
  - Edit page loads

### AC-006: Export Button
- **Given**: User is viewing scan detail
- **When**: User taps "Xuất" button
- **Then**:
  - Export process starts
  - Excel file downloads
  - Button shows loading state during export

### AC-007: Delete Confirmation
- **Given**: User is viewing scan detail
- **When**: User taps "Xóa" button
- **Then**:
  - Confirm dialog shows
  - Message: "Bạn có chắc muốn xóa scan này? Hành động này không thể hoàn tác."
  - Two options: OK, Cancel

### AC-008: Delete Confirmed
- **Given**: User confirms delete
- **When**: Delete completes
- **Then**:
  - Scan is removed from IndexedDB
  - User navigates to `/history`
  - Scan no longer appears in history list

### AC-009: Delete Cancelled
- **Given**: User taps "Xóa" button
- **When**: User cancels confirm dialog
- **Then**:
  - Dialog closes
  - Scan is not deleted
  - User remains on detail page

### AC-010: Action Button Layout
- **Given**: User is viewing scan detail
- **When**: Action buttons display
- **Then**:
  - 3 buttons in grid layout
  - Edit (left, blue border)
  - Export (center, blue background)
  - Delete (right, red border)
  - Fixed at bottom above BottomNav

---

## CONSTRAINTS

### DO NOT:
- ❌ Implement undo delete — permanent delete only
- ❌ Add share functionality yet — that's TIP-016
- ❌ Implement image zoom — simple display only
- ❌ Add print functionality — out of scope
- ❌ Implement bulk delete — single delete only
- ❌ Add restore from trash — no trash feature

### REUSE:
- ✅ OCRResultPage layout and structure
- ✅ ConfidenceBadge component from TIP-009
- ✅ Layout component from TIP-003
- ✅ useScan hook from TIP-004
- ✅ deleteScan query from TIP-004
- ✅ useExport hook from TIP-012

### SKIP (out of scope for TIP-014):
- ⏭️ Undo delete
- ⏭️ Share functionality (will be in TIP-016)
- ⏭️ Image zoom
- ⏭️ Print
- ⏭️ Bulk operations
- ⏭️ Trash/restore

---

## COMPLETION CHECKLIST

- [ ] `src/pages/HistoryDetailPage.tsx` created
- [ ] `src/App.tsx` updated with history detail route
- [ ] Page loads with scan data
- [ ] Image preview displays
- [ ] Edited badge shows when edited=true
- [ ] All sections display (fields, sizes, raw text, notes)
- [ ] Metadata section shows timestamp, tokens, cost
- [ ] Collapsible sections work
- [ ] Edit button navigates to edit page
- [ ] Export button triggers export
- [ ] Delete button shows confirmation
- [ ] Delete confirmed removes scan
- [ ] Delete cancelled keeps scan
- [ ] Navigation back to history works
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-014 | Generated: 2026-05-05 | Vibecode Kit v5.0*
