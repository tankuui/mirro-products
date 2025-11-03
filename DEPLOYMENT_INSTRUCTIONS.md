# Edge Function 部署说明

您的 Edge Function 代码已更新，使用 **Google Gemini 2.5 Flash Image Preview** 模型进行图像生成。

## 部署步骤

由于此环境无法直接部署 Edge Functions，您需要手动部署更新：

### 方法1：通过 Supabase Dashboard

1. 访问 https://supabase.com/dashboard/project/xlmqeupjibsehucmbkwe
2. 进入 Edge Functions 部分
3. 找到 `modify-images` 函数
4. 更新函数代码（使用 `supabase/functions/modify-images/index.ts` 中的内容）
5. 保存并部署

### 方法2：使用 Supabase CLI

如果您本地安装了 Supabase CLI：

```bash
cd /path/to/your/project
supabase functions deploy modify-images
```

## 重要更新内容

1. **AI 模型切换**：从 FLUX 改为 Gemini 2.5 Flash Image Preview
2. **两步处理流程**：
   - 步骤1：GPT-4o 分析原始图片
   - 步骤2：Gemini 生成修改后的图片
3. **Base64 图片支持**：Gemini 返回 base64 格式的图片
4. **详细日志**：添加了完整的错误日志以便调试

## 测试确认

API 连接测试已通过：
- ✅ OpenRouter API 正常工作
- ✅ GPT-4o 图像分析成功
- ✅ Gemini 图像生成成功返回 base64 数据

部署后应该可以正常生成修改后的商品图片了！

## 使用说明

用户应该：
1. 从 OZON 或其他平台获取图片直链
2. 右键点击商品图→在新标签页打开→复制URL
3. 粘贴到应用输入框
4. 点击"开始 AI 修改"

系统将自动：
1. 分析原图内容
2. 基于修改程度生成新图
3. 返回 1-3 张修改后的图片（base64 格式）
