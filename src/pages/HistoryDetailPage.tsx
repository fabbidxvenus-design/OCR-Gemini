import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan, deleteScan } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import ConfidenceBadge from '@/components/ocr/ConfidenceBadge';
import { Edit, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandedSections {
  fields: boolean;
  sizes: boolean;
  rawText: boolean;
  notes: boolean;
}

export default function HistoryDetailPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const { isExporting, exportScan } = useExport();

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
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

  const toggleSection = (section: keyof ExpandedSections) => {
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

  const fields = scan.ocrStructured?.fields || [];
  const sizes = scan.ocrStructured?.sizes || [];
  const notes = scan.ocrStructured?.notes || [];
  const rawText = scan.ocrStructured?.raw_text || '';
  const title = scan.ocrStructured?.title || '';

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
        {title && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-900">
              {title}
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
              Thông tin ({fields.length})
            </h3>
            {expandedSections.fields ? (
              <ChevronUp className="w-5 h-5 text-neutral" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral" />
            )}
          </button>

          {expandedSections.fields && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {fields.length > 0 ? (
                fields.map((field, index) => (
                  <div key={index} className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-neutral">{field.field}</p>
                      <p className="text-base font-medium text-gray-900">{field.value}</p>
                    </div>
                    <ConfidenceBadge confidence={field.confidence || 'low'} />
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
              Bảng size ({sizes.length})
            </h3>
            {expandedSections.sizes ? (
              <ChevronUp className="w-5 h-5 text-neutral" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral" />
            )}
          </button>

          {expandedSections.sizes && (
            <div className="border-t border-gray-200 p-4">
              {sizes.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-semibold text-gray-900">Size</th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-900">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size, index) => (
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
                {rawText || 'Không có văn bản'}
              </pre>
            </div>
          )}
        </div>

        {/* Notes */}
        {notes.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => toggleSection('notes')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="font-semibold text-gray-900">
                Ghi chú ({notes.length})
              </h3>
              {expandedSections.notes ? (
                <ChevronUp className="w-5 h-5 text-neutral" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral" />
              )}
            </button>

            {expandedSections.notes && (
              <div className="border-t border-gray-200 p-4 space-y-2">
                {notes.map((note, index) => (
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