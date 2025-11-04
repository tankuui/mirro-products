"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle, XCircle, Clock, Eye, Package, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
        .limit(50);

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
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300"><Clock className="w-3 h-3 mr-1" />等待中</Badge>;
      case "downloading":
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />下载中</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />处理中</Badge>;
      case "packing":
        return <Badge className="bg-purple-500 hover:bg-purple-600"><Package className="w-3 h-3 mr-1" />打包中</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>;
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
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
    return formatDate(dateString);
  };

  const handleRowClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回主页
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#07c160] to-[#06ad56] rounded-2xl">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">任务列表</h1>
              <p className="text-gray-600">查看所有图片处理任务的状态和进度</p>
            </div>
          </div>
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
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-bold text-gray-700">任务名称</TableHead>
                  <TableHead className="font-bold text-gray-700">状态</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">图片数量</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">进度</TableHead>
                  <TableHead className="font-bold text-gray-700">创建时间</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRowClick(task.id)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {task.product_title || "未命名任务"}
                        </p>
                        {task.error_message && (
                          <p className="text-xs text-red-600 mt-1 line-clamp-1">
                            {task.error_message}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(task.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          {task.processed_images}
                        </span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-600">{task.total_images}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden min-w-[80px]">
                          <div
                            className="bg-gradient-to-r from-[#07c160] to-[#06ad56] h-full transition-all duration-500"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 min-w-[45px] text-right">
                          {task.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-700 font-medium">
                          {formatRelativeTime(task.created_at)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(task.created_at)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tasks/${task.id}`);
                        }}
                        className="hover:bg-[#07c160] hover:text-white hover:border-[#07c160]"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            共 {tasks.length} 个任务 · 每3秒自动刷新
          </p>
        </div>
      </div>
    </div>
  );
}
