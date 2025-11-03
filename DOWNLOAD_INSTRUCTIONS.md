# 如何下载项目到本地

## 方法1：直接下载文件夹（最简单）

如果您在StackBlitz或类似的在线环境中：

1. **点击左上角的菜单** → 选择 "Download Project" 或 "Export as ZIP"
2. **解压ZIP文件**到您的电脑
3. **打开终端/命令提示符**，进入项目文件夹：
   ```bash
   cd 下载路径/product-image-modifier
   ```

## 方法2：使用Git克隆（推荐给开发者）

如果项目已上传到GitHub：

```bash
# 克隆仓库
git clone https://github.com/你的用户名/product-image-modifier.git

# 进入项目目录
cd product-image-modifier
```

## 方法3：手动复制文件

如果在WebContainer环境中：

1. 选择所有项目文件
2. 复制到本地文件夹
3. 确保包含所有文件夹结构

## 📦 下载后的设置步骤

### 1. 安装Node.js

确保您的电脑已安装Node.js（版本 >= 18）：
- 下载地址：https://nodejs.org/
- 验证安装：
  ```bash
  node --version
  npm --version
  ```

### 2. 安装项目依赖

```bash
# 在项目根目录运行
npm install
```

这将安装所有需要的包（约需1-3分钟）。

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
```

然后编辑 `.env` 文件，填入您的API密钥：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenRouter API密钥
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-your-key-here
```

#### 获取Supabase凭证：
1. 访问 https://supabase.com
2. 登录并打开您的项目
3. Settings → API
4. 复制 "Project URL" 和 "anon public" key

#### 获取OpenRouter API密钥：
1. 访问 https://openrouter.ai
2. 注册/登录
3. Keys → Create Key
4. 充值一些余额（建议$5起）

### 4. 设置数据库

在Supabase控制台的SQL Editor中运行：

```bash
# 文件位置：supabase/migrations/20251023085349_create_image_modification_jobs.sql
```

或使用Supabase CLI：
```bash
supabase db push
```

### 5. 运行开发服务器

```bash
npm run dev
```

打开浏览器访问：http://localhost:3000

### 6. 构建生产版本

```bash
# 构建
npm run build

# 运行生产服务器
npm run start
```

## 📁 项目文件结构

下载后您会看到：

```
product-image-modifier/
├── app/                    # Next.js页面
│   ├── page.tsx           # 主页面
│   ├── layout.tsx         # 布局
│   └── globals.css        # 全局样式
├── lib/                   # 核心功能
│   ├── image-scraper.ts   # Ozon图片提取
│   ├── image-modifier.ts  # AI图片修改
│   ├── similarity-detector.ts  # 图片相似度
│   └── openrouter-client.ts    # API客户端
├── components/            # UI组件
├── supabase/             # 数据库相关
│   ├── migrations/       # 数据库迁移
│   └── functions/        # Edge函数
├── .env.example          # 环境变量模板
├── package.json          # 依赖列表
├── README.md            # 项目文档
└── tsconfig.json        # TypeScript配置
```

## ⚠️ 常见问题

### Q: npm install 失败
**A:** 尝试：
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules和重新安装
rm -rf node_modules package-lock.json
npm install
```

### Q: 端口3000已被占用
**A:** 更改端口：
```bash
PORT=3001 npm run dev
```

### Q: 图片无法生成
**A:** 检查：
- OpenRouter API密钥是否正确
- 账户是否有余额
- 浏览器控制台的错误信息

### Q: 数据库连接失败
**A:** 检查：
- Supabase URL和密钥是否正确
- 是否已运行数据库迁移
- 网络连接是否正常

## 🔧 开发工具推荐

- **代码编辑器**: VS Code (https://code.visualstudio.com/)
- **VS Code扩展**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

## 📝 修改代码

下载到本地后，您可以：

1. **修改UI**: 编辑 `app/page.tsx` 和 `app/globals.css`
2. **调整AI提示**: 修改 `lib/image-modifier.ts` 中的提示词
3. **更改模型**: 在 `lib/image-modifier.ts` 中切换AI模型
4. **添加新功能**: 创建新的组件和库文件

## 🚀 部署到生产环境

构建后可部署到：

- **Vercel**: https://vercel.com (推荐，免费)
- **Netlify**: https://netlify.com
- **自己的服务器**: 使用 `npm run build && npm run start`

## 💡 需要帮助？

- 查看 `README.md` 了解详细文档
- 检查浏览器控制台查看错误
- 确保所有环境变量正确配置

祝您使用愉快！🎉
