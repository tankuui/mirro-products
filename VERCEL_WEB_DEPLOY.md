# Vercel 网页部署指南（超简单版）

## 📦 第一步：下载项目文件

你需要先把整个项目文件夹下载到你的电脑上。

## 🚀 第二步：网页部署

### 1. 打开 Vercel 部署页面
访问：https://vercel.com/new

### 2. 登录/注册
- 点击 "Continue with GitHub" 用 GitHub 账号登录（推荐）
- 或者用其他方式注册（邮箱、GitLab 等）
- **完全免费！**

### 3. 上传项目
- 在页面上找到 "Upload" 选项
- 把整个项目文件夹拖拽到页面上
- 或者点击浏览选择项目文件夹

### 4. 配置项目
Vercel 会自动识别这是一个 Next.js 项目。

**重要：配置环境变量**

在 "Environment Variables" 部分，添加以下 3 个变量：

```
变量名：NEXT_PUBLIC_SUPABASE_URL
值：https://kqbycaospxztjmverqpz.supabase.co

变量名：NEXT_PUBLIC_SUPABASE_ANON_KEY
值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYnljYW9zcHh6dGptdmVycXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTE3MDcsImV4cCI6MjA3NzcyNzcwN30.4Ef6trr-RLyeXdtkrQGnzDo-FtHq1H6ZRnQORbN2uFM

变量名：NEXT_PUBLIC_OPENROUTER_API_KEY
值：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
```

**如何添加：**
- 点击 "Add" 或 "+" 按钮
- 输入变量名（Name）
- 输入变量值（Value）
- 重复 3 次，添加上面 3 个变量

### 5. 部署！
- 点击 "Deploy" 按钮
- 等待 2-3 分钟（Vercel 会自动构建）
- 完成！

## ✅ 第三步：获取网址

部署成功后，你会看到：
```
🎉 Congratulations!
Your project is live at: https://你的项目名.vercel.app
```

点击这个网址就可以访问你的应用了！

## 🔧 后续管理

### 查看项目
- 登录 https://vercel.com/dashboard
- 可以看到所有部署的项目

### 更新网站
如果你修改了代码：
1. 在 Vercel Dashboard 找到你的项目
2. 点击 "Settings"
3. 重新上传新的项目文件
4. 或者连接到 GitHub，之后只需 push 代码即可自动更新

### 绑定自己的域名
在 Vercel 项目的 "Settings" → "Domains" 中可以绑定自己的域名。

## ⚠️ 常见问题

**Q: 部署后网站打不开？**
A: 检查环境变量是否都正确添加了

**Q: 数据加载不出来？**
A: 确认 Supabase 数据库的迁移已经执行（参考其他文档）

**Q: 能改项目名称吗？**
A: 可以，在项目 Settings → General 中修改

**Q: 完全免费吗？**
A: 是的！Vercel 的免费套餐对个人项目完全够用

## 📱 分享你的网站

部署成功后，你就可以把网址分享给任何人，他们都可以直接访问！

祝部署顺利！🎉
