import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { MODEL_CONFIGS } from '@/lib/models';
import { db } from '@/db/schema';
import Layout from '@/components/layout/Layout';
import Spinner from '@/components/ui/Spinner';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

interface TierStats {
  tier: 'free' | 'default' | 'high';
  count: number;
  totalTokens: number;
  totalCost: number;
}

export default function SettingsPage() {
  const { settings, isLoading, updateModelTier } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stats, setStats] = useState<TierStats[]>([]);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const scans = await db.scans.toArray();

      const tierMap = new Map<'free' | 'default' | 'high', TierStats>();

      scans.forEach((scan) => {
        const tier = scan.modelTier || 'default';
        const existing = tierMap.get(tier) || {
          tier,
          count: 0,
          totalTokens: 0,
          totalCost: 0,
        };

        existing.count += 1;
        existing.totalTokens += scan.tokenUsage.input + scan.tokenUsage.output;
        existing.totalCost += scan.tokenUsage.cost;

        tierMap.set(tier, existing);
      });

      setStats(Array.from(tierMap.values()));
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleTierChange = async (tier: 'free' | 'default' | 'high') => {
    setIsSaving(true);
    try {
      await updateModelTier(tier);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to update tier:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExpanded = (tierId: string) => {
    setExpandedTier(expandedTier === tierId ? null : tierId);
  };

  if (isLoading) {
    return (
      <Layout title="Cài đặt" showBottomNav>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cài đặt" showBottomNav>
      <div className="p-4 space-y-6 pb-24">
        {/* Model Tier Selection */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Chất lượng OCR
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Chọn mô hình AI để xử lý OCR. Mô hình cao cấp hơn cho độ chính xác tốt hơn nhưng tốn phí nhiều hơn.
          </p>

          <div className="space-y-3">
            {(['free', 'default', 'high'] as const).map((tier) => {
              const config = MODEL_CONFIGS[tier];
              const isSelected = settings.selectedModelTier === tier;

              return (
                <button
                  key={tier}
                  onClick={() => handleTierChange(tier)}
                  disabled={isSaving}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {config.name}
                        </span>
                        {isSelected && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {config.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>Model: {config.model}</div>
                        <div>
                          Giá: ${config.pricing.input}/1M input tokens, $
                          {config.pricing.output}/1M output tokens
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {showSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✓ Đã lưu cài đặt thành công
            </div>
          )}
        </section>

        {/* Token Usage Statistics */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê sử dụng
          </h2>

          {stats.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Chưa có dữ liệu thống kê
            </p>
          ) : (
            <div className="space-y-3">
              {stats.map((stat) => {
                const config = MODEL_CONFIGS[stat.tier];
                const isExpanded = expandedTier === stat.tier;

                return (
                  <div
                    key={stat.tier}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpanded(stat.tier)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">
                          {config.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {stat.count} lần quét • {stat.totalTokens.toLocaleString()} tokens
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ${stat.totalCost.toFixed(4)}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-600">Số lần quét</div>
                            <div className="font-semibold text-gray-900">
                              {stat.count}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Tổng tokens</div>
                            <div className="font-semibold text-gray-900">
                              {stat.totalTokens.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Trung bình/lần</div>
                            <div className="font-semibold text-gray-900">
                              {Math.round(stat.totalTokens / stat.count).toLocaleString()} tokens
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Tổng chi phí</div>
                            <div className="font-semibold text-gray-900">
                              ${stat.totalCost.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Model Details */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Chi tiết mô hình
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Tier</h3>
              <p className="text-gray-600">
                Sử dụng mô hình miễn phí từ OpenRouter. Tốc độ nhanh nhất nhưng độ chính xác thấp hơn.
                Phù hợp cho hóa đơn đơn giản, rõ ràng.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Default Quality</h3>
              <p className="text-gray-600">
                Sử dụng Gemini 2.0 Flash. Cân bằng giữa tốc độ và độ chính xác.
                Được khuyến nghị cho hầu hết các trường hợp.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">High Quality</h3>
              <p className="text-gray-600">
                Sử dụng Gemini Pro 1.5. Độ chính xác cao nhất.
                Phù hợp cho ảnh chất lượng thấp hoặc văn bản phức tạp.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
