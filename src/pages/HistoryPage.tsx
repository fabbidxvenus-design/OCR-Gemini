import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScansState } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { useDebounce } from '@/hooks/useDebounce';
import { SkeletonCard, Toast, PrimaryButton } from '@/components/ui';
import scanDisplayName from '@/lib/scanDisplayName';
import { Search, Calendar, Edit3, CheckSquare, X, Download, ArrowUpDown, FileText, Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ScanRecord } from '@/db/schema';

type SortOption = 'date_desc' | 'date_asc' | 'name_az' | 'name_za';
type FilterType = 'all' | 'needs_review' | 'edited' | 'error';

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
}

function needsReview(scan: ScanRecord): boolean {
  return scan.ocrStructured?.fields?.some(field => field.confidence === 'low' || !field.value) ?? false;
}

function StatusChip({ scan }: { scan: ScanRecord }) {
  if (!scan.ocrStructured) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-error/30 bg-error-light px-2 py-0.5 text-caption font-semibold text-error">
        Lỗi
      </span>
    );
  }

  if (needsReview(scan)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-light px-2 py-0.5 text-caption font-semibold text-warning">
        <AlertTriangle className="h-3 w-3" />
        Cần kiểm tra
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-light px-2 py-0.5 text-caption font-semibold text-success">
      <CheckCircle2 className="h-3 w-3" />
      Sẵn sàng
    </span>
  );
}

function ScanCard({ scan, selected, selectMode, onClick }: { scan: ScanRecord; selected: boolean; selectMode: boolean; onClick: () => void }) {
  const title = scanDisplayName(scan);
  const firstField = scan.ocrStructured?.fields?.[0];
  const fieldCount = scan.ocrStructured?.fields?.length || 0;

  return (
    <button
      onClick={onClick}
      className={`card-production w-full overflow-hidden text-left transition-all hover:shadow-elevated active:scale-[0.99] ${selected ? 'border-primary ring-2 ring-primary/20' : ''}`}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-surface">
          {scan.imageDataUrl ? (
            <img src={scan.imageDataUrl} alt="" className="h-full w-full object-cover" data-testid="history-scan-thumbnail" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" data-testid="history-scan-image-fallback">
              <FileText className="h-7 w-7 text-text-muted" />
            </div>
          )}
          {selectMode && (
            <div className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-primary bg-primary' : 'border-white/70 bg-ink/30'}`}>
              {selected && <X className="h-4 w-4 text-white" />}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-heading-sm text-text-primary">{title}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-caption text-text-muted">
                <Calendar className="h-3.5 w-3.5" />
                {formatTimestamp(scan.timestamp)}
              </div>
            </div>
            {scan.edited && <Edit3 className="h-4 w-4 flex-shrink-0 text-warning" />}
          </div>

          <p className="mb-2 line-clamp-1 text-small text-text-secondary">
            {firstField ? `${firstField.field}: ${firstField.value || 'Thiếu dữ liệu'}` : 'Chưa có nội dung'}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <StatusChip scan={scan} />
            <span className="rounded-full border border-card-border bg-surface px-2 py-0.5 text-caption font-semibold text-text-muted">
              {fieldCount} trường
            </span>
            {scan.modelTier && (
              <span className="rounded-full border border-ai/30 bg-ai-light px-2 py-0.5 text-caption font-semibold text-ai">
                {scan.modelTier}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Mới nhất' },
  { value: 'date_asc', label: 'Cũ nhất' },
  { value: 'name_az', label: 'A → Z' },
  { value: 'name_za', label: 'Z → A' },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const { scans: scanList, isLoading } = useScansState({ limit: 100, order: 'desc' });
  const { isExporting, exportMultiple } = useExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const scans = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();
    const filtered = scanList.filter(scan => {
      const matchesSearch = !query || scanDisplayName(scan).toLowerCase().includes(query)
        || scan.ocrStructured?.fields?.some(field => `${field.field} ${field.value}`.toLowerCase().includes(query));

      if (!matchesSearch) return false;
      if (activeFilter === 'needs_review') return needsReview(scan);
      if (activeFilter === 'edited') return scan.edited;
      if (activeFilter === 'error') return !scan.ocrStructured;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'date_asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sortBy === 'name_az') return scanDisplayName(a).localeCompare(scanDisplayName(b), 'vi');
      if (sortBy === 'name_za') return scanDisplayName(b).localeCompare(scanDisplayName(a), 'vi');
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [scanList, activeFilter, debouncedQuery, sortBy]);

  const toggleSelected = (scanId?: string) => {
    if (!scanId) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(scanId)) next.delete(scanId);
      else next.add(scanId);
      return next;
    });
  };

  const handleScanClick = (scanId?: string) => {
    if (!scanId) return;
    if (isSelectMode) toggleSelected(scanId);
    else navigate(`/history/${scanId}`);
  };

  const handleExportSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      const selectedScans = scans.filter(scan => scan.id && selectedIds.has(scan.id));
      await exportMultiple(selectedScans);
      setToast({ message: `Đã xuất ${selectedScans.length} scan`, type: 'success' });
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } catch {
      setToast({ message: 'Lỗi khi xuất file Excel', type: 'error' });
    }
  };

  const filterOptions = useMemo<{ value: FilterType; label: string; count: number }[]>(() => [
    { value: 'all', label: 'Tất cả', count: scanList.length },
    { value: 'needs_review', label: 'Cần kiểm tra', count: scanList.filter(needsReview).length },
    { value: 'edited', label: 'Đã sửa', count: scanList.filter(scan => scan.edited).length },
    { value: 'error', label: 'Lỗi', count: scanList.filter(scan => !scan.ocrStructured).length },
  ], [scanList]);

  return (
    <Layout title="Lịch sử">
      <div className="space-y-4 pb-28">
        <section className="card-production animate-fade-in p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Kho hồ sơ OCR</p>
              <h2 className="mt-1 font-display text-heading text-text-primary">
                {isLoading ? 'Đang tải lịch sử' : `${scanList.length} lượt quét`}
              </h2>
            </div>
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedIds(new Set());
              }}
              className={`touch-target flex items-center justify-center rounded-xl transition-colors ${isSelectMode ? 'bg-error-light text-error' : 'bg-surface text-text-secondary hover:text-primary'}`}
            >
              {isSelectMode ? <X className="h-5 w-5" /> : <CheckSquare className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm hồ sơ, tên, số giấy tờ"
              className="field-production w-full !pl-14 !pr-4"
            />
          </div>
        </section>

        <div className="-mx-screen overflow-x-auto px-screen pb-2">
          <div className="flex min-w-max items-center gap-2.5 pr-screen">
            <button
              onClick={() => setShowSortMenu(true)}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-card-border bg-card px-4 py-2 text-small font-semibold text-text-primary shadow-card"
            >
              <ArrowUpDown className="h-4 w-4" />
              {SORT_OPTIONS.find(option => option.value === sortBy)?.label}
            </button>
            {!isLoading && filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`flex-shrink-0 rounded-full border px-4 py-2 text-small font-semibold transition-all ${
                  activeFilter === option.value
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-card-border bg-card text-text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {isSelectMode && (
          <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary-light p-3 animate-fade-in">
            <span className="text-small font-semibold text-primary">Đã chọn {selectedIds.size}</span>
            <div className="flex gap-4 text-small font-semibold">
              <button onClick={() => setSelectedIds(new Set(scans.map(scan => scan.id).filter(Boolean) as string[]))} className="text-primary hover:underline">
                Chọn tất cả
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="text-text-secondary hover:underline">
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3" aria-label="Đang tải lịch sử">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} data-testid="history-skeleton-card" />
            ))}
          </div>
        ) : scans.length > 0 ? (
          <div className="space-y-3">
            {scans.map(scan => (
              <ScanCard
                key={scan.id}
                scan={scan}
                selected={Boolean(scan.id && selectedIds.has(scan.id))}
                selectMode={isSelectMode}
                onClick={() => handleScanClick(scan.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
              <Search className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="font-display text-heading-sm text-text-primary">Không có kết quả</h3>
            <p className="mt-1 text-small text-text-secondary">Thử thay đổi bộ lọc hoặc từ khóa</p>
          </div>
        )}

        {showSortMenu && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm animate-fade-in sm:items-center" onClick={() => setShowSortMenu(false)}>
            <div className="w-full max-w-sm rounded-3xl bg-card p-4 shadow-elevated animate-slide-up" onClick={e => e.stopPropagation()}>
              <h3 className="mb-4 px-2 text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Sắp xếp theo</h3>
              <div className="space-y-1">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full rounded-xl p-4 text-left font-medium transition-colors ${sortBy === option.value ? 'bg-primary-light text-primary' : 'text-text-primary hover:bg-surface'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isSelectMode && selectedIds.size > 0 ? (
        <div className="fixed bottom-bottom-nav left-0 right-0 border-t border-card-border bg-surface/95 p-screen safe-area-bottom backdrop-blur-xl md:left-sidebar">
          <PrimaryButton className="mx-auto w-full max-w-content shadow-elevated" onClick={handleExportSelected} disabled={isExporting}>
            <Download className="mr-2 h-5 w-5" />
            {isExporting ? 'Đang xuất...' : `Xuất ${selectedIds.size} scan`}
          </PrimaryButton>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Mở máy ảnh"
          onClick={() => navigate('/camera')}
          className="fixed bottom-[84px] right-screen flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-white shadow-camera-control transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 md:bottom-6 md:right-8"
        >
          <Camera className="h-6 w-6" />
        </button>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}
