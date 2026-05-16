import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan } from '@/hooks/useScans';
import { useShare } from '@/hooks/useShare';
import { Toast, PrimaryButton, SkeletonLine, SkeletonBlock, ErrorMessage, ScanFieldsTable } from '@/components/ui';
import { Edit, Copy, Share2, FileText, AlertTriangle, CheckCircle2, Camera } from 'lucide-react';
import { categorizeFields, groupSizeQuantityFields } from '@/lib/fieldCategories';
import scanDisplayName from '@/lib/scanDisplayName';

export default function OCRResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const { scan, isPendingMissing, error } = useScan(scanId);
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

  if (isPendingMissing) {
    return (
      <Layout title="Không tìm thấy kết quả">
        <ErrorMessage
          title="Không tìm thấy kết quả OCR"
          message="Kết quả OCR cục bộ có thể đã được lưu vào lịch sử hoặc đã hết hạn sau 7 ngày. Vui lòng kiểm tra lịch sử hoặc chụp lại ảnh."
          onRetry={() => navigate('/camera')}
          autoFocus
        />
      </Layout>
    );
  }

  if (!scan) {
    return (
      <Layout title="Đang tải...">
        <div className="space-y-4">
          <div className="card-production p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-surface animate-pulse" />
              <div className="flex-1 space-y-2">
                <SkeletonLine width="60%" />
                <SkeletonLine width="40%" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SkeletonBlock className="h-16 rounded-xl" />
              <SkeletonBlock className="h-16 rounded-xl" />
            </div>
          </div>
          <div className="card-production p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonLine width="30%" />
                <SkeletonLine width="50%" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

if (error) {
    return (
      <Layout title="Không thể tải kết quả">
        <ErrorMessage
          title="Không thể tải kết quả OCR"
          message={error}
          onRetry={() => window.location.reload()}
          autoFocus
        />
      </Layout>
    );
  }
  const handleEdit = () => navigate(`/edit/${scanId}`);
  const handleRetake = () => navigate('/camera');

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
    <Layout title="Kết quả OCR" showBottomNav={false}>
      <div className="space-y-4 pb-40">
        {scan.imageDataUrl && (
          <section className="card-production overflow-hidden animate-fade-in">
            <div className="relative bg-surface">
              <img src={scan.imageDataUrl} alt="Scan" className="h-auto max-h-[34vh] w-full object-contain" />
              <div className="absolute left-3 top-3 rounded-full bg-ink/60 px-3 py-1 text-caption font-semibold text-white backdrop-blur-sm">
                Ảnh đã quét
              </div>
            </div>
          </section>
        )}

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

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-surface p-3">
              <p className="text-caption text-text-muted">Trường</p>
              <p className="font-display text-heading-sm text-text-primary">{groupedFields.length}</p>
            </div>
            <div className="rounded-xl bg-surface p-3">
              <p className="text-caption text-text-muted">Cần sửa</p>
              <p className={`font-display text-heading-sm ${lowConfidenceCount > 0 ? 'text-warning' : 'text-success'}`}>{lowConfidenceCount}</p>
            </div>
            <div
              className={`rounded-xl p-3 ${needsReview ? 'bg-warning-light' : 'bg-success-light'}`}
              role="status"
              aria-label={needsReview ? 'Trạng thái: Cần kiểm tra' : 'Trạng thái: Sẵn sàng'}
            >
              <p className="text-caption text-text-muted">Trạng thái</p>
              <div className="flex items-center gap-1.5">
                {needsReview ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
                <p className={`truncate text-small font-semibold ${needsReview ? 'text-warning' : 'text-success'}`}>
                  {groupedFields.length === 0 ? 'Thiếu' : lowConfidenceCount > 0 ? 'Kiểm tra' : 'OK'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="main-fields-heading" className="card-production animate-fade-in p-4">
          <h3 id="main-fields-heading" className="mb-3 font-display text-heading-sm text-text-primary">Thông tin chính</h3>
          <ScanFieldsTable
            fields={categorizedFields.main}
            editable={false}
          />
        </section>

        {categorizedFields.other.length > 0 && (
          <section aria-labelledby="other-fields-heading" className="card-production animate-fade-in p-4">
            <h3 id="other-fields-heading" className="mb-3 font-display text-heading-sm text-text-primary">Thông tin khác</h3>
            <ScanFieldsTable
              fields={categorizedFields.other}
              editable={false}
            />
          </section>
        )}

        {notes.length > 0 && (
          <section className="card-production p-4">
            <h3 className="mb-3 font-display text-heading-sm text-text-primary">Ghi chú</h3>
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note} className="flex gap-2 text-small text-text-secondary">
                  <span className="text-primary">•</span>
                  <p className="leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

<div className="fixed bottom-bottom-nav left-0 right-0 z-50 border-t border-card-border bg-surface/95 px-4 safe-area-bottom backdrop-blur-xl md:px-6 md:left-sidebar">
        <div className="mx-auto grid max-w-content grid-cols-4 gap-2">
          <button onClick={handleRetake} className="flex flex-col items-center gap-1 rounded-xl p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Camera className="h-5 w-5" />
            <span className="text-caption font-medium">Chụp</span>
          </button>
          <button onClick={handleEdit} className="flex flex-col items-center gap-1 rounded-xl p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Edit className="h-5 w-5" />
            <span className="text-caption font-medium">Sửa</span>
          </button>
          <button onClick={handleCopy} disabled={isCopying} className="flex flex-col items-center gap-1 rounded-xl p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40">
            <Copy className="h-5 w-5" />
            <span className="text-caption font-medium">Copy</span>
          </button>
          <PrimaryButton className="px-2" onClick={handleShare} disabled={isSharing}>
            <Share2 className="mr-1.5 h-5 w-5" />
            Chia sẻ
          </PrimaryButton>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
