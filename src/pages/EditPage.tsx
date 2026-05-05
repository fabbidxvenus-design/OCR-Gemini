import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { useScan, updateScan, markScanAsEdited } from '@/hooks/useScans';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import type { OCRResponse } from '@/db/schema';

interface EditFormData {
  title: string;
  fields: Array<{ id?: string; field: string; value: string; confidence: string }>;
  sizes: Array<{ id?: string; size: string; quantity: number }>;
  raw_text: string;
}

type TabType = 'structured' | 'rawText';

export default function EditPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const [activeTab, setActiveTab] = useState<TabType>('structured');

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditFormData>();

  const {
    fields: fieldArray,
    append: appendField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: 'fields',
  });

  const {
    fields: sizeArray,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: 'sizes',
  });

  const rawText = watch('raw_text');

  useEffect(() => {
    if (scan) {
      reset({
        title: scan.ocrStructured?.title || '',
        fields: (scan.ocrStructured?.fields || []).map((f) => ({
          field: f.field,
          value: f.value,
          confidence: f.confidence || 'medium',
        })),
        sizes: (scan.ocrStructured?.sizes || []).map((s) => ({
          size: s.size,
          quantity: s.quantity,
        })),
        raw_text: scan.ocrStructured?.raw_text || '',
      });
    }
  }, [scan, reset]);

  const onSubmit = async (data: EditFormData) => {
    if (!scanId) return;

    const updatedOCR: OCRResponse = {
      title: data.title,
      fields: data.fields.map((f) => ({
        field: f.field,
        value: f.value,
        confidence: f.confidence as 'high' | 'medium' | 'low',
      })),
      sizes: data.sizes.map((s) => ({
        size: s.size,
        quantity: s.quantity,
      })),
      raw_text: data.raw_text,
    };

    await updateScan(scanId, { ocrStructured: updatedOCR });
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