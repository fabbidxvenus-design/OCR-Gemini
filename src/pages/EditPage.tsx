import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { useScan, updateScan } from '@/hooks/useScans';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { categorizeFields } from '@/lib/fieldCategories';
import { PrimaryButton, InputField, CollapsibleSection } from '@/components/ui';
import type { OCRResponse } from '@/db/schema';

interface EditFormData {
  title: string;
  fields: Array<{ id?: string; field: string; value: string; confidence: string }>;
  sizes: Array<{ id?: string; size: string; quantity: number }>;
  raw_text: string;
}

export default function EditPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const [activeTab, setActiveTab] = useState<'structured' | 'rawText'>('structured');

  const { register, control, handleSubmit, reset, watch, formState: { isDirty } } = useForm<EditFormData>();
  const { fields: fieldArray, append: appendField, remove: removeField } = useFieldArray({ control, name: 'fields' });
  const { fields: sizeArray, append: appendSize, remove: removeSize } = useFieldArray({ control, name: 'sizes' });
  const fieldsWatch = watch('fields');
  const rawText = watch('raw_text');

  const categorizedIndices = useMemo(() => {
    const main: number[] = [];
    const other: number[] = [];
    fieldsWatch?.forEach((field, index) => {
      const category = categorizeFields([{ field: field.field || '' }])[0].category;
      if (category === 'main') main.push(index);
      else other.push(index);
    });
    return { main, other };
  }, [fieldsWatch]);

  useEffect(() => {
    if (scan) {
      reset({
        title: scan.ocrStructured?.title || '',
        fields: (scan.ocrStructured?.fields || []).map((f) => ({ field: f.field, value: f.value, confidence: f.confidence || 'medium' })),
        sizes: (scan.ocrStructured?.sizes || []).map((s) => ({ size: s.size, quantity: s.quantity })),
        raw_text: scan.ocrStructured?.raw_text || '',
      });
    }
  }, [scan, reset]);

  const onSubmit = async (data: EditFormData) => {
    if (!scanId) return;
    const updatedOCR: OCRResponse = {
      title: data.title,
      fields: data.fields.map((f) => ({ field: f.field, value: f.value, confidence: f.confidence as 'high' | 'medium' | 'low' })),
      sizes: data.sizes.map((s) => ({ size: s.size, quantity: s.quantity })),
      raw_text: data.raw_text,
    };
    await updateScan(scanId, { ocrStructured: updatedOCR });
    navigate(`/ocr-result/${scanId}`);
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm('Có thay đổi chưa lưu. Hủy?')) return;
    navigate(`/ocr-result/${scanId}`);
  };

  if (!scan) {
    return (
      <Layout title="Đang tải...">
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary animate-pulse">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Chỉnh sửa" showBottomNav={false}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-card-border bg-card">
          <button type="button" onClick={() => setActiveTab('structured')}
            className={`flex-1 h-12 text-small font-semibold transition-colors ${activeTab === 'structured' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            Thông tin
          </button>
          <button type="button" onClick={() => setActiveTab('rawText')}
            className={`flex-1 h-12 text-small font-semibold transition-colors ${activeTab === 'rawText' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            Văn bản gốc
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-screen space-y-section pb-32 bg-surface">
          {activeTab === 'structured' ? (
            <>
              {/* Title Card */}
              <div className="bg-card rounded-2xl border border-card-border p-card shadow-card">
                <InputField label="Tiêu đề" {...register('title')} placeholder="Nhập tiêu đề scan" />
              </div>

              {/* Main Fields Section */}
              <div className="bg-card rounded-2xl border border-card-border p-card shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-label font-bold uppercase tracking-widest text-text-secondary">Thông tin chính</h3>
                  <button type="button" onClick={() => appendField({ field: '', value: '', confidence: 'medium' })}
                    className="flex items-center gap-1.5 text-primary text-small font-semibold hover:underline">
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>
                <div className="space-y-3">
                  {categorizedIndices.main.map((index) => (
                    <div key={fieldArray[index].id} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <input type="text" {...register(`fields.${index}.field`)} placeholder="Tên trường"
                          className="w-full h-11 px-4 border border-card-border rounded-sm text-small focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        <input type="text" {...register(`fields.${index}.value`)} placeholder="Giá trị"
                          className="w-full h-12 px-4 border border-card-border rounded-sm text-body font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                      </div>
                      <button type="button" onClick={() => removeField(index)}
                        className="w-11 h-11 flex items-center justify-center text-error hover:bg-error-light rounded-sm transition-colors mt-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Fields - Collapsible */}
              {categorizedIndices.other.length > 0 && (
                <CollapsibleSection title="Thông tin khác" count={categorizedIndices.other.length} defaultExpanded={false}>
                  <div className="space-y-3 -my-4">
                    {categorizedIndices.other.map((index) => (
                      <div key={fieldArray[index].id} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input type="text" {...register(`fields.${index}.field`)} placeholder="Tên trường"
                            className="w-full h-10 px-3 border border-card-border rounded-sm text-small focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                          <input type="text" {...register(`fields.${index}.value`)} placeholder="Giá trị"
                            className="w-full h-10 px-3 border border-card-border rounded-sm text-small focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                        </div>
                        <button type="button" onClick={() => removeField(index)}
                          className="w-10 h-10 flex items-center justify-center text-error hover:bg-error-light rounded-sm transition-colors mt-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Size Table */}
              <div className="bg-card rounded-2xl border border-card-border p-card shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-label font-bold uppercase tracking-widest text-text-secondary">Bảng size</h3>
                  <button type="button" onClick={() => appendSize({ size: '', quantity: 0 })}
                    className="flex items-center gap-1.5 text-primary text-small font-semibold hover:underline">
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {sizeArray.map((size, index) => (
                    <div key={size.id} className="flex gap-2">
                      <input type="text" {...register(`sizes.${index}.size`)} placeholder="Size"
                        className="flex-1 h-11 px-4 border border-card-border rounded-sm text-small focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                      <input type="number" {...register(`sizes.${index}.quantity`, { valueAsNumber: true })} placeholder="SL"
                        className="w-20 h-11 px-3 border border-card-border rounded-sm text-small text-center focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                      <button type="button" onClick={() => removeSize(index)}
                        className="w-11 h-11 flex items-center justify-center text-error hover:bg-error-light rounded-sm transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {sizeArray.length === 0 && (
                    <p className="text-small text-text-secondary text-center py-6">Chưa có size nào</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-2xl border border-card-border p-card shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-label font-bold uppercase tracking-widest text-text-secondary">Văn bản gốc</h3>
                <span className="text-label text-text-placeholder">{rawText?.length || 0} ký tự</span>
              </div>
              <textarea {...register('raw_text')} rows={18}
                className="w-full px-4 py-3 border border-card-border rounded-xl text-small font-mono bg-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                placeholder="Văn bản gốc từ OCR..." />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-screen bg-card border-t border-card-border">
          <div className="flex gap-3">
            <PrimaryButton variant="secondary" className="flex-1" onClick={handleCancel}>
              <X className="w-5 h-5 mr-2" /> Hủy
            </PrimaryButton>
            <PrimaryButton type="submit" className="flex-1">
              <Save className="w-5 h-5 mr-2" /> Lưu
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Layout>
  );
}