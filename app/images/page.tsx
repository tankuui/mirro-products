"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ImageRecord {
  id: string;
  task_id: string;
  original_url: string;
  modified_url: string;
  status: string;
  similarity: number;
  difference: number;
  user_feedback_status: string;
  regeneration_count: number;
  created_at: string;
  processing_time: number;
  error_message: string;
}

interface TaskGroup {
  task_id: string;
  task_title: string;
  created_at: string;
  images: ImageRecord[];
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'images' | 'tasks'>('images');
  const [feedbackImageId, setFeedbackImageId] = useState<string | null>(null);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const { data: imageData, error: imageError } = await supabase
        .from("image_records")
        .select(`
          id,
          task_id,
          original_url,
          modified_url,
          status,
          similarity,
          difference,
          user_feedback_status,
          regeneration_count,
          created_at,
          processing_time,
          error_message
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (imageError) {
        console.error("获取图片列表失败:", imageError);
        return;
      }

      setImages(imageData || []);

      const taskIds = Array.from(new Set(imageData?.map(img => img.task_id) || []));
      const { data: taskData } = await supabase
        .from("tasks")
        .select("id, product_title, created_at")
        .in("id", taskIds);

      const taskMap = new Map(taskData?.map(t => [t.id, t]) || []);

      const groups: TaskGroup[] = [];
      taskIds.forEach(taskId => {
        const taskInfo = taskMap.get(taskId);
        const taskImages = imageData?.filter(img => img.task_id === taskId) || [];
        if (taskImages.length > 0) {
          groups.push({
            task_id: taskId,
            task_title: taskInfo?.product_title || "未命名任务",
            created_at: taskInfo?.created_at || taskImages[0].created_at,
            images: taskImages,
          });
        }
      });

      setTaskGroups(groups);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `image_${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("下载成功");
    } catch (error) {
      console.error("下载失败:", error);
      toast.error("下载失败");
    }
  };

  const handleFeedbackSubmit = async (imageId: string, status: 'pass' | 'fail') => {
    try {
      const response = await fetch(`/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageRecordId: imageId,
          taskId: images.find(img => img.id === imageId)?.task_id,
          status,
          errorTypes: selectedErrors,
          detailedFeedback: feedbackText,
          severity: selectedErrors.some(e => e.includes('P0')) ? 'P0' :
                    selectedErrors.some(e => e.includes('P1')) ? 'P1' :
                    selectedErrors.length > 0 ? 'P2' : 'OK'
        })
      });

      if (!response.ok) throw new Error('提交反馈失败');

      toast.success(status === 'pass' ? '感谢您的反馈!' : '我们会尽快改进!');
      setFeedbackImageId(null);
      setSelectedErrors([]);
      setFeedbackText("");
      fetchData();
    } catch (error) {
      console.error('提交反馈失败:', error);
      toast.error('提交反馈失败');
    }
  };

  const handleRegenerate = async (imageId: string, taskId: string) => {
    try {
      setRegenerating(imageId);
      const response = await fetch(`/api/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageRecordId: imageId, taskId })
      });

      if (!response.ok) throw new Error('重新生成失败');

      toast.success('已开始重新生成，请稍候...');
      setTimeout(() => fetchData(), 2000);
    } catch (error) {
      console.error('重新生成失败:', error);
      toast.error('重新生成失败');
    } finally {
      setRegenerating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />处理中</Badge>;
      case "failed":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderImageRow = (image: ImageRecord) => (
    <TableRow key={image.id} className="hover:bg-gray-50">
      <TableCell className="w-[80px]">
        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
      </TableCell>
      <TableCell className="font-mono text-sm">{image.id.slice(0, 8)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <img
            src={image.original_url}
            alt="原图"
            className="w-24 h-24 object-contain border rounded"
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {image.status === "completed" && image.modified_url ? (
            <img
              src={image.modified_url}
              alt="修改后"
              className="w-24 h-24 object-contain border rounded"
            />
          ) : image.status === "processing" ? (
            <div className="w-24 h-24 flex items-center justify-center border rounded bg-gray-50">
              <Loader2 className="w-6 h-6 animate-spin text-[#07c160]" />
            </div>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center border rounded bg-gray-50">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {getStatusBadge(image.status)}
        {image.user_feedback_status === 'pass' && (
          <Badge className="ml-2 bg-blue-500">已反馈</Badge>
        )}
        {image.user_feedback_status === 'fail' && (
          <Badge className="ml-2 bg-orange-500">待改进</Badge>
        )}
      </TableCell>
      <TableCell>
        {image.difference !== null && (
          <div className="text-sm">
            <div className="font-semibold text-[#07c160]">{image.difference.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">差异度</div>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="text-sm text-gray-600">
          {formatDate(image.created_at)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {image.status === "completed" && image.modified_url && (
            <>
              {feedbackImageId === image.id ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700">选择问题:</div>
                  <div className="space-y-1">
                    {[
                      { id: 'product_shape_changed', label: '产品形状改变' },
                      { id: 'product_color_changed', label: '产品颜色改变' },
                      { id: 'background_insufficient', label: '背景变化不足' },
                      { id: 'logo_not_removed', label: 'Logo未移除' },
                    ].map(error => (
                      <label key={error.id} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedErrors.includes(error.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedErrors([...selectedErrors, error.id]);
                            } else {
                              setSelectedErrors(selectedErrors.filter(id => id !== error.id));
                            }
                          }}
                          className="w-3 h-3 rounded"
                        />
                        {error.label}
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="详细描述..."
                    className="w-full p-1 text-xs border rounded resize-none"
                    rows={2}
                  />
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleFeedbackSubmit(image.id, 'fail')}
                      size="sm"
                      className="text-xs h-7 bg-[#07c160]"
                    >
                      提交
                    </Button>
                    <Button
                      onClick={() => setFeedbackImageId(null)}
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {image.user_feedback_status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleFeedbackSubmit(image.id, 'pass')}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        满意
                      </Button>
                      <Button
                        onClick={() => setFeedbackImageId(image.id)}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        有问题
                      </Button>
                    </>
                  )}
                  {image.user_feedback_status === 'fail' && (
                    <Button
                      onClick={() => handleRegenerate(image.id, image.task_id)}
                      disabled={regenerating === image.id}
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-orange-500 text-orange-600"
                    >
                      {regenerating === image.id ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      精修
                    </Button>
                  )}
                </>
              )}
              <Button
                onClick={() => handleDownload(image.modified_url, image.id)}
                size="sm"
                variant="outline"
                className="text-xs h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                下载
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#07c160]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5]">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回主页
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#07c160] to-[#06ad56] rounded-2xl">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">图片管理</h1>
              <p className="text-gray-600">查看所有处理过的图片，支持反馈和重新生成</p>
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="images">按图片</TabsTrigger>
              <TabsTrigger value="tasks">按批次</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="overflow-hidden">
          {viewMode === 'images' ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-[80px]">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  </TableHead>
                  <TableHead className="font-bold text-gray-700">ID</TableHead>
                  <TableHead className="font-bold text-gray-700">原图</TableHead>
                  <TableHead className="font-bold text-gray-700">修改后</TableHead>
                  <TableHead className="font-bold text-gray-700">状态</TableHead>
                  <TableHead className="font-bold text-gray-700">差异度</TableHead>
                  <TableHead className="font-bold text-gray-700">创建时间</TableHead>
                  <TableHead className="font-bold text-gray-700">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map(renderImageRow)}
              </TableBody>
            </Table>
          ) : (
            <div className="divide-y">
              {taskGroups.map((group) => (
                <div key={group.task_id} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{group.task_title}</h3>
                    <p className="text-sm text-gray-500">{formatDate(group.created_at)} · {group.images.length} 张图片</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="w-[80px]">
                          <input type="checkbox" className="w-4 h-4 rounded" />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>原图</TableHead>
                        <TableHead>修改后</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>差异度</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.images.map(renderImageRow)}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            共 {images.length} 张图片 · 每5秒自动刷新
          </p>
        </div>
      </div>
    </div>
  );
}
