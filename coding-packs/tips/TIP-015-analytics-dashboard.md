# TIP-015: Analytics Dashboard (KPI + Top Products)

## HEADER
- **TIP-ID**: TIP-015
- **Project**: OCR Gemini Mobile Web POC
- **Module**: Analytics
- **Priority**: P1
- **Depends on**: TIP-013, TIP-004
- **Estimated**: 6 hours

---

## CONTEXT

- **Working directory**: `D:\scripts\ocr_gemini\ocr-mobile-web\`
- **Tech stack**: React 18 + TypeScript 5 + Tailwind CSS 3 + Dexie.js 4
- **Key files to read first**: 
  - `src/db/queries.ts` (getAllScans for analytics)
  - `src/pages/AnalyticsPage.tsx` (placeholder from TIP-003, will be replaced)
- **Patterns to follow**: Card-based KPI layout, simple bar chart for top products

---

## APPLICABLE STANDARDS

**None** — No standards directory exists yet.

---

## TASK

Create analytics dashboard showing key performance indicators (total scans, total cost, average confidence) and top 5 most scanned products. Calculate metrics from IndexedDB scan history. Display KPIs in card grid and top products in simple bar chart. Provide date range filter (7 days, 30 days, 90 days, all time). Show empty state when no data exists.

---

## SPECIFICATIONS

### Business Rules

1. **KPIs**: Total scans, total cost (USD), average confidence
2. **Top products**: Top 5 by scan count (from title field)
3. **Date range filter**: 7 days, 30 days, 90 days, all time
4. **Empty state**: Show placeholder when no scans
5. **Real-time**: Recalculate on page load (no caching)
6. **Confidence calculation**: Average of all field confidence scores

### Analytics Page

**src/pages/AnalyticsPage.tsx**:
```typescript
import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useScans } from '@/hooks/useScans';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';

type DateRange = '7d' | '30d' | '90d' | 'all';

interface KPI {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface ProductCount {
  title: string;
  count: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const allScans = useScans({ limit: 1000, order: 'desc' });

  const filteredScans = useMemo(() => {
    if (!allScans || dateRange === 'all') return allScans || [];

    const now = new Date();
    const cutoff = new Date();
    
    switch (dateRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
    }

    return allScans.filter((scan) => new Date(scan.timestamp) >= cutoff);
  }, [allScans, dateRange]);

  const kpis = useMemo<KPI[]>(() => {
    if (!filteredScans || filteredScans.length === 0) {
      return [
        {
          label: 'Tổng số scan',
          value: '0',
          icon: <TrendingUp className="w-6 h-6" />,
          color: 'text-primary',
        },
        {
          label: 'Tổng chi phí',
          value: '$0.00',
          icon: <DollarSign className="w-6 h-6" />,
          color: 'text-success',
        },
        {
          label: 'Độ tin cậy TB',
          value: 'N/A',
          icon: <Target className="w-6 h-6" />,
          color: 'text-warning',
        },
      ];
    }

    const totalScans = filteredScans.length;
    const totalCost = filteredScans.reduce((sum, scan) => sum + scan.tokenUsage.cost, 0);

    // Calculate average confidence
    let totalConfidence = 0;
    let confidenceCount = 0;

    filteredScans.forEach((scan) => {
      if (scan.ocrStructured.fields) {
        scan.ocrStructured.fields.forEach((field) => {
          const confidenceValue =
            field.confidence === 'high' ? 1 : field.confidence === 'medium' ? 0.7 : 0.4;
          totalConfidence += confidenceValue;
          confidenceCount++;
        });
      }
    });

    const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    const avgConfidencePercent = Math.round(avgConfidence * 100);

    return [
      {
        label: 'Tổng số scan',
        value: totalScans.toString(),
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'text-primary',
      },
      {
        label: 'Tổng chi phí',
        value: `$${totalCost.toFixed(4)}`,
        icon: <DollarSign className="w-6 h-6" />,
        color: 'text-success',
      },
      {
        label: 'Độ tin cậy TB',
        value: `${avgConfidencePercent}%`,
        icon: <Target className="w-6 h-6" />,
        color: 'text-warning',
      },
    ];
  }, [filteredScans]);

  const topProducts = useMemo<ProductCount[]>(() => {
    if (!filteredScans || filteredScans.length === 0) return [];

    const productCounts = new Map<string, number>();

    filteredScans.forEach((scan) => {
      const title = scan.ocrStructured.title || 'Không có tiêu đề';
      productCounts.set(title, (productCounts.get(title) || 0) + 1);
    });

    return Array.from(productCounts.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredScans]);

  const maxCount = topProducts.length > 0 ? topProducts[0].count : 1;

  return (
    <Layout title="Thống kê">
      <div className="p-4 space-y-4">
        {/* Date Range Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-neutral" />
            <h3 className="font-semibold text-gray-900">Khoảng thời gian</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: '7d', label: '7 ngày' },
              { value: '30d', label: '30 ngày' },
              { value: '90d', label: '90 ngày' },
              { value: 'all', label: 'Tất cả' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as DateRange)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4"
            >
              <div className={`${kpi.color}`}>{kpi.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-neutral">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Top 5 sản phẩm</h3>

          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate flex-1">
                      {product.title}
                    </p>
                    <span className="text-sm font-semibold text-primary ml-2">
                      {product.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(product.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-neutral mx-auto mb-2" />
              <p className="text-sm text-neutral">Chưa có dữ liệu</p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {(!filteredScans || filteredScans.length === 0) && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <TrendingUp className="w-16 h-16 text-neutral mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có dữ liệu thống kê
            </h3>
            <p className="text-neutral mb-4">
              Bắt đầu quét hóa đơn để xem thống kê chi tiết
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
```

### Validation

1. **KPI calculation**: Correct totals and averages
2. **Date filtering**: Accurate date range filtering
3. **Top products**: Sorted by count, max 5 items
4. **Bar chart**: Proportional widths based on max count
5. **Empty state**: Shows when no scans in range

### Error Handling

- **No scans**: Show empty state with call-to-action
- **Invalid dates**: Handle gracefully (shouldn't occur with preset ranges)
- **Missing fields**: Handle scans without title or confidence

---

## ACCEPTANCE CRITERIA

### AC-001: Page Load
- **Given**: User has 50 scans in database
- **When**: User navigates to /analytics
- **Then**:
  - AnalyticsPage renders
  - Date range filter shows (default: 30 days)
  - 3 KPI cards display
  - Top 5 products chart displays

### AC-002: KPI - Total Scans
- **Given**: User has 25 scans in last 30 days
- **When**: Date range is "30 ngày"
- **Then**:
  - "Tổng số scan" card shows "25"
  - Icon is TrendingUp
  - Color is primary blue

### AC-003: KPI - Total Cost
- **Given**: Scans have costs: $0.0001, $0.0002, $0.0001
- **When**: Date range includes all 3 scans
- **Then**:
  - "Tổng chi phí" card shows "$0.0004"
  - Icon is DollarSign
  - Color is success green

### AC-004: KPI - Average Confidence
- **Given**: Scans have fields with confidence: high, high, medium, low
- **When**: Calculating average
- **Then**:
  - high = 1.0, medium = 0.7, low = 0.4
  - Average = (1.0 + 1.0 + 0.7 + 0.4) / 4 = 0.775
  - "Độ tin cậy TB" card shows "78%"
  - Icon is Target
  - Color is warning yellow

### AC-005: Date Range Filter - 7 Days
- **Given**: User has scans from 5 days ago and 10 days ago
- **When**: User selects "7 ngày"
- **Then**:
  - Only scans from last 7 days are included
  - Scan from 10 days ago is excluded
  - KPIs recalculate

### AC-006: Date Range Filter - All Time
- **Given**: User has scans from various dates
- **When**: User selects "Tất cả"
- **Then**:
  - All scans are included
  - No date filtering applied
  - KPIs show lifetime totals

### AC-007: Top Products Chart
- **Given**: Scans have titles: "INVOICE A" (5x), "INVOICE B" (3x), "INVOICE C" (2x)
- **When**: Top products chart renders
- **Then**:
  - 3 bars display
  - "INVOICE A" is first with count 5
  - "INVOICE B" is second with count 3
  - "INVOICE C" is third with count 2
  - Bar widths are proportional (100%, 60%, 40%)

### AC-008: Top Products - Max 5
- **Given**: User has 10 different product titles
- **When**: Top products chart renders
- **Then**:
  - Only top 5 products display
  - Sorted by count descending
  - Products 6-10 are not shown

### AC-009: Empty State - No Scans
- **Given**: Database has 0 scans
- **When**: User views analytics
- **Then**:
  - Empty state displays
  - Icon: TrendingUp
  - Heading: "Chưa có dữ liệu thống kê"
  - Message: "Bắt đầu quét hóa đơn để xem thống kê chi tiết"

### AC-010: Empty State - No Scans in Range
- **Given**: User has scans but none in last 7 days
- **When**: User selects "7 ngày"
- **Then**:
  - KPIs show zeros
  - Top products chart shows "Chưa có dữ liệu"
  - Empty state displays

---

## CONSTRAINTS

### DO NOT:
- ❌ Implement real-time updates — calculate on page load only
- ❌ Add custom date picker — preset ranges only
- ❌ Implement chart library — simple CSS bars only
- ❌ Add export analytics — out of scope
- ❌ Show individual scan details — summary only
- ❌ Implement filtering by product — top 5 only

### REUSE:
- ✅ Layout component from TIP-003
- ✅ useScans hook from TIP-004
- ✅ Lucide React icons
- ✅ Tailwind utility classes

### SKIP (out of scope for TIP-015):
- ⏭️ Real-time updates
- ⏭️ Custom date picker
- ⏭️ Advanced charts (line, pie)
- ⏭️ Export analytics
- ⏭️ Drill-down to individual scans
- ⏭️ Filtering by product

---

## COMPLETION CHECKLIST

- [ ] `src/pages/AnalyticsPage.tsx` created
- [ ] Date range filter works (7d, 30d, 90d, all)
- [ ] KPI cards display correctly
- [ ] Total scans calculated correctly
- [ ] Total cost calculated correctly
- [ ] Average confidence calculated correctly
- [ ] Top 5 products chart displays
- [ ] Bar widths proportional to counts
- [ ] Empty state shows when no scans
- [ ] Empty state shows when no scans in range
- [ ] No TypeScript errors
- [ ] No console errors

---

*TIP-015 | Generated: 2026-05-05 | Vibecode Kit v5.0*
