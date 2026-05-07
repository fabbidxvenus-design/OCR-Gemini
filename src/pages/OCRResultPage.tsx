import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { useShare } from '@/hooks/useShare';
import { Toast, CollapsibleSection, PrimaryButton } from '@/components/ui';
import { Edit, Copy, Share2, FileText } from 'lucide-react';
import { categorizeFields } from '@/lib/fieldCategories';

export default function OCRResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const { isSharing, isCopying, shareOCR, copyOCR } = useShare();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary animate-pulse">Đang tải kết quả...</p>
        </div>
      </Layout>
    );
  }

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
  const title = scan.ocrStructured?.title || 'Kết quả OCR';

  return (
    <Layout title="Kết quả OCR">
      <div className="p-screen space-y-section pb-36">
        {/* Title Card */}
        <div className="bg-card rounded-2xl border border-card-border p-card shadow-card animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-body font-semibold text-text-primary truncate">{title}</h2>
              <p className="text-label text-text-secondary mt-1">
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

        {/* Main Fields */}
        {categorizedFields.main.length > 0 && (
          <CollapsibleSection title="Thông tin chính" count={categorizedFields.main.length}>
            <div className="divide-y divide-card-border -my-4">
              {categorizedFields.main.map((field, index) => (
                <div key={index} className="py-3">
                  <p className="text-label text-text-secondary font-medium uppercase tracking-wide">{field.field}</p>
                  <p className="text-body font-semibold text-text-primary mt-1 break-words">{field.value}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Other Fields */}
        {categorizedFields.other.length > 0 && (
          <CollapsibleSection title="Thông tin khác" count={categorizedFields.other.length} defaultExpanded={false}>
            <div className="divide-y divide-card-border -my-4">
              {categorizedFields.other.map((field, index) => (
                <div key={index} className="py-2.5">
                  <p className="text-label text-text-secondary">{field.field}</p>
                  <p className="text-small text-text-primary mt-0.5 break-words">{field.value}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Size Table */}
        {sizes.length > 0 && (
          <CollapsibleSection title="Bảng size" count={sizes.length}>
            <div className="border border-card-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface">
                  <tr>
                    <th className="py-2.5 px-4 text-label font-semibold text-text-secondary uppercase tracking-wide">Size</th>
                    <th className="py-2.5 px-4 text-label font-semibold text-text-secondary uppercase tracking-wide text-right">Số lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {sizes.map((size, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4 text-body text-text-primary font-medium">{size.size}</td>
                      <td className="py-3 px-4 text-body text-text-primary text-right">{size.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

        {/* Raw Text */}
        <CollapsibleSection title="Văn bản gốc" count={rawText ? 1 : 0} defaultExpanded={false}>
          <div className="p-3 bg-surface rounded-xl">
            <pre className="text-small text-text-primary whitespace-pre-wrap font-mono leading-relaxed">
              {rawText || 'Không có văn bản'}
            </pre>
          </div>
        </CollapsibleSection>

        {/* Notes */}
        {notes.length > 0 && (
          <CollapsibleSection title="Ghi chú" count={notes.length} defaultExpanded={false}>
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div key={index} className="flex gap-2 text-small text-text-secondary">
                  <span className="text-primary">•</span>
                  <p className="leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>

      {/* Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-bottom-nav left-0 right-0 p-screen bg-card border-t border-card-border safe-area-bottom">
        <div className="flex gap-2">
          <PrimaryButton variant="secondary" className="flex-1" onClick={handleEdit}>
            <Edit className="w-5 h-5 mr-2" />
            Sửa
          </PrimaryButton>
          <PrimaryButton variant="secondary" className="flex-1" onClick={handleCopy} disabled={isCopying}>
            <Copy className="w-5 h-5 mr-2" />
            Copy
          </PrimaryButton>
          <PrimaryButton className="flex-1" onClick={handleShare} disabled={isSharing}>
            <Share2 className="w-5 h-5 mr-2" />
            Chia sẻ
          </PrimaryButton>
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
