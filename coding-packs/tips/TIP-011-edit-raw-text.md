# TIP-011: Edit Raw Text + Size Table

## HEADER
- **TIP-ID**: TIP-011
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Editing
- **Priority**: P0
- **Depends on**: TIP-009, TIP-004
- **Estimated**: 4 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3
- **Key files to read first**: 
  - `src/pages/EditPage.tsx` (will be extended)
  - `src/db/queries.ts` (updateScan)
- **Patterns to follow**: Textarea for raw text, simple table editor for sizes

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Extend the edit page to support raw text editing in a textarea and a simplified size table editor. Add tab navigation between structured fields and raw text views. Allow users to edit the raw OCR text directly and update the size table. Save changes to IndexedDB when user saves the form.

---

## SPECIFICATIONS

### Business Rules

1. **Tab navigation**: Switch between "Thông tin" (structured) and "Văn bản gốc" (raw text)
2. **Raw text editor**: Multiline textarea with preserved formatting
3. **Size table editor**: Already implemented in TIP-010
4. **Save behavior**: Update both structured and raw text in single save
5. **Character count**: Show character count for raw text
6. **Preserve formatting**: Maintain line breaks and spacing

### Updated Edit Page with Tabs

**src/pages/EditPage.tsx** (extend existing):
```typescript
import { useEffect, useState } from 'react';
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

type TabType = 'structured' | 'rawText';

export default function EditPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const [activeTab, setActiveTab] = useState<TabType>('structured');

  const { register, control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<EditFormData>();
  
  const { fields: fieldArray, append: appendField, remove: removeField } = useFieldArray({
    control,
    name: 'fields',
  });

  const { fields: sizeArray, append: appendSize, remove: removeSize } = useFieldArray({
    control,
    name: 'sizes',
  });

  const rawText = watch('raw_text');

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('structured')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'structured'
                ? 'text-primary border-b-2 border-primary'
                : 'text-neutral hover:text-gray-900'
            }`}
          >
            Thông tin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rawText')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'rawText'
                ? 'text-primary border-b-2 border-primary'
                : 'text-neutral hover:text-gray-900'
            }`}
          >
            Văn bản gốc
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
          {activeTab === 'structured' ? (
            <>
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
            </>
          ) : (
            <>
              {/* Raw Text Editor */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="raw_text" className="block text-sm font-medium text-gray-700">
                    Văn bản gốc
                  </label>
                  <span className="text-xs text-neutral">
                    {rawText?.length || 0} ký tự
                  </span>
                </div>
                <textarea
                  id="raw_text"
                  {...register('raw_text')}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Nhập văn bản gốc từ OCR..."
                />
                <p className="text-xs text-neutral mt-2">
                  Chỉnh sửa văn bản gốc từ kết quả OCR. Các thay đổi sẽ được lưu khi bạn nhấn "Lưu".
                </p>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-gray-200">
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

### Validation

1. **Tab switching**: Preserve form state when switching tabs
2. **Raw text**: No validation, accept any text
3. **Character count**: Update in real-time
4. **Save**: Update both structured and raw text
5. **Formatting**: Preserve line breaks and spacing

### Error Handling

- **No errors specific to raw text**: Accept any input
- **Form state**: Preserve across tab switches
- **Save failure**: Handle in TIP-017

---

## ACCEPTANCE CRITERIA

### AC-001: Tab Navigation
- **Given**: User is on edit page
- **When**: Page loads
- **Then**:
  - Two tabs display: "Thông tin" and "Văn bản gốc"
  - "Thông tin" tab is active by default
  - Active tab has blue underline and text

### AC-002: Switch to Raw Text Tab
- **Given**: User is on "Thông tin" tab
- **When**: User taps "Văn bản gốc" tab
- **Then**:
  - Tab switches to raw text view
  - Textarea displays with raw_text content
  - Character count shows
  - Structured fields are hidden

### AC-003: Edit Raw Text
- **Given**: Raw text is "INVOICE\nContract: ABC123"
- **When**: User changes to "INVOICE\nContract: XYZ789"
- **Then**:
  - Textarea value updates
  - Character count updates
  - Form is marked as dirty

### AC-004: Character Count
- **Given**: Raw text has 150 characters
- **When**: Textarea displays
- **Then**:
  - Character count shows "150 ký tự"
  - Updates in real-time as user types

### AC-005: Preserve Line Breaks
- **Given**: Raw text has multiple lines with line breaks
- **When**: User edits and saves
- **Then**:
  - Line breaks are preserved in database
  - When viewing result page, line breaks display correctly

### AC-006: Switch Back to Structured
- **Given**: User is on "Văn bản gốc" tab
- **When**: User taps "Thông tin" tab
- **Then**:
  - Tab switches back to structured view
  - All form fields retain their values
  - No data is lost

### AC-007: Save Both Tabs
- **Given**: User edits structured fields and raw text
- **When**: User taps "Lưu" button
- **Then**:
  - Both structured data and raw text are saved
  - Scan record updated in IndexedDB
  - User navigates back to result page

### AC-008: Textarea Sizing
- **Given**: User is on raw text tab
- **When**: Textarea displays
- **Then**:
  - Textarea has 20 rows
  - Monospace font for better readability
  - Resize is disabled (resize-none)
  - Scrollable if content exceeds height

### AC-009: Empty Raw Text
- **Given**: Raw text is empty
- **When**: User views raw text tab
- **Then**:
  - Placeholder shows: "Nhập văn bản gốc từ OCR..."
  - Character count shows "0 ký tự"
  - No error message

### AC-010: Help Text
- **Given**: User is on raw text tab
- **When**: Viewing textarea
- **Then**:
  - Help text displays below textarea
  - Text: "Chỉnh sửa văn bản gốc từ kết quả OCR. Các thay đổi sẽ được lưu khi bạn nhấn 'Lưu'."

---

## CONSTRAINTS

### DO NOT:
- ❌ Add rich text editor — plain text only
- ❌ Implement markdown preview — raw text only
- ❌ Add text formatting buttons — keep simple
- ❌ Validate raw text format — accept any input
- ❌ Auto-sync structured fields from raw text — manual only
- ❌ Add spell check — browser default is fine

### REUSE:
- ✅ Existing EditPage from TIP-010
- ✅ React Hook Form watch for character count
- ✅ Tab pattern (common UI pattern)
- ✅ Tailwind utility classes

### SKIP (out of scope for TIP-011):
- ⏭️ Rich text editor
- ⏭️ Markdown support
- ⏭️ Text formatting toolbar
- ⏭️ Auto-sync between structured and raw text
- ⏭️ Spell check
- ⏭️ Find and replace

---

## COMPLETION CHECKLIST

- [ ] `src/pages/EditPage.tsx` updated with tabs
- [ ] Tab navigation works
- [ ] Raw text textarea displays
- [ ] Character count displays and updates
- [ ] Edit raw text works
- [ ] Line breaks preserved
- [ ] Switch between tabs preserves form state
- [ ] Save updates both structured and raw text
- [ ] Textarea has monospace font
- [ ] Help text displays
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-011 | Generated: 2026-05-05 | Vibecode Kit v5.0*
