import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useScans } from '@/hooks/useScans';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

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
      ];
    }

    const totalScans = filteredScans.length;
    const totalCost = filteredScans.reduce((sum, scan) => sum + scan.tokenUsage.cost, 0);

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
    ];
  }, [filteredScans]);

  const topProducts = useMemo<ProductCount[]>(() => {
    if (!filteredScans || filteredScans.length === 0) return [];

    const productCounts = new Map<string, number>();

    filteredScans.forEach((scan) => {
      const title = scan.ocrStructured?.title || 'Không có tiêu đề';
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