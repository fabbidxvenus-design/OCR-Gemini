import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScans, useSearchScans } from '@/hooks/useScans';
import { useDebounce } from '@/hooks/useDebounce';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Search, Calendar, Edit3, Camera } from 'lucide-react';

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
  const debouncedQuery = useDebounce(searchQuery, 300);

  const allScans = useScans({ limit: 100, order: 'desc' });
  const searchResults = useSearchScans(debouncedQuery);

  const scans = debouncedQuery ? searchResults : allScans;
  const isLoading = !scans && !searchQuery;
  const isSearching = debouncedQuery && !searchResults;

  const handleScanClick = (scanId?: string) => {
    if (scanId) {
      navigate(`/history/${scanId}`);
    }
  };

  return (
    <Layout title="Lịch sử">
      <div className="flex flex-col h-full">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, nội dung..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Scan List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
            scans.map((scan) => (
              <button
                key={scan.id}
                onClick={() => handleScanClick(scan.id)}
                className="w-full bg-white rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors text-left"
              >
                <div className="flex gap-3">
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
            ))
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
      </div>
    </Layout>
  );
}