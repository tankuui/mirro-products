"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface MetricsData {
  period: string;
  startTime: string;
  endTime: string;
  totalImages: number;
  passedCount: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  passRate: number;
  p0Rate: number;
  p1Rate: number;
  avgSSIM: number;
  avgPhashDistance: number;
  avgEdgeScore: number;
  avgGeomDelta: number;
  retryRate: number;
  errorsByType: Record<string, number>;
  targets: {
    p0RateTarget: number;
    totalFailRateStage1: number;
    totalFailRateStage2: number;
    p0RateMature: number;
  };
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [period, setPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/metrics?period=${period}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-[#07c160] animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">加载指标数据...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5] flex items-center justify-center">
        <p className="text-gray-600">无法加载指标数据</p>
      </div>
    );
  }

  const failRate = 100 - metrics.passRate;
  const stage1Met = failRate <= metrics.targets.totalFailRateStage1;
  const stage2Met = failRate <= metrics.targets.totalFailRateStage2;
  const p0Met = metrics.p0Rate <= metrics.targets.p0RateTarget;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">质量指标仪表板</h1>
              <p className="text-gray-600">实时监控图片修改质量和错误率</p>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-2 border-[#07c160] text-[#07c160] hover:bg-[#07c160] hover:text-white"
            >
              返回主页
            </Button>
          </div>

          <div className="flex gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map((p) => (
              <Button
                key={p}
                onClick={() => setPeriod(p)}
                variant={period === p ? 'default' : 'outline'}
                className={period === p ? 'bg-[#07c160] hover:bg-[#06ad56]' : ''}
              >
                {p === '1h' ? '1小时' : p === '24h' ? '24小时' : p === '7d' ? '7天' : '30天'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">总处理数</p>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{metrics.totalImages}</p>
            <p className="text-xs text-gray-500 mt-1">张图片</p>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">通过率</p>
              <CheckCircle className={`w-5 h-5 ${stage1Met ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
            <p className="text-3xl font-bold text-gray-800">{metrics.passRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {stage2Met ? '✅ 达标 Stage 2' : stage1Met ? '✅ 达标 Stage 1' : '❌ 未达标'}
            </p>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">P0 致命错误率</p>
              <AlertTriangle className={`w-5 h-5 ${p0Met ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <p className="text-3xl font-bold text-red-600">{metrics.p0Rate.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              目标: ≤{metrics.targets.p0RateTarget}% {p0Met ? '✅' : '❌'}
            </p>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">重试率</p>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{metrics.retryRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">需要重试的图片</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">错误分布</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">P0 致命</span>
                  <span className="text-sm font-bold text-red-600">{metrics.p0Count} ({metrics.p0Rate.toFixed(2)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${metrics.p0Rate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">P1 严重</span>
                  <span className="text-sm font-bold text-orange-600">{metrics.p1Count} ({metrics.p1Rate.toFixed(2)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${metrics.p1Rate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">P2 轻微</span>
                  <span className="text-sm font-bold text-yellow-600">{metrics.p2Count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${(metrics.p2Count / Math.max(1, metrics.totalImages)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">通过 OK</span>
                  <span className="text-sm font-bold text-green-600">{metrics.passedCount} ({metrics.passRate.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${metrics.passRate}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">质量指标平均值</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SSIM 相似度</span>
                <span className="text-lg font-bold text-gray-800">{metrics.avgSSIM.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">pHash 距离</span>
                <span className="text-lg font-bold text-gray-800">{metrics.avgPhashDistance.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">边缘质量分</span>
                <span className="text-lg font-bold text-gray-800">{metrics.avgEdgeScore.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">几何差异</span>
                <span className="text-lg font-bold text-gray-800">{(metrics.avgGeomDelta * 100).toFixed(2)}%</span>
              </div>
            </div>
          </Card>
        </div>

        {Object.keys(metrics.errorsByType).length > 0 && (
          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">错误原因 Top 10</h3>
            <div className="space-y-3">
              {Object.entries(metrics.errorsByType)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([reason, count]) => (
                  <div key={reason} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 flex-1">{reason}</span>
                    <span className="text-sm font-bold text-gray-800 ml-4">{count}</span>
                  </div>
                ))}
            </div>
          </Card>
        )}

        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
          <h3 className="text-lg font-bold text-blue-900 mb-3">🎯 质量目标</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-blue-800">第一阶段目标</p>
              <p className="text-blue-700">不合格率 ≤ {metrics.targets.totalFailRateStage1}%</p>
              <p className={failRate <= metrics.targets.totalFailRateStage1 ? 'text-green-600 font-bold' : 'text-orange-600'}>
                当前: {failRate.toFixed(2)}% {failRate <= metrics.targets.totalFailRateStage1 ? '✅' : '⏳'}
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">第二阶段目标</p>
              <p className="text-blue-700">不合格率 ≤ {metrics.targets.totalFailRateStage2}%</p>
              <p className={failRate <= metrics.targets.totalFailRateStage2 ? 'text-green-600 font-bold' : 'text-orange-600'}>
                当前: {failRate.toFixed(2)}% {failRate <= metrics.targets.totalFailRateStage2 ? '✅' : '⏳'}
              </p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">成熟期目标</p>
              <p className="text-blue-700">P0 ≤ {metrics.targets.p0RateMature}%</p>
              <p className={metrics.p0Rate <= metrics.targets.p0RateMature ? 'text-green-600 font-bold' : 'text-orange-600'}>
                当前: {metrics.p0Rate.toFixed(2)}% {metrics.p0Rate <= metrics.targets.p0RateMature ? '✅' : '⏳'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
