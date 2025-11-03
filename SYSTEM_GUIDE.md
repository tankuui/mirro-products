# Ozon商品智能处理系统 - 完整使用指南

## 系统概述

这是一个完整的商品图片和文本智能处理系统，专为处理Ozon等电商平台的商品数据设计。

### 核心功能

1. **浏览器插件提取** - 在Ozon商品页面一键提取图片和描述（绕过反爬）
2. **异步任务处理** - 后端Edge Function处理大量图片，不会超时
3. **AI智能修改** - 使用GPT-4o和Gemini 2.5修改图片背景和改写文本
4. **实时进度追踪** - Web界面实时显示处理进度和结果
5. **配置化管理** - 所有AI参数可通过界面调整，无需改代码

### 技术架构

```
┌─────────────────┐
│ 浏览器插件      │ → 用户在Ozon页面点击
│ (Chrome/Edge)   │   提取图片URL和描述
└────────┬────────┘
         ↓
┌─────────────────┐
│ Next.js API     │ → 接收数据，创建任务
│ /api/tasks      │   返回taskId
└────────┬────────┘
         ↓
┌─────────────────┐
│ Supabase        │ → 存储任务和配置
│ (PostgreSQL)    │   RLS安全保护
└────────┬────────┘
         ↓
┌─────────────────┐
│ Edge Function   │ → 异步处理任务：
│ process-task    │   1. 下载图片
│                 │   2. AI修改图片
│                 │   3. AI改写文本
│                 │   4. 更新进度
└────────┬────────┘
         ↓
┌─────────────────┐
│ Web界面         │ → 显示任务列表
│ /tasks          │   查看进度和结果
│ /tasks/[id]     │   下载修改后的图片
└─────────────────┘
```

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js 18+
- npm 或 pnpm

### 2. 配置环境变量

`.env` 文件已包含所有必要配置：
```env
NEXT_PUBLIC_SUPABASE_URL=https://kqbycaospxztjmverqpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-f26616900b80d410757e7d250da7620e...
```

### 3. 设置Edge Function环境变量

**重要**：Edge Function需要单独配置环境变量。

访问 [Supabase Dashboard](https://supabase.com/dashboard) → 你的项目 → Settings → Edge Functions

添加秘密：
```
Name: OPENROUTER_API_KEY
Value: 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
```

### 4. 启动开发服务器

```bash
npm install
npm run dev
```

访问 http://localhost:3000

### 5. 安装浏览器插件

1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目中的 `browser-extension` 文件夹

**注意**：插件中的API地址默认是 `http://localhost:3000`，如果部署到生产环境需要修改。

## 完整使用流程

### 方式1：使用浏览器插件（推荐）

#### 步骤1：打开Ozon商品页面

访问任意Ozon商品，例如：
```
https://www.ozon.ru/product/xiaomi-redmi-note-12-pro-256gb-8gb-black-123456789/
```

#### 步骤2：点击插件，提取数据

1. 点击浏览器工具栏的插件图标
2. 点击"提取商品数据"按钮
3. 插件会自动提取：
   - 商品标题
   - 所有商品图片URL（自动过滤小图和logo）
   - 商品描述和规格

#### 步骤3：发送到AI处理

1. 查看提取结果（图片数量、描述长度）
2. 点击"发送到AI处理"按钮
3. 自动跳转到任务详情页面

#### 步骤4：查看处理进度

在任务详情页面可以看到：
- 实时处理进度（百分比）
- 当前处理步骤
- 已处理图片数量
- 处理日志

#### 步骤5：下载结果

处理完成后：
- 查看原图和修改后图片的对比
- 查看差异度和相似度
- 单独下载每张图片
- 查看原始描述和改写后的描述对比

### 方式2：直接使用Web界面

如果不想用插件，也可以直接在Web界面操作：

1. 访问 http://localhost:3000
2. 输入Ozon商品的**图片直链**（不是商品页面链接）
   - 在商品页右键图片 → "在新标签页打开图片"
   - 复制地址栏的图片URL
3. 点击"开始AI修改"
4. 查看进度和下载结果

**提示**：Web界面目前只支持单张图片，批量处理请使用插件。

## 功能详解

### 1. 任务管理

**任务列表** (`/tasks`)
- 查看所有历史任务
- 实时刷新处理中的任务进度
- 快速跳转到任务详情

**任务详情** (`/tasks/[taskId]`)
- 实时进度条和步骤说明
- 图片处理记录（原图vs修改后）
- 文本对比（原始vs改写）
- 处理日志查看
- 单张或批量下载

### 2. 配置管理

**图片处理配置** (`/config` → 图片处理)
- **修改程度**：10-100%，控制背景改动强度
- **AI模型**：默认 `google/gemini-2.5-flash-preview-image`
- **Logo文字**：添加自定义品牌文字（留空则不添加）
- **输出质量**：50-100%，控制图片质量和文件大小

**文本改写配置** (`/config` → 文本改写)
- **AI模型**：默认 `openai/gpt-4o`
- **改写风格**：professional, casual, persuasive等
- **保留关键词**：是否保留重要产品关键词
- **目标长度**：same, shorter, longer

**配置特点**：
- 修改后立即生效（应用到新任务）
- 可以创建多个配置，切换激活状态
- 支持A/B测试不同参数的效果

### 3. 数据结构

**tasks 表**
```sql
- id: 任务ID
- product_title: 商品标题
- status: pending/downloading/processing/completed/failed
- progress: 0-100进度
- total_images: 图片总数
- processed_images: 已处理数
- original_description: 原始描述
- modified_description: 改写后描述
```

**image_records 表**
```sql
- id: 记录ID
- task_id: 关联任务
- original_url: 原始图片URL
- modified_url: 修改后图片URL
- similarity: 相似度
- difference: 差异度
- processing_time: 处理耗时（毫秒）
```

**processing_configs 表**
```sql
- id: 配置ID
- config_type: image_processing / text_rewrite
- is_active: 是否激活
- settings: JSON配置（模型、参数等）
```

## API接口文档

### POST /api/tasks/create

创建新任务

**请求体**：
```json
{
  "productUrl": "https://www.ozon.ru/product/...",
  "productTitle": "商品标题",
  "images": [
    "https://cdn1.ozon.ru/.../image1.jpg",
    "https://cdn1.ozon.ru/.../image2.jpg"
  ],
  "description": "商品描述文本",
  "userId": "anonymous"
}
```

**响应**：
```json
{
  "taskId": "uuid",
  "status": "pending",
  "message": "任务已创建，正在后台处理"
}
```

### GET /api/tasks/[taskId]

查询任务详情

**响应**：
```json
{
  "task": {
    "id": "uuid",
    "status": "processing",
    "progress": 45,
    "current_step": "正在处理第 3/10 张图片",
    ...
  },
  "images": [
    {
      "id": "uuid",
      "original_url": "...",
      "modified_url": "...",
      "status": "completed",
      "similarity": 75.3,
      "difference": 24.7
    }
  ],
  "logs": [
    {
      "log_type": "info",
      "message": "开始处理图片",
      "created_at": "2025-11-03T12:00:00Z"
    }
  ]
}
```

## 优化建议

### 1. 图片处理优化

**如果图片修改不够明显**：
- 提高"修改程度"到80-100%
- 检查原图背景是否过于复杂
- 尝试不同的AI模型

**如果图片修改过度**：
- 降低"修改程度"到30-50%
- 调整prompt模板（需要修改代码）

**如果处理速度慢**：
- 检查OpenRouter API额度
- 考虑升级到更快的AI模型
- 减少单次处理的图片数量

### 2. 文本改写优化

**如果改写不够原创**：
- 切换到更强大的模型（如GPT-4o）
- 调整改写风格为"creative"
- 修改提示词增加创意性要求

**如果改写偏离原意**：
- 启用"保留关键词"选项
- 使用更保守的模型
- 目标长度设为"same"

### 3. 系统性能优化

**数据库查询优化**：
- 已创建索引：user_id, status, task_id
- 定期清理旧任务记录
- 考虑添加分页功能

**Edge Function优化**：
- 使用批量更新减少数据库请求
- 添加重试机制处理临时失败
- 实现任务队列避免并发过高

## 常见问题

### Q1: Edge Function环境变量设置在哪里？

A: 必须在Supabase Dashboard中单独设置：
Settings → Edge Functions → Add secret

### Q2: 插件提取不到图片？

A: 确保：
1. 在Ozon商品详情页（不是列表页）
2. 页面完全加载后再点击提取
3. 滚动查看所有图片让它们加载出来

### Q3: 任务一直显示"pending"状态？

A: 检查：
1. Edge Function的OPENROUTER_API_KEY是否已设置
2. Supabase函数是否正常部署
3. 浏览器控制台是否有错误

### Q4: 如何修改AI提示词？

A: 提示词在 `supabase/functions/process-task/index.ts` 中：
- 图片分析提示词：`Analyze this product image...`
- 图片修改提示词：`Modify this product image...`
- 文本改写提示词：`Rewrite this product description...`

### Q5: 可以部署到生产环境吗？

A: 可以！需要：
1. 部署Next.js应用到Vercel/Netlify
2. 修改插件中的API_BASE_URL为生产域名
3. 配置CORS允许插件域名访问API
4. 考虑添加用户认证系统

## 系统扩展

### 添加新的电商平台支持

1. 复制 `browser-extension/content.js`
2. 修改选择器适配新平台的HTML结构
3. 在manifest.json添加新的host_permissions

### 添加批量下载zip功能

1. 在Edge Function处理完成后打包zip
2. 上传到Supabase Storage
3. 在任务详情页提供下载链接

### 添加用户认证

1. 使用Supabase Auth添加登录功能
2. 修改RLS策略限制用户只能访问自己的任务
3. 在API中验证用户身份

### 添加Webhook通知

1. 任务完成时触发Webhook
2. 发送邮件或短信通知用户
3. 集成Telegram/Discord机器人

## 项目文件结构

```
project/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── create/route.ts      # 创建任务API
│   │       └── [taskId]/route.ts    # 查询任务API
│   ├── tasks/
│   │   ├── page.tsx                 # 任务列表页面
│   │   └── [taskId]/page.tsx        # 任务详情页面
│   ├── config/
│   │   └── page.tsx                 # 配置管理页面
│   └── page.tsx                     # 首页（原有功能）
├── supabase/
│   ├── migrations/
│   │   └── create_ozon_processing_system.sql  # 数据库迁移
│   └── functions/
│       └── process-task/
│           └── index.ts             # 异步处理Edge Function
├── browser-extension/
│   ├── manifest.json                # 插件配置
│   ├── content.js                   # 页面内容提取
│   ├── popup.html                   # 插件弹窗界面
│   ├── popup.js                     # 插件逻辑
│   └── README.md                    # 插件使用说明
├── lib/
│   ├── image-modifier.ts            # 图片修改逻辑（前端）
│   └── ...                          # 其他工具函数
└── .env                             # 环境变量
```

## 总结

这个系统提供了一个完整的、可扩展的解决方案：

✅ **绕过反爬**：插件在真实浏览器环境提取数据
✅ **异步处理**：Edge Function后台处理，不会超时
✅ **配置化**：所有参数可通过界面调整，方便优化
✅ **可扩展**：模块化设计，易于添加新功能
✅ **生产就绪**：包含错误处理、日志记录、进度追踪

后续可以根据实际使用情况持续优化AI提示词和处理参数，打造最佳的处理效果！
