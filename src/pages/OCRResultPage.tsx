import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { useShare } from '@/hooks/useShare';
import { Toast, PrimaryButton, OCRFieldCard } from '@/components/ui';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Edit, Copy, Share2, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { categorizeFields, groupSizeQuantityFields } from '@/lib/fieldCategories';
import scanDisplayName from '@/lib/scanDisplayName';

export default function OCRResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const { scan, isPendingMissing } = useScan(scanId);
  const { isSharing, isCopying, shareOCR, copyOCR } = useShare();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const categorizedFields = useMemo(() => {
    const fields = groupSizeQuantityFields(scan?.ocrStructured?.fields || []);
    const withCategories = categorizeFields(fields);
    return {
      main: withCategories.filter(f => f.category === 'main'),
      other: withCategories.filter(f => f.category === 'other'),
    };
  }, [scan]);

  if (!scan) {
    return (
      <Layout title={isPendingMissing ? 'Không tìm thấy kết quả' : 'Đang tải...'}>
        {isPendingMissing ? (
          <ErrorMessage
            title="Không tìm thấy kết quả OCR"
            message="Kết quả OCR cục bộ có thể đã được lưu vào lịch sử hoặc đã hết hạn sau 7 ngày. Vui lòng kiểm tra lịch sử hoặc chụp lại ảnh."
            onRetry={() => navigate('/camera')}
            autoFocus
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="animate-pulse text-text-secondary">Đang tải kết quả...</p>
          </div>
        )}
      </Layout>
    );
  }

  const handleEdit = () => navigate(`/edit/${scanId}`);

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
      if (!navigator.share) setToast({ message: 'Đã sao chép vào clipboard', type: 'success' });
    } catch {
      setToast({ message: 'Không thể chia sẻ', type: 'error' });
    }
  };

  const groupedFields = [...categorizedFields.main, ...categorizedFields.other];
  const notes = scan.ocrStructured?.notes || [];
  const title = scanDisplayName(scan);
  const lowConfidenceCount = groupedFields.filter(field => field.confidence === 'low' || !field.value).length;
  const needsReview = groupedFields.length === 0 || lowConfidenceCount > 0;

  return (
    <Layout title="Kết quả OCR">
      <div className="space-y-4 pb-36">
        <section className="card-production animate-fade-in p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-light">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-heading text-text-primary">{title}</h2>
              <p className="mt-1 text-small text-text-secondary">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface p-3">
              <p className="text-caption text-text-muted">Trường dữ liệu</p>
              <p className="font-display text-heading-sm text-text-primary">{groupedFields.length}</p>
            </div>
            <div
              className={`rounded-xl p-3 ${needsReview ? 'bg-warning-light' : 'bg-success-light'}`}
              role="status"
              aria-label={needsReview ? 'Trạng thái: Cần kiểm tra' : 'Trạng thái: Sẵn sàng'}
            >
              <p className="text-caption text-text-muted">Trạng thái</p>
              <div className="flex items-center gap-1.5">
                {needsReview ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
                <p className={`text-small font-semibold ${needsReview ? 'text-warning' : 'text-success'}`}>
                  {groupedFields.length === 0 ? 'Không có trường' : lowConfidenceCount > 0 ? `Cần kiểm tra ${lowConfidenceCount}` : 'Sẵn sàng'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {categorizedFields.main.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-heading-sm text-text-primary">Thông tin chính</h3>
              <span className="text-caption font-semibold text-text-muted">{categorizedFields.main.length} trường</span>
            </div>
            {categorizedFields.main.map((field, index) => <OCRFieldCard key={`${field.field}-${index}`} field={field} />)}
          </section>
        )}

        {categorizedFields.other.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-heading-sm text-text-primary">Thông tin khác</h3>
              <span className="text-caption font-semibold text-text-muted">{categorizedFields.other.length} trường</span>
            </div>
            {categorizedFields.other.map((field, index) => <OCRFieldCard key={`${field.field}-${index}`} field={field} />)}
          </section>
        )}


        {notes.length > 0 && (
          <section className="card-production p-4">
            <h3 className="mb-3 font-display text-heading-sm text-text-primary">Ghi chú</h3>
            <div className="space-y-2">
              {notes.map((note, index) => (
                <div key={index} className="flex gap-2 text-small text-text-secondary">
                  <span className="text-primary">•</span>
                  <p className="leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-bottom-nav left-0 right-0 border-t border-card-border bg-surface/95 p-screen safe-area-bottom backdrop-blur-xl md:left-sidebar">
        <div className="mx-auto flex max-w-content gap-2">
          <PrimaryButton variant="secondary" className="flex-1" onClick={handleEdit}>
            <Edit className="mr-2 h-5 w-5" />
            Sửa
          </PrimaryButton>
          <PrimaryButton variant="secondary" className="flex-1" onClick={handleCopy} disabled={isCopying}>
            <Copy className="mr-2 h-5 w-5" />
            Copy
          </PrimaryButton>
          <PrimaryButton className="flex-1" onClick={handleShare} disabled={isSharing}>
            <Share2 className="mr-2 h-5 w-5" />
            Chia sẻ
          </PrimaryButton>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
