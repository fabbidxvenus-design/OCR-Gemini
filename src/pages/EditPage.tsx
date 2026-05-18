import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { useScan, updateScan } from '@/hooks/useScans';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { SCAN_FIELDS, findScanField } from '@/lib/scanFields';
import { PrimaryButton, InputField } from '@/components/ui';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { OCRResponse } from '@/db/schema';

interface EditFormData {
  title: string;
  barcode: string;
  lotNo: string;
  productName: string;
  quantity: string;
  contractNo: string;
  otherFields: Array<{ id?: string; field: string; value: string; confidence: string }>;
  sizes: Array<{ id?: string; size: string; quantity: number }>;
  raw_text: string;
}

export default function EditPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const { scan } = useScan(scanId);
  const [activeTab, setActiveTab] = useState<'structured' | 'rawText'>('structured');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, control, handleSubmit, reset, getValues, formState: { isDirty } } = useForm<EditFormData>();
  const { fields: otherFieldArray, append: appendOtherField, remove: removeOtherField } = useFieldArray({ control, name: 'otherFields' });
  const { fields: sizeArray, append: appendSize, remove: removeSize } = useFieldArray({ control, name: 'sizes' });


  useEffect(() => {
    if (scan) {
      const ocrFields = scan.ocrStructured?.fields || [];
      // Map each SCAN_FIELDS key to its value from OCR
      const fieldMap: Record<string, string> = {
        barcode: '',
        lotNo: '',
        productName: '',
        quantity: '',
        contractNo: '',
      };
      for (const sf of SCAN_FIELDS) {
        const matched = ocrFields.find((f) => {
          const matched = findScanField(f.field);
          return matched?.key === sf.key;
        });
        if (matched) fieldMap[sf.key] = matched.value || '';
      }

      reset({
        title: scan.ocrStructured?.title || '',
        barcode: fieldMap.barcode,
        lotNo: fieldMap.lotNo,
        productName: fieldMap.productName,
        quantity: fieldMap.quantity,
        contractNo: fieldMap.contractNo,
        otherFields: ocrFields.filter((f) => !findScanField(f.field)).map((f) => ({ field: f.field, value: f.value || '', confidence: f.confidence || 'medium' })),
        sizes: (scan.ocrStructured?.sizes || []).map((s) => ({ size: s.size, quantity: s.quantity })),
        raw_text: scan.ocrStructured?.raw_text || '',
      });
    }
  }, [scan, reset]);

  const onSubmit = async (data: EditFormData) => {
    if (!scanId) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      const requiredFields = SCAN_FIELDS.map((sf) => ({
        field: sf.labelVi,
        value: data[sf.key as 'barcode' | 'lotNo' | 'productName' | 'quantity' | 'contractNo'] || '',
        confidence: 'high' as const,
        category: 'main' as const,
      }));
      const extraFields = data.otherFields
        .filter((f) => f.field && f.value)
        .map((f) => ({ field: f.field, value: f.value, confidence: f.confidence as 'high' | 'medium' | 'low' }));

      const updatedOCR: OCRResponse = {
        title: data.title,
        fields: [...requiredFields, ...extraFields],
        sizes: data.sizes.map((s) => ({ size: s.size, quantity: s.quantity })),
        raw_text: data.raw_text,
      };
      await updateScan(scanId, { ocrStructured: updatedOCR });
      navigate(`/ocr-result/${scanId}`);
    } catch {
      setSaveError('Không thể lưu thay đổi. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('Có thay đổi chưa lưu. Hủy?')) return;
    navigate(`/ocr-result/${scanId}`);
  };

  if (!scan) {
    return (
      <Layout title="Đang tải...">
        <div className="flex h-64 items-center justify-center">
          <p className="animate-pulse text-text-secondary">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Chỉnh sửa" showBottomNav={false}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
        <div className="flex border-b border-card-border bg-card">
          <button
            type="button"
            onClick={() => setActiveTab('structured')}
            aria-pressed={activeTab === 'structured'}
            aria-label={activeTab === 'structured' ? "Đang ở tab Thông tin" : undefined}
            className={`h-12 flex-1 text-small font-semibold transition-colors ${activeTab === 'structured' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Thông tin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rawText')}
            aria-pressed={activeTab === 'rawText'}
            aria-label={activeTab === 'rawText' ? "Đang ở tab Văn bản gốc" : undefined}
            className={`h-12 flex-1 text-small font-semibold transition-colors ${activeTab === 'rawText' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Văn bản gốc
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-surface px-4 md:px-6 pb-32">
          {saveError && (
            <ErrorMessage
              message={saveError}
              className="card-production p-4"
              autoFocus
            />
          )}
          {activeTab === 'structured' ? (
            <>
              <div className="card-production p-4">
                <InputField label="Tiêu đề" {...register('title')} placeholder="Nhập tiêu đề scan" />
              </div>

              <section className="space-y-3">
                <h3 className="font-display text-heading-sm text-text-primary">Thông tin chính</h3>
                {SCAN_FIELDS.map((field) => (
                  <div key={field.key} className="card-production p-3">
                    <InputField
                      label={field.labelVi}
                      {...register(field.key)}
                      placeholder={field.labelEn}
                      className="font-display text-body-lg font-semibold"
                    />
                  </div>
                ))}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-heading-sm text-text-primary">Thông tin khác</h3>
                  <button
                    type="button"
                    onClick={() => appendOtherField({ field: '', value: '', confidence: 'medium' })}
                    className="flex items-center gap-1.5 text-small font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" /> Thêm
                  </button>
                </div>
                {otherFieldArray.map((field, index) => (
                  <div key={field.id} className="card-production flex gap-2 p-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        {...register(`otherFields.${index}.field`)}
                        placeholder="Tên trường"
                        className="field-production w-full"
                      />
                      <input
                        type="text"
                        {...register(`otherFields.${index}.value`)}
                        placeholder="Giá trị"
                        className="field-production w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOtherField(index)}
                      className="touch-target flex items-center justify-center rounded-xl text-error transition-colors hover:bg-error-light"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </section>

              <section className="card-production p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-heading-sm text-text-primary">Bảng size</h3>
                  <button
                    type="button"
                    onClick={() => appendSize({ size: '', quantity: 0 })}
                    className="flex items-center gap-1.5 text-small font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" /> Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {sizeArray.map((size, index) => (
                    <div key={size.id} className="flex gap-2">
                      <input
                        type="text"
                        {...register(`sizes.${index}.size`)}
                        placeholder="Size"
                        className="field-production flex-1"
                      />
                      <input
                        type="number"
                        {...register(`sizes.${index}.quantity`, { valueAsNumber: true })}
                        placeholder="SL"
                        className="field-production w-20 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="touch-target flex items-center justify-center rounded-xl text-error transition-colors hover:bg-error-light"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {sizeArray.length === 0 && (
                    <p className="py-6 text-center text-small text-text-secondary">Chưa có size nào</p>
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className="card-production p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-heading-sm text-text-primary">Văn bản gốc</h3>
                <span className="text-caption text-text-muted">{getValues('raw_text')?.length || 0} ký tự</span>
              </div>
              <textarea
                {...register('raw_text')}
                rows={18}
                className="w-full resize-none rounded-xl border border-field-border bg-surface px-4 py-3 font-mono text-small outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
                placeholder="Văn bản gốc từ OCR..."
              />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-card-border bg-card px-4 md:px-6 safe-area-bottom md:left-sidebar">
          <div className="mx-auto flex max-w-content gap-3">
            <PrimaryButton variant="secondary" className="flex-1" onClick={handleCancel}>
              <X className="mr-2 h-5 w-5" /> Hủy
            </PrimaryButton>
            <PrimaryButton type="submit" className="flex-1" disabled={isSaving}>
              <Save className="mr-2 h-5 w-5" /> Lưu
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Layout>
  );
}
