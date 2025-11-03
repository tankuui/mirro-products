"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Download,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Task {
  id: string;
  product_title: string;
  product_url: string;
  status: string;
  progress: number;
  current_step: string;
  total_images: number;
  processed_images: number;
  original_description: string;
  modified_description: string;
  error_message: string;
  created_at: string;
  completed_at: string;
}

interface ImageRecord {
  id: string;
  original_url: string;
  modified_url: string;
  status: string;
  similarity: number;
  difference: number;
  error_message: string;
  processing_time: number;
}

interface LogEntry {
  id: string;
  log_type: string;
  message: string;
  created_at: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskDetails();

    const interval = setInterval(() => {
      if (task?.status === "processing" || task?.status === "downloading" || task?.status === "pending") {
        fetchTaskDetails();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, task?.status]);

  const fetchTaskDetails = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        throw new Error("获取任务详情失败");
      }

      const data = await response.json();
      setTask(data.task);
      setImages(data.images || []);
      setLogs(data.logs || []);
    } catch (error) {
      console.error("获取任务详情失败:", error);
      toast.error("获取任务详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `modified_${task?.product_title || "image"}_${index + 1}.png`;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-gray-500"><Clock className="w-3 h-3 mr-1" />等待中</Badge>;
      case "downloading":
        return <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />下载中</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />处理中</Badge>;
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>;
      case "failed":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#07c160]" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5] flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">任务不存在</h2>
          <p className="text-gray-600 mb-6">未找到该任务，可能已被删除</p>
          <Link href="/tasks">
            <Button className="bg-[#07c160] hover:bg-[#06ad56]">
              返回任务列表
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <div className="mb-6">
          <Link href="/tasks">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回任务列表
            </Button>
          </Link>
        </div>

        <Card className="p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                {task.product_title || "未命名任务"}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                {getStatusBadge(task.status)}
                <span className="text-sm text-gray-600">
                  创建时间：{new Date(task.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
            </div>
          </div>

          {task.product_url && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">商品链接</p>
              <a
                href={task.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#07c160] hover:underline text-sm break-all"
              >
                {task.product_url}
              </a>
            </div>
          )}

          {(task.status === "processing" || task.status === "downloading") && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {task.current_step}
                </span>
                <span className="text-sm font-semibold text-[#07c160]">
                  {task.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#07c160] to-[#06ad56] h-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                已处理 {task.processed_images} / {task.total_images} 张图片
              </p>
            </div>
          )}

          {task.error_message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 mb-1">处理失败</p>
                  <p className="text-sm text-red-600">{task.error_message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">图片总数</p>
              <p className="text-2xl font-bold text-gray-800">{task.total_images}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">已处理</p>
              <p className="text-2xl font-bold text-green-600">{task.processed_images}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">处理进度</p>
              <p className="text-2xl font-bold text-blue-600">{task.progress}%</p>
            </div>
          </div>
        </Card>

        {task.original_description && (
          <Card className="p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">商品描述</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">原始描述</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {task.original_description}
                  </p>
                </div>
              </div>
              {task.modified_description && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2">改写后描述</h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {task.modified_description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {images.length > 0 && (
          <Card className="p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              处理图片 ({images.filter(img => img.status === "completed").length} / {images.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white"
                >
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 text-center">原图</p>
                      <div className="aspect-square relative bg-white rounded-lg overflow-hidden border-2 border-gray-300">
                        <img
                          src={image.original_url}
                          alt={`原图 ${index + 1}`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-xs font-semibold text-[#07c160] text-center">修改后</p>
                        {getStatusBadge(image.status)}
                      </div>
                      <div className="aspect-square relative bg-white rounded-lg overflow-hidden border-2 border-[#07c160]">
                        {image.status === "completed" && image.modified_url ? (
                          <img
                            src={image.modified_url}
                            alt={`修改后 ${index + 1}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : image.status === "processing" ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-[#07c160]" />
                          </div>
                        ) : image.status === "failed" ? (
                          <div className="flex flex-col items-center justify-center h-full p-4">
                            <XCircle className="w-8 h-8 text-red-500 mb-2" />
                            <p className="text-xs text-red-600 text-center">
                              {image.error_message || "处理失败"}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Clock className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {image.status === "completed" && image.modified_url && (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <span className="text-sm text-gray-600 block mb-1">差异度</span>
                          <span className="text-xl font-bold text-[#07c160]">
                            {image.difference?.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex-1 text-center">
                          <span className="text-sm text-gray-600 block mb-1">相似度</span>
                          <span className="text-lg font-semibold text-gray-700">
                            {image.similarity?.toFixed(1)}%
                          </span>
                        </div>
                        {image.processing_time && (
                          <div className="flex-1 text-right">
                            <span className="text-sm text-gray-600 block mb-1">耗时</span>
                            <span className="text-sm font-medium text-gray-700">
                              {(image.processing_time / 1000).toFixed(1)}秒
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDownloadImage(image.modified_url, index)}
                        className="w-full bg-[#07c160] hover:bg-[#06ad56] text-white font-semibold rounded-xl"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下载修改后图片
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {logs.length > 0 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">处理日志</h2>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {getLogIcon(log.log_type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
