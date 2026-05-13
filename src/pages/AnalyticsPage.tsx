import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useScans, getApiKeyUsageStats } from '@/hooks/useScans';
import { TrendingUp, DollarSign, Calendar, Key, Zap, Activity } from 'lucide-react';

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
  const [apiStats, setApiStats] = useState<{ key1Count: number; key2Count: number; key1Cost: number; key2Cost: number } | null>(null);

  useEffect(() => {
    getApiKeyUsageStats().then(setApiStats).catch(() => setApiStats(null));
  }, []);

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
    const avgCost = totalScans > 0 ? totalCost / totalScans : 0;

    const key1Scans = apiStats ? apiStats.key1Count : (filteredScans?.filter(s => s.apiKeyIndex === 1).length || 0);

    return [
      { label: 'Tổng số quét', value: totalScans.toString(), icon: <Activity className="h-6 w-6" />, color: 'text-primary', bg: 'bg-primary-light' },
      { label: 'Tổng chi phí', value: `$${totalCost.toFixed(3)}`, icon: <DollarSign className="h-6 w-6" />, color: 'text-success', bg: 'bg-success-light' },
      { label: 'Chi phí TB', value: `$${avgCost.toFixed(4)}`, icon: <TrendingUp className="h-6 w-6" />, color: 'text-secondary', bg: 'bg-secondary-light' },
      { label: 'API Key 1', value: `${key1Scans} lượt`, icon: <Key className="h-6 w-6" />, color: 'text-ai', bg: 'bg-ai-light' },
    ];
  }, [filteredScans, apiStats]);

  const modelUsage = useMemo(() => {
    if (!filteredScans) return [];
    const counts = new Map<string, number>();
    filteredScans.forEach(s => {
      const tier = s.modelTier || 'default';
      counts.set(tier, (counts.get(tier) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([tier, count]) => ({ tier, count }))
      .sort((a, b) => b.count - a.count);
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

  const dateRangeOptions = [
    { value: '7d' as DateRange, label: '7 ngày' },
    { value: '30d' as DateRange, label: '30 ngày' },
    { value: '90d' as DateRange, label: '90 ngày' },
    { value: 'all' as DateRange, label: 'Tất cả' },
  ];

  return (
    <Layout title="Phân tích">
      <div className="space-y-4 pb-24">
        <section className="card-production animate-fade-in p-4">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-text-muted" />
            <h3 className="text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">Khoảng thời gian</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {dateRangeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`rounded-xl border px-4 py-2.5 text-small font-semibold transition-all ${
                  dateRange === option.value
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-card-border bg-card text-text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="card-production flex items-center gap-4 p-4 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${kpi.bg} ${kpi.color}`}>
                {kpi.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-caption font-semibold uppercase tracking-[0.12em] text-text-muted">{kpi.label}</p>
                <p className="truncate font-display text-heading-sm text-text-primary">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="card-production animate-fade-in p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-heading-sm text-text-primary">Top sản phẩm</h3>
            <TrendingUp className="h-5 w-5 text-text-muted" />
          </div>

          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={i}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="truncate pr-4 text-small font-semibold text-text-primary">
                      {i + 1}. {p.title}
                    </span>
                    <span className="flex-shrink-0 text-small font-bold text-primary">{p.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                      style={{ width: `${(p.count / topProducts[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface">
                <TrendingUp className="h-6 w-6 text-text-muted" />
              </div>
              <p className="text-small text-text-secondary">Chưa có dữ liệu sản phẩm</p>
            </div>
          )}
        </section>

        <section className="card-production animate-fade-in p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-heading-sm text-text-primary">Sử dụng mô hình</h3>
            <Zap className="h-5 w-5 text-text-muted" />
          </div>

          {modelUsage.length > 0 ? (
            <div className="space-y-3">
              {modelUsage.map((m, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-surface p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ai-light">
                      <Zap className="h-5 w-5 text-ai" />
                    </div>
                    <div>
                      <p className="text-small font-semibold text-text-primary">{m.tier === 'flash' ? 'Gemini Flash' : 'Gemini Pro'}</p>
                      <p className="text-caption text-text-muted">{m.count} lượt quét</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-ai/30 bg-ai-light px-3 py-1 text-caption font-semibold text-ai">
                    {((m.count / filteredScans.length) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface">
                <Zap className="h-6 w-6 text-text-muted" />
              </div>
              <p className="text-small text-text-secondary">Chưa có dữ liệu mô hình</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
