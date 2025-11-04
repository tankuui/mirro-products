"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Loader2, Save, Settings, Image as ImageIcon, FileText, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Config {
  id: string;
  name: string;
  config_type: string;
  is_active: boolean;
  settings: any;
  description: string;
}

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageConfig, setImageConfig] = useState<Config | null>(null);
  const [textConfig, setTextConfig] = useState<Config | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState<{ total: number; oldImages: number } | null>(null);

  useEffect(() => {
    fetchConfigs();
    fetchStats();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("processing_configs")
        .select("*")
        .in("config_type", ["image_processing", "text_rewrite"]);

      if (error) {
        console.error("获取配置失败:", error);
        toast.error("获取配置失败");
        return;
      }

      const imgCfg = data.find((c) => c.config_type === "image_processing");
      const txtCfg = data.find((c) => c.config_type === "text_rewrite");

      setImageConfig(imgCfg || null);
      setTextConfig(txtCfg || null);
    } catch (error) {
      console.error("获取配置失败:", error);
      toast.error("获取配置失败");
    } finally {
      setLoading(false);
    }
  };

  const saveImageConfig = async () => {
    if (!imageConfig) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("processing_configs")
        .update({
          is_active: imageConfig.is_active,
          settings: imageConfig.settings,
          description: imageConfig.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", imageConfig.id);

      if (error) {
        throw error;
      }

      toast.success("图片处理配置已保存");
    } catch (error) {
      console.error("保存配置失败:", error);
      toast.error("保存配置失败");
    } finally {
      setSaving(false);
    }
  };

  const saveTextConfig = async () => {
    if (!textConfig) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("processing_configs")
        .update({
          is_active: textConfig.is_active,
          settings: textConfig.settings,
          description: textConfig.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", textConfig.id);

      if (error) {
        throw error;
      }

      toast.success("文本改写配置已保存");
    } catch (error) {
      console.error("保存配置失败:", error);
      toast.error("保存配置失败");
    } finally {
      setSaving(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/cleanup");
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("获取统计信息失败:", error);
    }
  };

  const handleCleanup = async (days: number) => {
    if (!confirm(`确定要删除 ${days} 天前的所有图片吗？这个操作无法撤销！`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("/api/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchStats();
      } else {
        toast.error(data.error || "清理失败");
      }
    } catch (error) {
      console.error("清理失败:", error);
      toast.error("清理失败，请稍后重试");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#07c160]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ededed] via-white to-[#f5f5f5]">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-12">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#07c160] to-[#06ad56] rounded-2xl mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">处理配置</h1>
          <p className="text-gray-600">
            管理图片处理和文本改写的AI模型参数，优化处理效果
          </p>
        </div>

        <Tabs defaultValue="image" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              图片处理配置
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              文本改写配置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image">
            <Card className="p-6 md:p-8">
              {imageConfig ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {imageConfig.name}
                      </h3>
                      <p className="text-sm text-gray-600">{imageConfig.description}</p>
                    </div>
                    <Switch
                      checked={imageConfig.is_active}
                      onCheckedChange={(checked) =>
                        setImageConfig({ ...imageConfig, is_active: checked })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        修改程度（{imageConfig.settings.modification_level}%）
                      </Label>
                      <p className="text-xs text-gray-500 mb-3">
                        控制背景修改的强度，数值越大改动越大
                      </p>
                      <Slider
                        value={[imageConfig.settings.modification_level]}
                        onValueChange={(value) =>
                          setImageConfig({
                            ...imageConfig,
                            settings: { ...imageConfig.settings, modification_level: value[0] },
                          })
                        }
                        min={10}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>轻微修改 (10%)</span>
                        <span>重度修改 (100%)</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ai-model" className="text-sm font-semibold text-gray-700">
                        AI模型
                      </Label>
                      <p className="text-xs text-gray-500 mb-2">
                        选择用于图片生成的AI模型
                      </p>
                      <Input
                        id="ai-model"
                        value={imageConfig.settings.ai_model}
                        onChange={(e) =>
                          setImageConfig({
                            ...imageConfig,
                            settings: { ...imageConfig.settings, ai_model: e.target.value },
                          })
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        推荐：google/gemini-2.5-flash-preview-image
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="logo-text" className="text-sm font-semibold text-gray-700">
                        默认Logo文字
                      </Label>
                      <p className="text-xs text-gray-500 mb-2">
                        留空则不添加Logo，移除原品牌标识
                      </p>
                      <Input
                        id="logo-text"
                        value={imageConfig.settings.logo_text || ""}
                        onChange={(e) =>
                          setImageConfig({
                            ...imageConfig,
                            settings: { ...imageConfig.settings, logo_text: e.target.value },
                          })
                        }
                        placeholder="输入默认Logo文字"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        输出质量（{imageConfig.settings.quality}%）
                      </Label>
                      <p className="text-xs text-gray-500 mb-3">
                        控制输出图片的质量，数值越高文件越大
                      </p>
                      <Slider
                        value={[imageConfig.settings.quality]}
                        onValueChange={(value) =>
                          setImageConfig({
                            ...imageConfig,
                            settings: { ...imageConfig.settings, quality: value[0] },
                          })
                        }
                        min={50}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>低质量 (50%)</span>
                        <span>高质量 (100%)</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={saveImageConfig}
                    disabled={saving}
                    className="w-full bg-[#07c160] hover:bg-[#06ad56] text-white font-semibold h-12"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        保存图片处理配置
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">未找到图片处理配置</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="text">
            <Card className="p-6 md:p-8">
              {textConfig ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {textConfig.name}
                      </h3>
                      <p className="text-sm text-gray-600">{textConfig.description}</p>
                    </div>
                    <Switch
                      checked={textConfig.is_active}
                      onCheckedChange={(checked) =>
                        setTextConfig({ ...textConfig, is_active: checked })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="text-ai-model" className="text-sm font-semibold text-gray-700">
                        AI模型
                      </Label>
                      <p className="text-xs text-gray-500 mb-2">
                        选择用于文本改写的AI模型
                      </p>
                      <Input
                        id="text-ai-model"
                        value={textConfig.settings.ai_model}
                        onChange={(e) =>
                          setTextConfig({
                            ...textConfig,
                            settings: { ...textConfig.settings, ai_model: e.target.value },
                          })
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        推荐：openai/gpt-4o 或 anthropic/claude-3.5-sonnet
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="rewrite-style" className="text-sm font-semibold text-gray-700">
                        改写风格
                      </Label>
                      <p className="text-xs text-gray-500 mb-2">
                        定义文本改写的风格和语调
                      </p>
                      <Input
                        id="rewrite-style"
                        value={textConfig.settings.style}
                        onChange={(e) =>
                          setTextConfig({
                            ...textConfig,
                            settings: { ...textConfig.settings, style: e.target.value },
                          })
                        }
                        placeholder="例如：professional, casual, persuasive"
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">
                          保留关键词
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          改写时保留重要的产品关键词
                        </p>
                      </div>
                      <Switch
                        checked={textConfig.settings.preserve_keywords}
                        onCheckedChange={(checked) =>
                          setTextConfig({
                            ...textConfig,
                            settings: { ...textConfig.settings, preserve_keywords: checked },
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="target-length" className="text-sm font-semibold text-gray-700">
                        目标长度
                      </Label>
                      <p className="text-xs text-gray-500 mb-2">
                        改写后文本的长度要求
                      </p>
                      <Input
                        id="target-length"
                        value={textConfig.settings.target_length}
                        onChange={(e) =>
                          setTextConfig({
                            ...textConfig,
                            settings: { ...textConfig.settings, target_length: e.target.value },
                          })
                        }
                        placeholder="例如：same, shorter, longer"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={saveTextConfig}
                    disabled={saving}
                    className="w-full bg-[#07c160] hover:bg-[#06ad56] text-white font-semibold h-12"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        保存文本改写配置
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">未找到文本改写配置</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">配置提示</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 修改配置后会立即应用到新创建的任务</li>
                <li>• 已创建的任务仍使用创建时的配置</li>
                <li>• 建议先用小修改程度测试，再逐步增加</li>
                <li>• 不同AI模型的效果和速度可能有差异</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6 border-2 border-orange-200">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">数据清理</h3>
                <p className="text-sm text-gray-600">自动删除旧图片，释放存储空间</p>
              </div>
            </div>
          </div>

          {stats && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                  <div className="text-xs text-gray-600">总图片数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.oldImages}</div>
                  <div className="text-xs text-gray-600">30天前的图片</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => handleCleanup(30)}
              disabled={deleting || !stats || stats.oldImages === 0}
              variant="outline"
              className="w-full h-12 border-orange-300 hover:bg-orange-50 hover:border-orange-400"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  清理中...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5 mr-2" />
                  删除 30 天前的图片
                  {stats && stats.oldImages > 0 && ` (${stats.oldImages} 张)`}
                </>
              )}
            </Button>

            <Button
              onClick={() => handleCleanup(60)}
              disabled={deleting}
              variant="outline"
              className="w-full h-12 border-orange-300 hover:bg-orange-50 hover:border-orange-400"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              删除 60 天前的图片
            </Button>

            <Button
              onClick={() => handleCleanup(90)}
              disabled={deleting}
              variant="outline"
              className="w-full h-12 border-orange-300 hover:bg-orange-50 hover:border-orange-400"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              删除 90 天前的图片
            </Button>
          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>警告：</strong>删除操作不可撤销，请谨慎操作！删除后无法恢复图片数据。
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
