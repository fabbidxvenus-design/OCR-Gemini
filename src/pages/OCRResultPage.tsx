import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { useShare } from '@/hooks/useShare';
import Toast from '@/components/ui/Toast';
import ConfidenceBadge from '@/components/ocr/ConfidenceBadge';
import { Edit, Download, Copy, Share2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface ExpandedSections {
  fields: boolean;
  sizes: boolean;
  rawText: boolean;
  notes: boolean;
}

export default function OCRResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const { isExporting, error: exportError, exportScan } = useExport();
  const { isSharing, isCopying, shareOCR, copyOCR } = useShare();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
          <p className="text-neutral">Đang tải kết quả...</p>
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
    await exportScan(scan);
  };

  const handleCopy = async () => {
    try {
      await copyOCR(scan.ocrStructured);
      setToast({ message: 'Đã sao chép vào clipboard', type: 'success' });
    } catch {
      setToast({ message: 'Không thể sao chép', type: 'error' });
    }
  };

  const handleShare = async () => {
    try {
      await shareOCR(scan.ocrStructured, scan.ocrStructured?.title);
      if (!navigator.share) {
        setToast({ message: 'Đã sao chép vào clipboard', type: 'success' });
      }
    } catch {
      setToast({ message: 'Không thể chia sẻ', type: 'error' });
    }
  };

  const fields = scan.ocrStructured?.fields || [];
  const sizes = scan.ocrStructured?.sizes || [];
  const notes = scan.ocrStructured?.notes || [];
  const rawText = scan.ocrStructured?.raw_text || '';
  const title = scan.ocrStructured?.title || '';

  return (
    <Layout title="Kết quả OCR">
      <div className="p-4 space-y-4 pb-20">
        {/* Export Error */}
        {exportError && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <p className="text-error text-sm">{exportError}</p>
          </div>
        )}

        {/* Title */}
        {title && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
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

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={handleCopy}
              disabled={isCopying}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors touch-target"
            >
              <Copy className="w-5 h-5" />
              Sao chép
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors touch-target"
            >
              <Share2 className="w-5 h-5" />
              Chia sẻ
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary py-3 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors touch-target"
            >
              <Edit className="w-5 h-5" />
              Sửa
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors touch-target"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Xuất
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}