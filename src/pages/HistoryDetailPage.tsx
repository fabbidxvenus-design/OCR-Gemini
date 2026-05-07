import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScan, deleteScan } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { Edit, Trash2, ChevronDown, ChevronUp, FileText, AlertTriangle, Download, Loader2 } from 'lucide-react';
import { categorizeFields } from '@/lib/fieldCategories';

interface ExpandedSections {
  mainFields: boolean;
  otherFields: boolean;
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
    if (scan) {
      await exportScan(scan);
    }
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

  const sizes = scan.ocrStructured?.sizes || [];
  const notes = scan.ocrStructured?.notes || [];
  const rawText = scan.ocrStructured?.raw_text || '';
  const title = scan.ocrStructured?.title || '';

  return (
    <Layout title="Chi tiết scan">
      <div className="p-4 space-y-3 pb-44">
        {/* Image Preview */}
        <div className="bg-card rounded-xl border border-card-border overflow-hidden shadow-card animate-fade-in">
          <img
            src={scan.imageDataUrl}
            alt="Scan"
            className="w-full h-auto"
          />
        </div>

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

        {/* Edited Badge */}
        {scan.edited && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-sm text-warning font-medium">
                Scan này đã được chỉnh sửa
              </p>
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

        {/* Metadata */}
        <div className="bg-card rounded-xl border border-card-border p-4 shadow-card animate-fade-in">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Thông tin scan
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Thời gian:</span>
              <span className="text-sm font-medium text-text-primary">
                {new Date(scan.timestamp).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Token sử dụng:</span>
              <span className="text-sm font-medium text-text-primary">
                {scan.tokenUsage.input + scan.tokenUsage.output}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Chi phí:</span>
              <span className="text-sm font-medium text-text-primary">
                ${scan.tokenUsage.cost.toFixed(6)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-card rounded-xl border border-card-border p-4 shadow-card animate-fade-in">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors touch-target active:scale-[0.98] disabled:opacity-70"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Xuất Excel
              </>
            )}
          </button>
          <button
            onClick={handleEdit}
            className="w-full flex items-center justify-center gap-2 bg-card border border-card-border text-text-primary py-3.5 mt-3 rounded-xl font-semibold hover:bg-surface transition-colors touch-target active:scale-[0.98]"
          >
            <Edit className="w-5 h-5" />
            Sửa
          </button>
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 bg-error/10 text-error py-3 mt-3 rounded-xl font-medium hover:bg-error/15 transition-colors touch-target"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa scan</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}