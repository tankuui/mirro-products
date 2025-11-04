"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  TrendingUp,
  Eye,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ErrorPattern {
  id: string;
  error_type: string;
  error_category: string;
  description: string;
  occurrence_count: number;
  success_count: number;
  is_resolved: boolean;
  priority: string;
  last_occurred_at: string;
  fix_strategy: string | object;
}

interface HumanReview {
  id: string;
  status: string;
  error_types: string[];
  severity: string;
  detailed_feedback: string;
  created_at: string;
  image_record_id: string;
  task_id: string;
  image_records?: {
    original_url: string;
    modified_url: string;
    similarity: number;
    difference: number;
  };
}

interface ErrorStats {
  totalReviews: number;
  totalErrors: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  passCount: number;
  failRate: number;
}

export default function ErrorsPage() {
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([]);
  const [recentReviews, setRecentReviews] = useState<HumanReview[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    totalReviews: 0,
    totalErrors: 0,
    p0Count: 0,
    p1Count: 0,
    p2Count: 0,
    passCount: 0,
    failRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [expandedError, setExpandedError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let dateFilter = new Date();
      if (timeRange === '24h') {
        dateFilter.setHours(dateFilter.getHours() - 24);
      } else if (timeRange === '7d') {
        dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (timeRange === '30d') {
        dateFilter.setDate(dateFilter.getDate() - 30);
      }

      const { data: patterns } = await supabase
        .from('error_patterns')
        .select('*')
        .order('occurrence_count', { ascending: false });

      const reviewsQuery = supabase
        .from('human_reviews')
        .select(`
          *,
          image_records (
            original_url,
            modified_url,
            similarity,
            difference
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (timeRange !== 'all') {
        reviewsQuery.gte('created_at', dateFilter.toISOString());
      }

      const { data: reviews } = await reviewsQuery;

      setErrorPatterns(patterns || []);
      setRecentReviews(reviews || []);

      const totalReviews = reviews?.length || 0;
      const p0 = reviews?.filter(r => r.severity === 'P0').length || 0;
      const p1 = reviews?.filter(r => r.severity === 'P1').length || 0;
      const p2 = reviews?.filter(r => r.severity === 'P2').length || 0;
      const pass = reviews?.filter(r => r.status === 'pass').length || 0;

      setStats({
        totalReviews,
        totalErrors: p0 + p1 + p2,
        p0Count: p0,
        p1Count: p1,
        p2Count: p2,
        passCount: pass,
        failRate: totalReviews > 0 ? ((totalReviews - pass) / totalReviews) * 100 : 0,
      });
    } catch (error) {
      console.error('获取错误数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'P0':
        return <Badge className="bg-red-600">P0 致命</Badge>;
      case 'P1':
        return <Badge className="bg-orange-500">P1 严重</Badge>;
      case 'P2':
        return <Badge className="bg-yellow-500">P2 轻微</Badge>;
      default:
        return <Badge className="bg-green-500">OK</Badge>;
    }
  };

  const getErrorTypeName = (errorType: string): string => {
    const names: Record<string, string> = {
      'product_shape_changed': '产品形状改变',
      'product_color_changed': '产品颜色改变',
      'product_size_wrong': '产品尺寸错误',
      'background_insufficient': '背景变化不足',
      'background_too_different': '背景变化过大',
      'logo_not_removed': 'Logo未移除',
      'text_missing': '文字丢失',
      'new_logo_unclear': '新Logo不清晰',
      'image_blurry': '图片模糊',
      'dimension_mismatch': '尺寸不匹配',
    };
    return names[errorType] || errorType;
  };

  const exportErrorReport = () => {
    const csvContent = [
      ['错误类型', '描述', '出现次数', '解决次数', '优先级', '最后出现时间'],
      ...errorPatterns.map(p => [
        getErrorTypeName(p.error_type),
        p.description,
        p.occurrence_count,
        p.success_count,
        p.priority,
        new Date(p.last_occurred_at).toLocaleString('zh-CN')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `错误报告_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5] flex items-center justify-center">
        <RefreshCw className="w-10 h-10 animate-spin text-[#07c160]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">错误分析中心</h1>
            <p className="text-gray-600">查看用户反馈和错误模式,持续优化系统</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportErrorReport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出报告
            </Button>
            <Link href="/">
              <Button className="bg-[#07c160] hover:bg-[#06ad56]">
                返回主页
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(['24h', '7d', '30d', 'all'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              className={timeRange === range ? 'bg-[#07c160] hover:bg-[#06ad56]' : ''}
              size="sm"
            >
              {range === '24h' ? '24小时' : range === '7d' ? '7天' : range === '30d' ? '30天' : '全部'}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">总反馈数</p>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalReviews}</p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">失败率</p>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.failRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              目标: &lt; 5% (当前: {stats.failRate < 5 ? '✅' : '⏳'})
            </p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">P0 致命错误</p>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.p0Count}</p>
            <p className="text-xs text-gray-500 mt-1">
              占比: {stats.totalReviews > 0 ? ((stats.p0Count / stats.totalReviews) * 100).toFixed(1) : 0}%
            </p>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">通过数</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.passCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              通过率: {stats.totalReviews > 0 ? ((stats.passCount / stats.totalReviews) * 100).toFixed(1) : 0}%
            </p>
          </Card>
        </div>

        <Tabs defaultValue="patterns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="patterns">错误模式</TabsTrigger>
            <TabsTrigger value="reviews">最近反馈</TabsTrigger>
          </TabsList>

          <TabsContent value="patterns">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                常见错误模式 (按出现频率排序)
              </h2>
              <div className="space-y-3">
                {errorPatterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setExpandedError(expandedError === pattern.id ? null : pattern.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Badge className={
                            pattern.error_category === 'P0_critical' ? 'bg-red-600' :
                            pattern.error_category === 'P1_major' ? 'bg-orange-500' :
                            'bg-yellow-500'
                          }>
                            {pattern.error_category.replace('_', ' ')}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {getErrorTypeName(pattern.error_type)}
                            </p>
                            <p className="text-sm text-gray-600">{pattern.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{pattern.occurrence_count}</p>
                            <p className="text-xs text-gray-500">出现次数</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{pattern.success_count}</p>
                            <p className="text-xs text-gray-500">成功修正</p>
                          </div>
                          {expandedError === pattern.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedError === pattern.id && (
                      <div className="p-4 bg-white border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">优先级</p>
                            <p className="font-semibold">{pattern.priority}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">最后出现</p>
                            <p className="font-semibold">
                              {new Date(pattern.last_occurred_at).toLocaleString('zh-CN')}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-600 mb-1">修正策略</p>
                            <pre className="text-xs bg-gray-50 p-2 rounded">
                              {JSON.stringify(JSON.parse(pattern.fix_strategy as any), null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                最近用户反馈 ({recentReviews.length})
              </h2>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg overflow-hidden bg-white">
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getSeverityBadge(review.severity)}
                          <Badge className={review.status === 'pass' ? 'bg-green-500' : 'bg-red-500'}>
                            {review.status === 'pass' ? '通过' : '失败'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      {review.error_types && review.error_types.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">错误类型:</p>
                          <div className="flex flex-wrap gap-2">
                            {review.error_types.map((type, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {getErrorTypeName(type)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {review.detailed_feedback && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">详细反馈:</p>
                          <p className="text-sm text-gray-600">{review.detailed_feedback}</p>
                        </div>
                      )}
                    </div>

                    {review.image_records && (
                      <div className="p-4 bg-white border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">原图</p>
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={review.image_records.original_url}
                                alt="原图"
                                className="w-full h-64 object-contain cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(review.image_records!.original_url, '_blank')}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">修改后</p>
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              {review.image_records.modified_url ? (
                                <img
                                  src={review.image_records.modified_url}
                                  alt="修改后"
                                  className="w-full h-64 object-contain cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => window.open(review.image_records!.modified_url!, '_blank')}
                                />
                              ) : (
                                <div className="w-full h-64 flex items-center justify-center text-gray-400">
                                  未生成
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {review.image_records.similarity !== null && review.image_records.difference !== null && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">相似度</p>
                              <p className="text-lg font-bold text-gray-800">
                                {Number(review.image_records.similarity).toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">差异度</p>
                              <p className="text-lg font-bold text-[#07c160]">
                                {Number(review.image_records.difference).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
