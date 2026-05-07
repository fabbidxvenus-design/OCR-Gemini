import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { useShare } from '@/hooks/useShare';
import Toast from '@/components/ui/Toast';
import { Edit, Copy, Share2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { categorizeFields } from '@/lib/fieldCategories';

interface ExpandedSections {
  mainFields: boolean;
  otherFields: boolean;
  sizes: boolean;
  rawText: boolean;
  notes: boolean;
}

export default function OCRResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const { isSharing, isCopying, shareOCR, copyOCR } = useShare();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    mainFields: true,
    otherFields: false,
    sizes: true,
    rawText: false,
    notes: false,
  });

  // Categorize fields into main and other
  const categorizedFields = useMemo(() => {
    const fields = scan?.ocrStructured?.fields || [];
    const withCategories = categorizeFields(fields);
    return {
      main: withCategories.filter(f => f.category === 'main'),
      other: withCategories.filter(f => f.category === 'other'),
    };
  }, [scan]);

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

  const sizes = scan.ocrStructured?.sizes || [];
  const notes = scan.ocrStructured?.notes || [];
  const rawText = scan.ocrStructured?.raw_text || '';
  const title = scan.ocrStructured?.title || '';

  return (
    <Layout title="Kết quả OCR">
      <div className="p-4 space-y-3 pb-36">
        {/* Title Card */}
        {title && (
          <div className="bg-card rounded-xl border border-card-border p-4 shadow-card animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                <p className="text-xs text-text-secondary mt-1">
                  {new Date(scan.timestamp).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Fields */}
        {categorizedFields.main.length > 0 && (
          <div className="bg-card rounded-xl border border-card-border shadow-card overflow-hidden animate-fade-in">
            <button
              onClick={() => toggleSection('mainFields')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Thông tin chính
              </span>
              <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-md">
                {categorizedFields.main.length}
              </span>
            </button>

            {expandedSections.mainFields && (
              <div className="border-t border-card-border">
                <div className="divide-y divide-card-border">
                  {categorizedFields.main.map((field, index) => (
                    <div key={index} className="px-4 py-3.5 flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-secondary font-medium">{field.field}</p>
                        <p className="text-base font-semibold text-text-primary mt-1 break-words">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other Fields */}
        {categorizedFields.other.length > 0 && (
          <div className="bg-card rounded-xl border border-card-border shadow-card overflow-hidden animate-fade-in">
            <button
              onClick={() => toggleSection('otherFields')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Thông tin khác ({categorizedFields.other.length})
              </span>
              {expandedSections.otherFields ? (
                <ChevronUp className="w-4 h-4 text-text-secondary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              )}
            </button>

            {expandedSections.otherFields && (
              <div className="border-t border-card-border">
                <div className="divide-y divide-card-border">
                  {categorizedFields.other.map((field, index) => (
                    <div key={index} className="px-4 py-2.5 flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-secondary">{field.field}</p>
                        <p className="text-sm text-text-primary mt-0.5 break-words">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Size Table */}
        {sizes.length > 0 && (
          <div className="bg-card rounded-xl border border-card-border shadow-card overflow-hidden animate-fade-in">
            <button
              onClick={() => toggleSection('sizes')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Bảng size
              </span>
              <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-md">
                {sizes.length}
              </span>
            </button>

            {expandedSections.sizes && (
              <div className="border-t border-card-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface">
                    <tr>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">Size</th>
                      <th className="text-right py-2.5 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {sizes.map((size, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4 text-base text-text-primary font-medium">{size.size}</td>
                        <td className="py-3 px-4 text-base text-text-primary text-right">{size.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Raw Text */}
        <div className="bg-card rounded-xl border border-card-border shadow-card overflow-hidden animate-fade-in">
          <button
            onClick={() => toggleSection('rawText')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Văn bản gốc
            </span>
            <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${expandedSections.rawText ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.rawText && (
            <div className="border-t border-card-border p-4">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono leading-relaxed">
                {rawText || 'Không có văn bản'}
              </pre>
            </div>
          )}
        </div>

        {/* Notes */}
        {notes.length > 0 && (
          <div className="bg-card rounded-xl border border-card-border shadow-card overflow-hidden animate-fade-in">
            <button
              onClick={() => toggleSection('notes')}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Ghi chú
              </span>
              <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-md">
                {notes.length}
              </span>
            </button>

            {expandedSections.notes && (
              <div className="border-t border-card-border p-4 space-y-2">
                {notes.map((note, index) => (
                  <p key={index} className="text-sm text-text-secondary leading-relaxed">• {note}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-card border-t border-card-border safe-area-bottom">
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-card border border-card-border text-text-primary py-3.5 rounded-xl font-semibold hover:bg-surface transition-colors touch-target active:scale-[0.98]"
          >
            <Edit className="w-5 h-5" />
            Sửa
          </button>
          <button
            onClick={handleCopy}
            disabled={isCopying}
            className="flex-1 flex items-center justify-center gap-2 bg-surface text-text-primary py-3.5 rounded-xl font-medium hover:bg-card-border/50 disabled:opacity-50 transition-colors touch-target"
          >
            <Copy className="w-5 h-5" />
            Sao chép
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors touch-target active:scale-[0.98]"
          >
            <Share2 className="w-5 h-5" />
            Chia sẻ
          </button>
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