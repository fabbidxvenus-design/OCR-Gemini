import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan, deleteScan } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { Edit, Trash2, FileText, AlertTriangle, Download, Loader2, CheckCircle2 } from 'lucide-react';
import scanDisplayName from '@/lib/scanDisplayName';
import { PrimaryButton, Toast, SkeletonLine, SkeletonBlock, ErrorMessage, ScanFieldsTable } from '@/components/ui';
import { categorizeFields, groupSizeQuantityFields } from '@/lib/fieldCategories';

export default function HistoryDetailPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const { scan, isLoading, error } = useScan(scanId);
  const { isExporting, exportScan } = useExport();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const categorizedFields = useMemo(() => {
    const fields = groupSizeQuantityFields(scan?.ocrStructured?.fields || []);
    const withCategories = categorizeFields(fields);
    return {
      main: withCategories.filter(f => f.category === 'main'),
      other: withCategories.filter(f => f.category === 'other'),
    };
  }, [scan]);

  if (!scan && isLoading) {
    return (
      <Layout title="Chi tiết scan" showBack>
        <div className="space-y-4">
          <SkeletonBlock className="h-40 w-full rounded-none" />
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
      <Layout title="Chi tiết scan" showBack>
        <ErrorMessage
          title="Không thể tải chi tiết scan"
          message={error}
          onRetry={() => window.location.reload()}
          autoFocus
        />
      </Layout>
    );
  }

  if (!scan) {
    return (
      <Layout title="Chi tiết scan" showBack>
        <div className="flex h-64 items-center justify-center">
          <p className="animate-pulse text-text-secondary">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  const handleEdit = () => navigate(`/edit/${scanId}`);
  const handleExport = async () => exportScan(scan);
  const handleDelete = async () => {
    if (!scanId || !window.confirm('Xóa scan này? Không thể hoàn tác.')) return;

    try {
      await deleteScan(scanId);
      navigate('/history');
    } catch {
      setToast({ message: 'Lỗi khi xóa scan', type: 'error' });
    }
  };

  const groupedFields = [...categorizedFields.main, ...categorizedFields.other];
  const displayTitle = scanDisplayName(scan);
  const lowConfidenceCount = groupedFields.filter(field => field.confidence === 'low' || !field.value).length;

  return (
    <Layout title="Chi tiết scan" showBack showBottomNav={false}>
      <div className="space-y-4 pb-40">
        <section className="card-production overflow-hidden animate-fade-in">
          {scan.imageDataUrl ? (
            <img src={scan.imageDataUrl} alt="Scan" className="h-auto max-h-[40vh] w-full bg-surface object-contain" />
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-surface text-text-secondary">Không có ảnh</div>
          )}
        </section>

        <section className="card-production animate-fade-in p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-light">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-heading text-text-primary">{displayTitle}</h2>
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
            <div className={`rounded-xl p-3 ${lowConfidenceCount > 0 ? 'bg-warning-light' : 'bg-success-light'}`}>
              <p className="text-caption text-text-muted">Trạng thái</p>
              <div className="flex items-center gap-1.5">
                {lowConfidenceCount > 0 ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
                <p className={`truncate text-small font-semibold ${lowConfidenceCount > 0 ? 'text-warning' : 'text-success'}`}>
                  {lowConfidenceCount > 0 ? 'Kiểm tra' : 'OK'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {scan.edited && (
          <div className="flex items-center gap-3 rounded-2xl border border-warning/20 bg-warning-light p-3 animate-fade-in">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning" />
            <p className="text-small font-medium text-warning">Scan này đã được chỉnh sửa</p>
          </div>
        )}

        <ScanFieldsTable
          fields={groupedFields}
          editable={false}
        />

        <section className="card-production p-4">
          <h3 className="mb-3 text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Chi tiết kỹ thuật</h3>
          <div className="space-y-2 text-small">
            <div className="flex justify-between gap-3">
              <span className="text-text-secondary">Token dùng</span>
              <span className="font-medium text-text-primary">{(scan.tokenUsage.input + scan.tokenUsage.output).toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-secondary">Chi phí ước tính</span>
              <span className="font-medium text-text-primary">${scan.tokenUsage.cost.toFixed(4)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-secondary">Mô hình</span>
              <span className="font-medium uppercase text-text-primary">{scan.modelTier || 'default'}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-bottom-nav left-0 right-0 z-50 border-t border-card-border bg-surface/95 px-4 safe-area-bottom backdrop-blur-xl md:px-6 md:left-sidebar">
        <div className="mx-auto grid max-w-content grid-cols-3 gap-2">
          <PrimaryButton variant="secondary" onClick={handleEdit}>
            <Edit className="mr-2 h-5 w-5" /> Sửa
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
            Xuất
          </PrimaryButton>
          <PrimaryButton variant="danger" onClick={handleDelete}>
            <Trash2 className="mr-2 h-5 w-5" /> Xóa
          </PrimaryButton>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
