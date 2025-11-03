"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, Eye, Package } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Task {
  id: string;
  product_title: string;
  status: string;
  progress: number;
  total_images: number;
  processed_images: number;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("获取任务列表失败:", error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error("获取任务列表失败:", error);
    } finally {
      setLoading(false);
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
      case "packing":
        return <Badge className="bg-purple-500"><Package className="w-3 h-3 mr-1" />打包中</Badge>;
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>;
      case "failed":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">任务列表</h1>
          <p className="text-gray-600">查看所有图片处理任务的状态和进度</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#07c160]" />
          </div>
        ) : tasks.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无任务</h3>
            <p className="text-gray-500 mb-6">还没有创建任何处理任务</p>
            <Link href="/">
              <Button className="bg-[#07c160] hover:bg-[#06ad56]">
                创建新任务
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {task.product_title || "未命名任务"}
                      </h3>
                      {getStatusBadge(task.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">创建时间</p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(task.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">图片数量</p>
                        <p className="text-sm font-medium text-gray-700">
                          {task.processed_images} / {task.total_images}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">进度</p>
                        <p className="text-sm font-medium text-gray-700">
                          {task.progress}%
                        </p>
                      </div>
                      {task.completed_at && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">完成时间</p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(task.completed_at)}
                          </p>
                        </div>
                      )}
                    </div>

                    {(task.status === "processing" || task.status === "downloading" || task.status === "packing") && (
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#07c160] to-[#06ad56] h-full transition-all duration-500"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {task.error_message && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{task.error_message}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <Link href={`/tasks/${task.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
