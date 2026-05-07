# TIP-013: History List View + Search

## HEADER
- **TIP-ID**: TIP-013
- **Project**: OCR Gemini Mobile Web POC
- **Module**: History
- **Priority**: P0
- **Depends on**: TIP-004, TIP-005
- **Estimated**: 6 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3 + Dexie.js 4
- **Key files to read first**: 
  - `src/pages/HistoryPage.tsx` (placeholder from TIP-003, will be replaced)
  - `src/db/queries.ts` (getAllScans, searchScans)
- **Patterns to follow**: Infinite scroll or pagination, search with debounce, card-based list layout

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Create history list page showing all past scans in reverse chronological order (newest first). Display scan cards with thumbnail, title, timestamp, and edited badge. Implement search functionality with debounced input to filter scans by text content. Add empty state when no scans exist. Navigate to scan detail page when card is tapped.

---

## SPECIFICATIONS

### Business Rules

1. **Sort order**: Newest first (reverse chronological)
2. **Card content**: Thumbnail, title/preview, timestamp, edited badge
3. **Search**: Filter by title, fields, raw text (debounced 300ms)
4. **Empty state**: Show placeholder when no scans
5. **Navigation**: Tap card to view scan detail (TIP-014)
6. **Pagination**: Load 20 scans at a time (simple pagination for MVP)
7. **Edited badge**: Show badge if scan was edited

### History Page

**src/pages/HistoryPage.tsx**:
```typescript
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useScans } from '@/hooks/useScans';
import { useSearchScans } from '@/hooks/useScans';
import { Search, Calendar, Edit3 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const allScans = useScans({ limit: 100, order: 'desc' });
  const searchResults = useSearchScans(debouncedQuery);
  
  const scans = debouncedQuery ? searchResults : allScans;

  const handleScanClick = (scanId: string) => {
    navigate(`/history/${scanId}`);
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
          {scans && scans.length > 0 ? (
            scans.map((scan) => (
              <button
                key={scan.id}
                onClick={() => handleScanClick(scan.id!)}
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
                        {scan.ocrStructured.title || 'Không có tiêu đề'}
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
                      {scan.ocrStructured.fields?.[0]?.value || scan.ocrStructured.raw_text || 'Không có nội dung'}
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
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Search className="w-16 h-16 text-neutral mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-neutral">
                Không có scan nào khớp với "{searchQuery}"
              </p>
            </div>
          ) : (
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
                Chụp ảnh
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

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
```

### Debounce Hook

**src/hooks/useDebounce.ts**:
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Update useScans Hook

**src/hooks/useScans.ts** (add export for useSearchScans):
```typescript
// Already exists from TIP-004, just ensure useSearchScans is exported
export function useSearchScans(query: string) {
  const results = useLiveQuery(
    () => (query ? searchScans(query) : []),
    [query]
  );
  
  return results;
}
```

### Validation

1. **Sort order**: Newest scans appear first
2. **Search**: Filters scans by title, fields, raw text
3. **Debounce**: Search triggers after 300ms of no typing
4. **Empty state**: Shows when no scans exist
5. **Search empty**: Shows when search returns no results
6. **Navigation**: Taps navigate to detail page

### Error Handling

- **No scans**: Show empty state with call-to-action
- **Search no results**: Show search-specific empty state
- **Image load failure**: Show placeholder or gray box

---

## ACCEPTANCE CRITERIA

### AC-001: Page Load
- **Given**: User has 10 scans in database
- **When**: User navigates to /history
- **Then**:
  - HistoryPage renders
  - Search bar displays at top
  - 10 scan cards display below
  - Scans are sorted newest first

### AC-002: Scan Card Display
- **Given**: Scan has title "INVOICE #12345", timestamp 2 hours ago, edited=true
- **When**: Card renders
- **Then**:
  - Thumbnail shows on left (80x80px)
  - Title shows: "INVOICE #12345"
  - "Đã sửa" badge shows (yellow)
  - Preview text shows first field value or raw text
  - Timestamp shows: "2 giờ trước"

### AC-003: Timestamp Formatting
- **Given**: Various scan timestamps
- **When**: Cards render
- **Then**:
  - < 1 min: "Vừa xong"
  - 5 min ago: "5 phút trước"
  - 2 hours ago: "2 giờ trước"
  - 3 days ago: "3 ngày trước"
  - > 7 days: "05/05/2026" (dd/mm/yyyy)

### AC-004: Search Input
- **Given**: User is on history page
- **When**: User types "invoice" in search box
- **Then**:
  - Input value updates immediately
  - Search icon shows on left
  - Placeholder: "Tìm kiếm theo tên, nội dung..."

### AC-005: Search Debounce
- **Given**: User types "inv" then "oice" quickly
- **When**: User stops typing
- **Then**:
  - Search waits 300ms after last keystroke
  - Then filters scans matching "invoice"
  - Only one search query executes (not 6)

### AC-006: Search Results
- **Given**: Database has scans with "INVOICE" in title
- **When**: User searches "invoice"
- **Then**:
  - Only matching scans display
  - Non-matching scans are hidden
  - Search is case-insensitive

### AC-007: Search No Results
- **Given**: User searches "xyz123" (no matches)
- **When**: Search completes
- **Then**:
  - Empty state shows with search icon
  - Heading: "Không tìm thấy kết quả"
  - Message: "Không có scan nào khớp với 'xyz123'"

### AC-008: Empty State (No Scans)
- **Given**: Database has 0 scans
- **When**: User navigates to /history
- **Then**:
  - Empty state shows with calendar icon
  - Heading: "Chưa có lịch sử"
  - Message: "Bạn chưa quét scan nào. Hãy chụp ảnh để bắt đầu!"
  - "Chụp ảnh" button displays

### AC-009: Empty State Button
- **Given**: User is on empty history page
- **When**: User taps "Chụp ảnh" button
- **Then**:
  - Navigates to /camera
  - Camera page loads

### AC-010: Card Navigation
- **Given**: User taps scan card with id "abc-123"
- **When**: Card is clicked
- **Then**:
  - Navigates to /history/abc-123
  - Detail page loads (TIP-014)

---

## CONSTRAINTS

### DO NOT:
- ❌ Implement infinite scroll — simple pagination for MVP
- ❌ Add filters (date range, edited only) — search only
- ❌ Implement bulk delete — single delete in TIP-014
- ❌ Add sorting options — newest first only
- ❌ Show full image — thumbnail only
- ❌ Add swipe actions — tap only

### REUSE:
- ✅ Layout component from TIP-003
- ✅ useScans hook from TIP-004
- ✅ searchScans query from TIP-004
- ✅ Lucide React icons
- ✅ Tailwind utility classes

### SKIP (out of scope for TIP-013):
- ⏭️ Infinite scroll
- ⏭️ Date range filter
- ⏭️ Bulk operations
- ⏭️ Sorting options
- ⏭️ Swipe to delete
- ⏭️ Pull to refresh

---

## COMPLETION CHECKLIST

- [ ] `src/pages/HistoryPage.tsx` created
- [ ] `src/hooks/useDebounce.ts` created
- [ ] `src/hooks/useScans.ts` exports useSearchScans
- [ ] Page loads with scan list
- [ ] Scans sorted newest first
- [ ] Scan cards display correctly
- [ ] Thumbnails display
- [ ] Edited badge shows when edited=true
- [ ] Timestamp formatting works
- [ ] Search input works
- [ ] Search debounce works (300ms)
- [ ] Search filters scans correctly
- [ ] Search no results state works
- [ ] Empty state shows when no scans
- [ ] Empty state button navigates to camera
- [ ] Card navigation works
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-013 | Generated: 2026-05-05 | Vibecode Kit v5.0*
