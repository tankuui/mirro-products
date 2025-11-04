"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Download, Loader2, Image as ImageIcon, CheckCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ModifiedImage {
  url: string;
  originalUrl: string;
  similarity: number;
  difference: number;
}

interface JobResult {
  jobId: string;
  status: "processing" | "completed" | "error";
  images?: ModifiedImage[];
  error?: string;
}

interface ProgressInfo {
  current: number;
  total: number;
  currentFile: string;
}

export default function Home() {
  const [productUrl, setProductUrl] = useState("");
  const [logoText, setLogoText] = useState("");
  const [modificationLevel, setModificationLevel] = useState([100]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast.error("请选择有效的图片文件");
      return;
    }

    if (imageFiles.length > 50) {
      toast.error("最多只能上传50张图片");
      return;
    }

    setUploadedFiles(imageFiles);
    setProductUrl("");
    toast.success(`已选择 ${imageFiles.length} 张图片`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0 && !productUrl.trim()) {
      toast.error("请上传图片或输入图片链接");
      return;
    }

    if (uploadedFiles.length > 0) {
      await handleBatchProcess();
    } else {
      await handleSingleUrlProcess();
    }
  };

  const handleBatchProcess = async () => {
    setLoading(true);
    setResult({ jobId: "", status: "processing" });
    setProgress({ current: 0, total: uploadedFiles.length, currentFile: "" });

    try {
      const taskId = `task_${Date.now()}`;
      const imageRecords = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const reader = new FileReader();

        const imageData = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        imageRecords.push({
          id: `img_${Date.now()}_${i}`,
          task_id: taskId,
          original_url: imageData,
          modified_url: null,
          status: 'pending',
          user_feedback_status: 'pending',
          regeneration_count: 0,
          final_approval_status: 'pending',
          similarity: null,
          difference: null,
          created_at: new Date().toISOString(),
        });
      }

      const existingImages = JSON.parse(localStorage.getItem('imageRecords') || '[]');
      localStorage.setItem('imageRecords', JSON.stringify([...imageRecords, ...existingImages]));

      const task = {
        id: taskId,
        product_title: logoText.trim() || '批量图片修改',
        status: 'pending',
        total_images: uploadedFiles.length,
        processed_images: 0,
        created_at: new Date().toISOString(),
      };

      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      localStorage.setItem('tasks', JSON.stringify([task, ...existingTasks]));

      setResult({
        jobId: taskId,
        status: "processing",
      });

      toast.success(`已保存${uploadedFiles.length}张图片！请前往图片管理页面查看`);

      setTimeout(() => {
        window.location.href = '/images';
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "发生未知错误";
      setResult({
        jobId: `job_${Date.now()}`,
        status: "error",
        error: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleSingleUrlProcess = async () => {
    if (!productUrl.trim()) {
      toast.error("请输入商品链接或图片链接");
      return;
    }

    const isImageUrl = /\.(jpg|jpeg|png|webp|gif)(\?|$|#)/i.test(productUrl);

    if (!isImageUrl) {
      toast.error("请使用图片直链（.jpg/.png/.webp格式）");
      setResult({
        jobId: `job_${Date.now()}`,
        status: "error",
        error: "请直接使用图片链接。\n\n对于OZON等平台：\n1. 右键点击商品图\n2. 选择'在新标签页中打开图片'\n3. 复制浏览器地址栏中的链接"
      });
      return;
    }

    setLoading(true);
    setResult({ jobId: "", status: "processing" });

    try {
      const taskId = `task_${Date.now()}`;
      const imageId = `img_${Date.now()}`;

      const imageRecord = {
        id: imageId,
        task_id: taskId,
        original_url: productUrl,
        modified_url: null,
        status: 'pending',
        user_feedback_status: 'pending',
        regeneration_count: 0,
        final_approval_status: 'pending',
        similarity: null,
        difference: null,
        created_at: new Date().toISOString(),
      };

      const existingImages = JSON.parse(localStorage.getItem('imageRecords') || '[]');
      localStorage.setItem('imageRecords', JSON.stringify([imageRecord, ...existingImages]));

      const task = {
        id: taskId,
        product_title: logoText.trim() || '单张图片修改',
        status: 'pending',
        total_images: 1,
        processed_images: 0,
        created_at: new Date().toISOString(),
      };

      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      localStorage.setItem('tasks', JSON.stringify([task, ...existingTasks]));

      setResult({
        jobId: taskId,
        status: "processing",
      });

      toast.success(`任务已创建！请前往图片管理页面查看处理进度`);

      setTimeout(() => {
        window.location.href = '/images';
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "发生未知错误";
      setResult({
        jobId: `job_${Date.now()}`,
        status: "error",
        error: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `modified_product_${index + 1}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("下载成功");
    } catch (error) {
      console.error("下载失败:", error);
      toast.error("下载失败，请重试");
    }
  };

  const handleBatchDownload = async () => {
    if (!result?.images) return;

    toast.info(`开始批量下载 ${result.images.length} 张图片...`);

    for (let i = 0; i < result.images.length; i++) {
      await handleDownload(result.images[i].url, i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    toast.success("批量下载完成");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5]">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#07c160] to-[#06ad56] rounded-3xl mb-4 shadow-lg shadow-green-500/30">
            <ImageIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 tracking-tight">
            商品主图修改
          </h1>
          <p className="text-gray-600 text-lg">AI 智能批量修改商品图片，支持最多50张同时处理</p>
          <div className="flex gap-3 justify-center mt-4 flex-wrap">
            <a href="/images">
              <Button variant="outline" size="sm" className="border-[#07c160] text-[#07c160] hover:bg-green-50">
                图片管理
              </Button>
            </a>
            <a href="/tasks">
              <Button variant="outline" size="sm">
                任务列表
              </Button>
            </a>
            <a href="/errors">
              <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                错误分析
              </Button>
            </a>
            <a href="/metrics">
              <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                质量指标
              </Button>
            </a>
          </div>
        </div>

        <Card className="p-6 md:p-10 shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-sm">
          <div className="space-y-8">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                上传图片（批量处理）
              </label>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-[#07c160] hover:bg-green-50 transition-all rounded-xl"
                  disabled={loading}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-600 font-medium">点击上传图片</span>
                    <span className="text-xs text-gray-400">支持批量上传，最多50张</span>
                  </div>
                </Button>

                {uploadedFiles.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-green-800">
                        已选择 {uploadedFiles.length} 张图片
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFiles([])}
                        className="text-green-700 hover:text-green-900"
                      >
                        清空
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-white rounded-lg overflow-hidden border border-green-200">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500 font-medium">或</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <label className="block text-base font-semibold text-gray-800 mb-3">
                输入图片链接（单张处理）
              </label>
              <Input
                type="url"
                placeholder="直接粘贴图片地址（.jpg/.png/.webp）"
                value={productUrl}
                onChange={(e) => {
                  setProductUrl(e.target.value);
                  if (e.target.value && uploadedFiles.length > 0) {
                    setUploadedFiles([]);
                  }
                }}
                className="w-full h-14 text-base rounded-xl border-2 border-gray-200 focus:border-[#07c160] transition-colors"
                disabled={loading || uploadedFiles.length > 0}
              />
              <p className="text-xs text-gray-500 mt-2">
                提示：如果网页抓取失败，可直接右键商品图片"复制图片地址"后粘贴
              </p>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-800 mb-3">
                自定义 Logo 文字（可选）
              </label>
              <Input
                type="text"
                placeholder="输入您的品牌名称或 Logo 文字，留空则不添加"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                className="w-full h-14 text-base rounded-xl border-2 border-gray-200 focus:border-[#07c160] transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                AI 将移除原图中的 Logo，并将您的文字作为新 Logo 添加到图片中
              </p>
            </div>


            <Button
              onClick={handleSubmit}
              disabled={loading || (uploadedFiles.length === 0 && !productUrl.trim())}
              className="w-full bg-gradient-to-r from-[#07c160] to-[#06ad56] hover:from-[#06ad56] hover:to-[#059c4c] text-white h-16 text-lg font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  AI 处理中...
                  {progress && (
                    <span className="ml-2 text-sm">
                      ({progress.current}/{progress.total})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <ImageIcon className="mr-3 h-6 w-6" />
                  {uploadedFiles.length > 0
                    ? `批量处理 ${uploadedFiles.length} 张图片`
                    : "开始 AI 修改"}
                </>
              )}
            </Button>
          </div>
        </Card>

        {result && result.status !== "processing" && (
          <Card className="mt-8 p-6 md:p-10 shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-sm">
            {result.status === "error" ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <span className="text-3xl">❌</span>
                </div>
                <p className="text-lg font-semibold text-red-600 mb-2">处理失败</p>
                <p className="text-gray-600 whitespace-pre-line">{result.error}</p>
              </div>
            ) : result.status === "completed" && result.images && result.images.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#07c160]" />
                    <h3 className="text-2xl font-bold text-gray-800">
                      修改完成
                    </h3>
                    <span className="px-3 py-1 bg-[#07c160] text-white rounded-full text-sm font-semibold">
                      {result.images.length} 张
                    </span>
                  </div>
                  {result.images.length > 1 && (
                    <Button
                      onClick={handleBatchDownload}
                      variant="outline"
                      className="text-[#07c160] border-2 border-[#07c160] hover:bg-[#07c160] hover:text-white font-semibold rounded-xl transition-all"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      批量下载
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {result.images.map((image, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow"
                    >
                      <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-600 text-center">原图</p>
                          <div className="aspect-square relative bg-white rounded-lg overflow-hidden border-2 border-gray-300">
                            <img
                              src={image.originalUrl}
                              alt={`原图 ${index + 1}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-[#07c160] text-center">修改后</p>
                          <div className="aspect-square relative bg-white rounded-lg overflow-hidden border-2 border-[#07c160]">
                            <img
                              src={image.url}
                              alt={`修改后 ${index + 1}`}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <span className="text-sm text-gray-600 block mb-1">差异度</span>
                            <span className="text-2xl font-bold text-[#07c160]">
                              {image.difference.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex-1 text-right">
                            <span className="text-sm text-gray-600 block mb-1">相似度</span>
                            <span className="text-lg font-semibold text-gray-700">
                              {image.similarity.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownload(image.url, index)}
                          className="w-full bg-[#07c160] hover:bg-[#06ad56] text-white font-semibold rounded-xl h-12"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          下载修改后图片
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-lg font-semibold text-gray-700">未找到符合条件的图片</p>
                <p className="text-gray-600 mt-2">请尝试调整修改程度或更换其他商品链接</p>
              </div>
            )}
          </Card>
        )}

        {loading && result?.status === "processing" && (
          <Card className="mt-8 p-10 shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#07c160] to-[#06ad56] rounded-full mb-6">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">AI 正在处理中...</h3>
              {progress ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    正在处理第 {progress.current} / {progress.total} 张图片
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-md mx-auto">
                    {progress.currentFile}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#07c160] to-[#06ad56] h-full transition-all duration-500"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mb-6">正在抓取商品图片并进行智能修改，请稍候</p>
              )}
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-3 h-3 bg-[#07c160] rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-[#07c160] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-[#07c160] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-10 text-center space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-blue-900 mb-2">✨ 批量处理功能</p>
            <p className="text-xs text-blue-800">
              一次最多上传50张图片，AI会依次处理每张图片并展示修改前后的对比效果
            </p>
          </div>
          <p className="text-sm text-gray-500">
            支持淘宝、京东、拼多多、天猫等主流电商平台
          </p>
          <p className="text-xs text-gray-400">
            AI 自动识别并修改商品主图，确保至少 30% 的视觉差异
          </p>
        </div>
      </div>
    </div>
  );
}
