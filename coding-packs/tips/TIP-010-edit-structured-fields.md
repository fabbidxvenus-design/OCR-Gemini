# TIP-010: Edit Structured Fields Form

## HEADER
- **TIP-ID**: TIP-010
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Editing
- **Priority**: P0
- **Depends on**: TIP-009, TIP-004
- **Estimated**: 6 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + React Hook Form 7 + Tailwind CSS 3
- **Key files to read first**: 
  - `src/pages/OCRResultPage.tsx` (navigates to edit page)
  - `src/db/queries.ts` (updateScan, markScanAsEdited)
- **Patterns to follow**: React Hook Form for validation, mobile-first form layout, auto-save on blur

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Create edit page for modifying OCR structured fields (title, fields, sizes). Use React Hook Form for form management and validation. Support adding/removing fields and size rows. Mark scan as edited when changes are saved. Provide save and cancel actions. Navigate back to result page after save.

---

## SPECIFICATIONS

### Business Rules

1. **Editable sections**: Title, Structured Fields, Size Table
2. **Field operations**: Edit value, add new field, remove field
3. **Size operations**: Edit size/quantity, add new row, remove row
4. **Validation**: Required fields, numeric quantity, non-empty values
5. **Save behavior**: Update scan in IndexedDB, mark as edited
6. **Cancel behavior**: Discard changes, navigate back
7. **Auto-save**: Optional - save on blur for better UX

### Edit Page

**src/pages/EditPage.tsx**:
```typescript
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { updateScan, markScanAsEdited } from '@/db/queries';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import type { OCRResponse, OCRField, OCRSize } from '@/lib/gemini';

interface EditFormData {
  title: string;
  fields: OCRField[];
  sizes: OCRSize[];
  raw_text: string;
  notes: string[];
}

export default function EditPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);

  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EditFormData>();
  
  const { fields: fieldArray, append: appendField, remove: removeField } = useFieldArray({
    control,
    name: 'fields',
  });

  const { fields: sizeArray, append: appendSize, remove: removeSize } = useFieldArray({
    control,
    name: 'sizes',
  });

  useEffect(() => {
    if (scan) {
      reset({
        title: scan.ocrStructured.title || '',
        fields: scan.ocrStructured.fields || [],
        sizes: scan.ocrStructured.sizes || [],
        raw_text: scan.ocrStructured.raw_text || '',
        notes: scan.ocrStructured.notes || [],
      });
    }
  }, [scan, reset]);

  const onSubmit = async (data: EditFormData) => {
    if (!scanId) return;

    const updatedOCR: OCRResponse = {
      title: data.title,
      fields: data.fields,
      sizes: data.sizes,
      raw_text: data.raw_text,
      notes: data.notes,
    };

    await updateScan(scanId, {
      ocrStructured: updatedOCR,
    });

    await markScanAsEdited(scanId);

    navigate(`/ocr-result/${scanId}`);
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?');
      if (!confirmed) return;
    }
    navigate(`/ocr-result/${scanId}`);
  };

  const handleAddField = () => {
    appendField({ field: '', value: '', confidence: 'medium' });
  };

  const handleAddSize = () => {
    appendSize({ size: '', quantity: 0 });
  };

  if (!scan) {
    return (
      <Layout title="Đang tải...">
        <div className="flex items-center justify-center h-full">
          <p className="text-neutral">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Chỉnh sửa" showBottomNav={false}>
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 pb-24">
        {/* Title */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Nhập tiêu đề"
          />
        </div>

        {/* Structured Fields */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Thông tin</h3>
            <button
              type="button"
              onClick={handleAddField}
              className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>

          <div className="space-y-3">
            {fieldArray.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    {...register(`fields.${index}.field`, { required: 'Tên trường bắt buộc' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tên trường"
                  />
                  <input
                    type="text"
                    {...register(`fields.${index}.value`, { required: 'Giá trị bắt buộc' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Giá trị"
                  />
                  {errors.fields?.[index] && (
                    <p className="text-xs text-error">
                      {errors.fields[index]?.field?.message || errors.fields[index]?.value?.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="flex items-center justify-center w-10 h-10 text-error hover:bg-error/10 rounded-lg transition-colors"
                  aria-label="Xóa trường"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {fieldArray.length === 0 && (
              <p className="text-sm text-neutral text-center py-4">
                Chưa có trường nào. Nhấn "Thêm" để thêm trường mới.
              </p>
            )}
          </div>
        </div>

        {/* Size Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Bảng size</h3>
            <button
              type="button"
              onClick={handleAddSize}
              className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>

          <div className="space-y-3">
            {sizeArray.map((size, index) => (
              <div key={size.id} className="flex gap-2">
                <input
                  type="text"
                  {...register(`sizes.${index}.size`, { required: 'Size bắt buộc' })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Size"
                />
                <input
                  type="number"
                  {...register(`sizes.${index}.quantity`, { 
                    required: 'Số lượng bắt buộc',
                    min: { value: 0, message: 'Số lượng phải >= 0' },
                    valueAsNumber: true,
                  })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="SL"
                />
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="flex items-center justify-center w-10 h-10 text-error hover:bg-error/10 rounded-lg transition-colors"
                  aria-label="Xóa size"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {sizeArray.length === 0 && (
              <p className="text-sm text-neutral text-center py-4">
                Chưa có size nào. Nhấn "Thêm" để thêm size mới.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors touch-target"
            >
              <X className="w-5 h-5" />
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors touch-target"
            >
              <Save className="w-5 h-5" />
              Lưu
            </button>
          </div>
        </div>
      </form>
    </Layout>
  );
}
```

### Add Route

**src/App.tsx** (add route):
```typescript
import EditPage from './pages/EditPage';

// Inside Routes:
<Route
  path="/edit/:scanId"
  element={
    <ProtectedRoute>
      <EditPage />
    </ProtectedRoute>
  }
/>
```

### Validation

1. **Required fields**: Field name, field value, size, quantity
2. **Numeric validation**: Quantity must be number >= 0
3. **Non-empty**: No empty strings for field names/values
4. **Dirty check**: Warn user if unsaved changes on cancel
5. **Save**: Update scan in IndexedDB, mark as edited

### Error Handling

- **Validation errors**: Show inline error messages
- **Save failure**: Log error, show toast (TIP-017)
- **Cancel with changes**: Confirm dialog before discarding
- **Scan not found**: Show loading state, handle gracefully

---

## ACCEPTANCE CRITERIA

### AC-001: Page Load
- **Given**: User navigates to `/edit/abc-123`
- **When**: Page loads
- **Then**:
  - Form loads with existing scan data
  - Title field populated
  - Fields array populated
  - Sizes array populated

### AC-002: Edit Title
- **Given**: Title is "INVOICE #12345"
- **When**: User changes to "INVOICE #67890"
- **Then**:
  - Input value updates
  - Form is marked as dirty
  - Save button is enabled

### AC-003: Edit Field Value
- **Given**: Field "Contract No" has value "ABC123"
- **When**: User changes value to "XYZ789"
- **Then**:
  - Input value updates
  - Form is marked as dirty

### AC-004: Add New Field
- **Given**: User is on edit page
- **When**: User taps "Thêm" button in Thông tin section
- **Then**:
  - New empty field row appears
  - Two inputs: field name and value
  - Delete button appears

### AC-005: Remove Field
- **Given**: Fields array has 3 items
- **When**: User taps delete button on field 2
- **Then**:
  - Field 2 is removed
  - Fields array now has 2 items
  - Form is marked as dirty

### AC-006: Add New Size
- **Given**: User is on edit page
- **When**: User taps "Thêm" button in Bảng size section
- **Then**:
  - New empty size row appears
  - Two inputs: size and quantity
  - Delete button appears

### AC-007: Edit Size Quantity
- **Given**: Size "M" has quantity 10
- **When**: User changes quantity to 15
- **Then**:
  - Input value updates to 15
  - Form is marked as dirty

### AC-008: Validation Error
- **Given**: User adds new field
- **When**: User leaves field name empty and tries to save
- **Then**:
  - Error message shows: "Tên trường bắt buộc"
  - Form does not submit
  - Error displays below input

### AC-009: Save Changes
- **Given**: User has edited title and fields
- **When**: User taps "Lưu" button
- **Then**:
  - Scan record is updated in IndexedDB
  - `edited` flag is set to true
  - User navigates back to `/ocr-result/abc-123`
  - Updated data displays on result page

### AC-010: Cancel with Changes
- **Given**: User has unsaved changes (form is dirty)
- **When**: User taps "Hủy" button
- **Then**:
  - Confirm dialog shows: "Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?"
  - If user confirms: navigate back, discard changes
  - If user cancels: stay on edit page

---

## CONSTRAINTS

### DO NOT:
- ❌ Edit raw text here — that's TIP-011
- ❌ Edit confidence levels — keep original from OCR
- ❌ Implement auto-save — manual save only for MVP
- ❌ Add undo/redo — out of scope
- ❌ Validate field formats (e.g., date, email) — accept any text
- ❌ Implement field reordering — keep original order

### REUSE:
- ✅ React Hook Form for form management
- ✅ useFieldArray for dynamic fields/sizes
- ✅ Layout component from TIP-003
- ✅ useScan hook from TIP-004
- ✅ updateScan, markScanAsEdited from TIP-004
- ✅ Lucide React icons

### SKIP (out of scope for TIP-010):
- ⏭️ Raw text editing (will be in TIP-011)
- ⏭️ Image preview
- ⏭️ Auto-save
- ⏭️ Undo/redo
- ⏭️ Field reordering
- ⏭️ Bulk operations

---

## COMPLETION CHECKLIST

- [ ] `src/pages/EditPage.tsx` created
- [ ] `src/App.tsx` updated with edit route
- [ ] Form loads with existing data
- [ ] Title editing works
- [ ] Field editing works
- [ ] Add/remove fields works
- [ ] Size editing works
- [ ] Add/remove sizes works
- [ ] Validation works (required, numeric)
- [ ] Error messages display
- [ ] Save updates IndexedDB
- [ ] Scan marked as edited
- [ ] Cancel with confirmation works
- [ ] Navigation back to result page works
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-010 | Generated: 2026-05-05 | Vibecode Kit v5.0*
