import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScans, useSearchScans } from '@/hooks/useScans';
import { useExport } from '@/hooks/useExport';
import { useDebounce } from '@/hooks/useDebounce';
import SkeletonCard from '@/components/ui/SkeletonCard';
import Toast from '@/components/ui/Toast';
import { Search, Calendar, Edit3, Camera, CheckSquare, Square, X, Download } from 'lucide-react';

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

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { isExporting, exportMultiple } = useExport();

  const allScans = useScans({ limit: 100, order: 'desc' });
  const searchResults = useSearchScans(debouncedQuery);

  const scans = debouncedQuery ? searchResults : allScans;
  const isLoading = !scans && !searchQuery;
  const isSearching = debouncedQuery && !searchResults;

  // Toggle select mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds(new Set());
  };

  // Toggle item selection
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

  // Select all visible scans
  const selectAll = () => {
    if (scans) {
      const ids = scans
        .map(s => s.id)
        .filter((id): id is string => id !== undefined);
      setSelectedIds(new Set(ids));
    }
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Export selected scans
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

      // Clear selection and exit select mode on success
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

  const handleCardClick = (scanId?: string) => {
    handleScanClick(scanId);
  };

  return (
    <Layout title="Lịch sử">
      <div className="flex flex-col h-full">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, nội dung..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            {scans && scans.length > 0 && (
              <button
                onClick={toggleSelectMode}
                className={`p-2 rounded-lg transition-colors ${
                  isSelectMode
                    ? 'bg-error/10 text-error'
                    : 'bg-surface text-text-secondary hover:bg-gray-200'
                }`}
                title={isSelectMode ? 'Hủy chọn' : 'Chọn nhiều'}
              >
                {isSelectMode ? <X className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

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

        {/* Scan List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
          {/* Loading skeletons */}
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Search loading */}
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Scan results */}
          {scans && scans.length > 0 && (
            scans.map((scan) => {
              const isSelected = scan.id && selectedIds.has(scan.id);
              return (
                <button
                  key={scan.id}
                  onClick={() => handleCardClick(scan.id)}
                  className={`w-full bg-white rounded-lg border p-3 hover:border-primary transition-colors text-left ${
                    isSelectMode ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Checkbox (in select mode) */}
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

                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={scan.imageDataUrl}
                        alt="Scan thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {scan.ocrStructured?.title || 'Không có tiêu đề'}
                        </h3>
                        {scan.edited && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning text-xs font-medium rounded">
                            <Edit3 className="w-3 h-3" />
                            Đã sửa
                          </span>
                        )}
                      </div>

                      {/* Preview text */}
                      <p className="text-sm text-neutral line-clamp-2 mb-2">
                        {scan.ocrStructured?.fields?.[0]?.value || scan.ocrStructured?.raw_text || 'Không có nội dung'}
                      </p>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-neutral">
                        <Calendar className="w-3 h-3" />
                        {formatTimestamp(scan.timestamp)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}

          {/* No results */}
          {scans && scans.length === 0 && searchQuery && (
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

          {/* Empty state */}
          {!isLoading && !scans && !searchQuery && (
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
        </div>

        {/* Export Bar (visible when items selected) */}
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
        {/* Toast Notification */}
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