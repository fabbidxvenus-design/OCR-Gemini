import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScans } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { useDebounce } from '@/hooks/useDebounce';
import { SkeletonCard, Toast, FilterChip, PrimaryButton } from '@/components/ui';
import scanDisplayName from '@/lib/scanDisplayName';
import { filterAndSortScans, type ViewMode, type SortOption, type FilterState } from '@/lib/scanFilters';
import { Search, Calendar, Edit3, CheckSquare, X, Download, ArrowUpDown, LayoutGrid, List } from 'lucide-react';

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } else if (days > 0) return `${days} ngày trước`;
  else if (hours > 0) return `${hours} giờ trước`;
  else if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
}

const FILTER_CHIPS = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'this_week', label: 'Tuần này' },
  { key: 'edited', label: 'Đã sửa' },
  { key: 'not_edited', label: 'Chưa sửa' },
] as const;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Mới nhất' },
  { value: 'date_asc', label: 'Cũ nhất' },
  { value: 'name_az', label: 'A → Z' },
  { value: 'name_za', label: 'Z → A' },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { isExporting, exportMultiple } = useExport();
  const allScans = useScans({ limit: 100, order: 'desc' });
  const isLoading = !allScans;

  const filters: FilterState = useMemo(() => ({
    search: debouncedQuery,
    chips: activeFilters,
    dateRange: {},
    modelTiers: [],
  }), [debouncedQuery, activeFilters]);

  const scans = useMemo(() => {
    if (!allScans) return [];
    return filterAndSortScans(allScans, filters, sortBy);
  }, [allScans, filters, sortBy]);

  const toggleFilter = (key: string) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleScanClick = (scanId?: string) => {
    if (!scanId) return;
    if (isSelectMode) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(scanId)) newSelected.delete(scanId);
      else newSelected.add(scanId);
      setSelectedIds(newSelected);
    } else {
      navigate(`/history/${scanId}`);
    }
  };

  const handleExportSelected = async () => {
    if (!scans || selectedIds.size === 0) return;
    try {
      const selectedScans = scans.filter(s => s.id && selectedIds.has(s.id));
      await exportMultiple(selectedScans);
      setToast({ message: `Đã xuất ${selectedScans.length} scan`, type: 'success' });
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } catch {
      setToast({ message: 'Lỗi khi xuất file Excel', type: 'error' });
    }
  };

  return (
    <Layout title="Lịch sử">
      <div className="flex flex-col h-full bg-surface">
        {/* Header Area */}
        <div className="p-screen bg-card border-b border-card-border space-y-section">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-placeholder" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm scan..."
                className="w-full h-11 pl-10 pr-4 bg-surface border border-card-border rounded-sm text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div className="flex bg-surface p-1 rounded-xl border border-card-border">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm text-primary' : 'text-text-secondary'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-sm transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm text-primary' : 'text-text-secondary'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedIds(new Set());
              }}
              className={`p-2.5 rounded-xl transition-colors ${isSelectMode ? 'bg-error-light text-error' : 'bg-surface text-text-secondary border border-card-border'}`}
            >
              {isSelectMode ? <X className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-section overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setShowSortMenu(true)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-card-border bg-card text-label font-semibold text-text-primary whitespace-nowrap"
            >
              <ArrowUpDown className="w-4 h-4" />
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
            </button>
            <div className="w-px h-6 bg-card-border flex-shrink-0" />
            {FILTER_CHIPS.map(chip => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                isActive={activeFilters.includes(chip.key)}
                onClick={() => toggleFilter(chip.key)}
              />
            ))}
          </div>
        </div>

        {/* Selection Summary */}
        {isSelectMode && (
          <div className="px-screen py-2 bg-primary-light flex items-center justify-between animate-fade-in border-b border-primary/10">
            <span className="text-label font-semibold text-primary">
              Đã chọn: {selectedIds.size}
            </span>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedIds(new Set(scans.map(s => s.id!)))}
                className="text-label text-primary hover:underline"
              >
                Chọn tất cả
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-label text-text-secondary hover:underline"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* List Content */}
        <div className={`flex-1 overflow-y-auto p-screen pb-32 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-section' : 'space-y-section'}`}>
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : scans.length > 0 ? (
            scans.map((scan) => {
              const isSelected = selectedIds.has(scan.id!);
              const title = scanDisplayName(scan);

              if (viewMode === 'grid') {
                return (
                  <button
                    key={scan.id}
                    onClick={() => handleScanClick(scan.id)}
                    className={`relative bg-card rounded-2xl border transition-all text-left overflow-hidden shadow-card group ${
                      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-card-border'
                    }`}
                  >
                    <div className="aspect-square bg-surface">
                      <img src={scan.imageDataUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="text-small font-semibold text-text-primary truncate">{title}</p>
                      <p className="text-label text-text-secondary mt-1">{formatTimestamp(scan.timestamp)}</p>
                    </div>
                    {isSelectMode && (
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary border-primary' : 'bg-black/20 border-white/60'
                      }`}>
                        {isSelected && <X className="w-4 h-4 text-white" />}
                      </div>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={scan.id}
                  onClick={() => handleScanClick(scan.id)}
                  className={`flex gap-3 p-3 bg-card rounded-2xl border transition-all text-left shadow-card ${
                    isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-card-border'
                  }`}
                >
                  <div className="w-20 h-20 bg-surface rounded-xl overflow-hidden flex-shrink-0">
                    <img src={scan.imageDataUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-body font-semibold text-text-primary truncate">{title}</h3>
                      {scan.edited && <Edit3 className="w-4 h-4 text-warning flex-shrink-0" />}
                    </div>
                    <p className="text-small text-text-secondary mt-1 line-clamp-2">
                      {scan.ocrStructured?.fields?.[0]?.value || 'Chưa có nội dung'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-label text-text-secondary">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatTimestamp(scan.timestamp)}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-text-placeholder" />
              </div>
              <h3 className="text-body font-semibold text-text-primary">Không có kết quả</h3>
              <p className="text-small text-text-secondary mt-1">Thử thay đổi bộ lọc hoặc từ khóa</p>
            </div>
          )}
        </div>

        {/* Floating Export Button */}
        {isSelectMode && selectedIds.size > 0 && (
          <div className="fixed bottom-24 left-4 right-4 animate-slide-up">
            <PrimaryButton className="w-full shadow-elevated" size="lg" onClick={handleExportSelected} disabled={isExporting}>
              <Download className="w-5 h-5 mr-2" />
              {isExporting ? 'Đang xuất...' : `Xuất ${selectedIds.size} scan`}
            </PrimaryButton>
          </div>
        )}

        {/* Sort Bottom Sheet / Menu Placeholder */}
        {showSortMenu && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={() => setShowSortMenu(false)}>
            <div className="w-full max-w-sm bg-card rounded-2xl p-4 animate-slide-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-label uppercase tracking-widest text-text-secondary mb-4 px-2">Sắp xếp theo</h3>
              <div className="space-y-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    className={`w-full text-left p-4 rounded-xl font-medium transition-colors ${sortBy === opt.value ? 'bg-primary-light text-primary' : 'hover:bg-surface text-text-primary'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </Layout>
  );
}
