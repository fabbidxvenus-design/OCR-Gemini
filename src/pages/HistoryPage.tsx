import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScans } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { useDebounce } from '@/hooks/useDebounce';
import SkeletonCard from '@/components/ui/SkeletonCard';
import Toast from '@/components/ui/Toast';
import ViewModeToggle from '@/components/ui/ViewModeToggle';
import scanDisplayName from '@/lib/scanDisplayName';
import { filterAndSortScans, type ViewMode, type SortOption, type FilterState } from '@/lib/scanFilters';
import { Search, Calendar, Edit3, Camera, CheckSquare, Square, X, Download, Filter, ArrowUpDown } from 'lucide-react';

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
  } else if (days > 0) {
    return `${days} ngày trước`;
  } else if (hours > 0) {
    return `${hours} giờ trước`;
  } else if (minutes > 0) {
    return `${minutes} phút trước`;
  } else {
    return 'Vừa xong';
  }
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
  { value: 'fields_count', label: 'Nhiều field nhất' },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { isExporting, exportMultiple } = useExport();

  const allScans = useScans({ limit: 100, order: 'desc' });
  const isLoading = !allScans;

  // Apply filters and sorting
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

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds(new Set());
  };

  const toggleSelect = (scanId?: string) => {
    if (!scanId) return;
    const newSelected = new Set(selectedIds);
    if (newSelected.has(scanId)) {
      newSelected.delete(scanId);
    } else {
      newSelected.add(scanId);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (scans) {
      const ids = scans
        .map(s => s.id)
        .filter((id): id is string => id !== undefined);
      setSelectedIds(new Set(ids));
    }
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleExportSelected = async () => {
    if (!scans || selectedIds.size === 0) return;

    try {
      const selectedScans = scans.filter(s => s.id && selectedIds.has(s.id));
      if (selectedScans.length === 0) {
        setToast({ message: 'Không tìm thấy dữ liệu scan để xuất', type: 'error' });
        return;
      }

      await exportMultiple(selectedScans);
      setToast({ message: `Đã xuất ${selectedScans.length} scan thành công`, type: 'success' });
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('[History] Export error:', err);
      setToast({ message: 'Lỗi khi xuất file Excel', type: 'error' });
    }
  };

  const handleScanClick = (scanId?: string) => {
    if (isSelectMode) {
      toggleSelect(scanId);
    } else if (scanId) {
      navigate(`/history/${scanId}`);
    }
  };

  const renderScanCard = (scan: typeof scans[0]) => {
    if (!scan || !scan.id) return null;
    const isSelected = selectedIds.has(scan.id);
    const title = scanDisplayName(scan);

    if (viewMode === 'grid') {
      return (
        <button
          key={scan.id}
          onClick={() => handleScanClick(scan.id)}
          className={`bg-white rounded-lg border overflow-hidden hover:border-primary transition-colors ${
            isSelectMode ? 'cursor-pointer' : ''
          } ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}
        >
          <div className="aspect-square bg-gray-100">
            <img
              src={scan.imageDataUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-2">
            <p className="text-xs font-medium text-gray-900 truncate">{title}</p>
            {scan.edited && (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-warning">
                <Edit3 className="w-2.5 h-2.5" />
                Đã sửa
              </span>
            )}
          </div>
        </button>
      );
    }

    if (viewMode === 'compact') {
      return (
        <button
          key={scan.id}
          onClick={() => handleScanClick(scan.id)}
          className={`w-full flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-primary transition-colors text-left ${
            isSelectMode ? 'cursor-pointer' : ''
          } ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
        >
          {isSelectMode && (
            <div className="flex-shrink-0">
              {isSelected ? (
                <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <Square className="w-5 h-5 text-gray-300" />
              )}
            </div>
          )}
          <p className="flex-1 text-sm font-medium text-gray-900 truncate">{title}</p>
          <span className="text-xs text-gray-400">{formatTimestamp(scan.timestamp)}</span>
          {scan.edited && <Edit3 className="w-3.5 h-3.5 text-warning flex-shrink-0" />}
        </button>
      );
    }

    // List view (default)
    return (
      <button
        key={scan.id}
        onClick={() => handleScanClick(scan.id)}
        className={`w-full bg-white rounded-lg border p-3 hover:border-primary transition-colors text-left ${
          isSelectMode ? 'cursor-pointer' : ''
        } ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
      >
        <div className="flex gap-3">
          {isSelectMode && (
            <div className="flex-shrink-0 flex items-center">
              {isSelected ? (
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <Square className="w-6 h-6 text-gray-300" />
              )}
            </div>
          )}
          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
            <img
              src={scan.imageDataUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {scan.edited && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning text-xs font-medium rounded">
                  <Edit3 className="w-3 h-3" />
                  Đã sửa
                </span>
              )}
            </div>
            <p className="text-sm text-neutral line-clamp-2 mb-2">
              {scan.ocrStructured?.fields?.[0]?.value || scan.ocrStructured?.raw_text || 'Không có nội dung'}
            </p>
            <div className="flex items-center gap-1 text-xs text-neutral">
              <Calendar className="w-3 h-3" />
              {formatTimestamp(scan.timestamp)}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <Layout title="Lịch sử">
      <div className="flex flex-col h-full">
        {/* Search Bar + Controls */}
        <div className="p-4 bg-white border-b border-gray-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
            {allScans && allScans.length > 0 && (
              <button
                onClick={toggleSelectMode}
                className={`p-2 rounded-lg transition-colors ${
                  isSelectMode
                    ? 'bg-error/10 text-error'
                    : 'bg-surface text-text-secondary hover:bg-gray-200'
                }`}
              >
                {isSelectMode ? <X className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Filter & Sort Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                activeFilters.length > 0
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-gray-200 text-text-secondary hover:border-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              Bộ lọc
              {activeFilters.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowSort(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-gray-200 text-text-secondary hover:border-gray-300 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sắp xếp'}
            </button>

            {scans.length > 0 && (
              <span className="ml-auto text-xs text-neutral">
                {scans.length} scan
              </span>
            )}
          </div>

          {/* Filter Chips */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 animate-slide-down">
              {FILTER_CHIPS.map(chip => (
                <button
                  key={chip.key}
                  onClick={() => toggleFilter(chip.key)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    activeFilters.includes(chip.key)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-gray-200 text-text-secondary hover:border-gray-300'
                  }`}
                >
                  {activeFilters.includes(chip.key) && (
                    <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        {showSort && (
          <div className="fixed inset-0 z-50" onClick={() => setShowSort(false)}>
            <div className="absolute top-20 right-4 bg-white rounded-xl shadow-lg border p-2 min-w-48 animate-fade-in">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSort(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === option.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-text-primary hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selection Controls */}
        {isSelectMode && (
          <div className="px-4 py-2 bg-surface border-b border-gray-200 flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              {selectedIds.size > 0 ? (
                <>Đã chọn: <span className="font-semibold text-text-primary">{selectedIds.size}</span> items</>
              ) : (
                <span className="text-text-secondary">Chọn các scan để xuất</span>
              )}
            </span>
            <div className="flex gap-3">
              <button onClick={selectAll} className="text-primary hover:underline">
                Chọn tất cả
              </button>
              <button onClick={deselectAll} className="text-text-secondary hover:underline">
                Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Scan List/Grid */}
        <div className={`flex-1 overflow-y-auto p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'} pb-24`}>
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {scans.length > 0 && scans.map(renderScanCard)}

          {scans.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Search className="w-16 h-16 text-neutral mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-neutral">
                Không có scan nào khớp với "{searchQuery}"
              </p>
            </div>
          )}

          {!isLoading && scans.length === 0 && !searchQuery && activeFilters.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Calendar className="w-16 h-16 text-neutral mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có lịch sử
              </h3>
              <p className="text-neutral mb-4">
                Bạn chưa quét scan nào. Hãy chụp ảnh để bắt đầu!
              </p>
              <button
                onClick={() => navigate('/camera')}
                className="bg-primary text-white py-2 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-5 h-5 inline-block mr-2" />
                Chụp ảnh
              </button>
            </div>
          )}

          {!isLoading && scans.length === 0 && (searchQuery || activeFilters.length > 0) && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Filter className="w-16 h-16 text-neutral mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có kết quả
              </h3>
              <p className="text-neutral mb-4">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilters([]);
                }}
                className="text-primary hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Export Bar */}
        {isSelectMode && selectedIds.size > 0 && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-primary text-white shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedIds.size} scan(s) được chọn
              </span>
              <button
                onClick={handleExportSelected}
                disabled={isExporting}
                className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Xuất Excel
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Layout>
  );
}