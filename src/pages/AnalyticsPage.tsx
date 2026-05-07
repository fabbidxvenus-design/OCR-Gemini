import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useScans } from '@/hooks/useScans';
import { TrendingUp, DollarSign, Calendar, Key, CreditCard, ChevronRight } from 'lucide-react';
import { FilterChip } from '@/components/ui';

type DateRange = '7d' | '30d' | '90d' | 'all';

interface KPI {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const allScans = useScans({ limit: 1000, order: 'desc' });

  const filteredScans = useMemo(() => {
    if (!allScans || dateRange === 'all') return allScans || [];
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === '7d') cutoff.setDate(now.getDate() - 7);
    else if (dateRange === '30d') cutoff.setDate(now.getDate() - 30);
    else if (dateRange === '90d') cutoff.setDate(now.getDate() - 90);
    return allScans.filter((scan) => new Date(scan.timestamp) >= cutoff);
  }, [allScans, dateRange]);

  const kpis = useMemo<KPI[]>(() => {
    const totalScans = filteredScans?.length || 0;
    const totalCost = filteredScans?.reduce((sum, scan) => sum + scan.tokenUsage.cost, 0) || 0;
    const key1Scans = filteredScans?.filter(s => s.apiKeyIndex === 1).length || 0;
    const key2Scans = filteredScans?.filter(s => s.apiKeyIndex === 2).length || 0;

    return [
      { label: 'Tổng số scan', value: totalScans.toString(), icon: <TrendingUp className="w-6 h-6" />, color: 'text-primary', bg: 'bg-primary-light' },
      { label: 'Tổng chi phí', value: `$${totalCost.toFixed(3)}`, icon: <DollarSign className="w-6 h-6" />, color: 'text-success', bg: 'bg-success-light' },
      { label: 'API Key 1', value: `${key1Scans} scans`, icon: <Key className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'API Key 2', value: `${key2Scans} scans`, icon: <CreditCard className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];
  }, [filteredScans]);

  const topProducts = useMemo(() => {
    if (!filteredScans) return [];
    const counts = new Map<string, number>();
    filteredScans.forEach(s => {
      const t = s.ocrStructured?.title || 'Không rõ';
      counts.set(t, (counts.get(t) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredScans]);

  return (
    <Layout title="Thống kê">
      <div className="p-screen space-y-section pb-24 bg-surface min-h-full">
        {/* Date Range Chips */}
        <div className="bg-card rounded-2xl border border-card-border p-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-text-secondary">
            <Calendar className="w-4 h-4" />
            <span className="text-label font-bold uppercase tracking-widest">Thời gian</span>
          </div>
          <div className="flex gap-2">
            {[
              { v: '7d', l: '7 ngày' },
              { v: '30d', l: '30 ngày' },
              { v: '90d', l: '90 ngày' },
              { v: 'all', l: 'Tất cả' },
            ].map(o => (
              <FilterChip key={o.v} label={o.l} isActive={dateRange === o.v} onClick={() => setDateRange(o.v as DateRange)} className="flex-1" />
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-section">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-card rounded-2xl border border-card-border p-card shadow-card flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-label font-medium text-text-secondary uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-text-primary mt-0.5">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Products Card */}
        <div className="bg-card rounded-2xl border border-card-border p-card shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-body font-bold text-text-primary uppercase tracking-widest">Top sản phẩm</h3>
            <TrendingUp className="w-5 h-5 text-text-placeholder" />
          </div>

          {topProducts.length > 0 ? (
            <div className="space-y-5">
              {topProducts.map((p, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-small font-semibold text-text-primary truncate pr-4">
                      {i + 1}. {p.title}
                    </span>
                    <span className="text-small font-bold text-primary">{p.count}</span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(p.count / topProducts[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 opacity-50">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p className="text-small">Chưa có dữ liệu sản phẩm</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
