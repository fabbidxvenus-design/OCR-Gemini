import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan, deleteScan } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { Edit, Trash2, FileText, AlertTriangle, Download, Loader2 } from 'lucide-react';
import { categorizeFields } from '@/lib/fieldCategories';
import scanDisplayName from '@/lib/scanDisplayName';
import { CollapsibleSection, PrimaryButton } from '@/components/ui';

export default function HistoryDetailPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const scan = useScan(scanId);
  const { isExporting, exportScan } = useExport();

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
      <Layout title="Chi tiết scan" showBack>
        <div className="flex items-center justify-center h-64">
          <p className="text-text-secondary animate-pulse">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  const handleEdit = () => navigate(`/edit/${scanId}`);
  const handleExport = async () => scan && await exportScan(scan);
  const handleDelete = async () => {
    if (window.confirm('Xóa scan này? Không thể hoàn tác.')) {
      try { await deleteScan(scanId!); navigate('/history'); }
      catch { alert('Lỗi khi xóa scan'); }
    }
  };

  const sizes = scan.ocrStructured?.sizes || [];
  const displayTitle = scanDisplayName(scan);

  return (
    <Layout title="Chi tiết scan" showBack>
      <div className="p-screen space-y-section pb-44">
        {/* Image Card */}
        <div className="bg-card rounded-2xl border border-card-border overflow-hidden shadow-card animate-fade-in">
          {scan.imageDataUrl ? (
            <img src={scan.imageDataUrl} alt="Scan" className="w-full h-auto max-h-[40vh] object-contain bg-surface" />
          ) : (
            <div className="w-full h-40 flex items-center justify-center bg-surface text-text-secondary">No image available</div>
          )}
        </div>

        {/* Title Header */}
        <div className="bg-card rounded-2xl border border-card-border p-card shadow-card animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-body font-semibold text-text-primary truncate">{displayTitle}</h2>
              <p className="text-label text-text-secondary mt-1">
                {new Date(scan.timestamp).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Warning Badge */}
        {scan.edited && (
          <div className="bg-warning-light border border-warning/20 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-small text-warning font-medium">Scan này đã được chỉnh sửa</p>
          </div>
        )}

        {/* Sections */}
        {categorizedFields.main.length > 0 && (
          <CollapsibleSection title="Thông tin chính" count={categorizedFields.main.length}>
            <div className="divide-y divide-card-border -my-4">
              {categorizedFields.main.map((field, i) => (
                <div key={i} className="py-3">
                  <p className="text-label text-text-secondary uppercase tracking-wide">{field.field}</p>
                  <p className="text-body font-semibold text-text-primary mt-1">{field.value}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {categorizedFields.other.length > 0 && (
          <CollapsibleSection title="Thông tin khác" count={categorizedFields.other.length} defaultExpanded={false}>
            <div className="divide-y divide-card-border -my-4">
              {categorizedFields.other.map((field, i) => (
                <div key={i} className="py-2.5">
                  <p className="text-label text-text-secondary">{field.field}</p>
                  <p className="text-small text-text-primary mt-0.5">{field.value}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {sizes.length > 0 && (
          <CollapsibleSection title="Bảng size" count={sizes.length}>
            <div className="border border-card-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface">
                  <tr>
                    <th className="py-2.5 px-4 text-label font-semibold text-text-secondary uppercase">Size</th>
                    <th className="py-2.5 px-4 text-label font-semibold text-text-secondary uppercase text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {sizes.map((s, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 text-body text-text-primary font-medium">{s.size}</td>
                      <td className="py-3 px-4 text-body text-text-primary text-right">{s.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

        {/* Metadata Card */}
        <div className="bg-card rounded-2xl border border-card-border p-card shadow-card space-y-3">
          <h3 className="text-label font-bold text-text-secondary uppercase tracking-widest">Chi tiết kỹ thuật</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-small">
              <span className="text-text-secondary">Token dùng:</span>
              <span className="font-medium text-text-primary">{(scan.tokenUsage.input + scan.tokenUsage.output).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-small">
              <span className="text-text-secondary">Chi phí ước tính:</span>
              <span className="font-medium text-text-primary">${scan.tokenUsage.cost.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-small">
              <span className="text-text-secondary">Mô hình:</span>
              <span className="font-medium text-text-primary uppercase">{scan.modelTier || 'default'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-section pb-12">
          <PrimaryButton onClick={handleExport} disabled={isExporting} size="lg">
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
            Xuất file Excel
          </PrimaryButton>
          <div className="grid grid-cols-2 gap-section">
            <PrimaryButton variant="secondary" onClick={handleEdit}>
              <Edit className="w-5 h-5 mr-2" /> Sửa
            </PrimaryButton>
            <PrimaryButton variant="danger" onClick={handleDelete}>
              <Trash2 className="w-5 h-5 mr-2" /> Xóa
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Layout>
  );
}
