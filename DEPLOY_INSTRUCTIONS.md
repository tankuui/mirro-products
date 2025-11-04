# 部署到 Vercel 教程

这个项目已经准备好部署了！按照以下步骤把它分享给你的朋友。

## 🚀 快速部署步骤

### 方法一：使用 Vercel（推荐 - 最简单）

1. **注册 Vercel 账号**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账号登录（推荐 GitHub）

2. **上传项目到 GitHub**
   - 创建一个新的 GitHub 仓库
   - 上传你的项目代码

3. **在 Vercel 部署**
   - 登录 Vercel 后，点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测到这是 Next.js 项目
   - 点击 "Deploy"

4. **配置环境变量**
   - 在 Vercel 项目设置中，找到 "Environment Variables"
   - 添加以下环境变量：
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://kqbycaospxztjmverqpz.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYnljYW9zcHh6dGptdmVycXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTE3MDcsImV4cCI6MjA3NzcyNzcwN30.4Ef6trr-RLyeXdtkrQGnzDo-FtHq1H6ZRnQORbN2uFM
     NEXT_PUBLIC_OPENROUTER_API_KEY=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
     ```
   - 重新部署项目

5. **获取网址**
   - 部署完成后，Vercel 会给你一个网址，例如：
   - `https://your-project-name.vercel.app`
   - 这个网址就可以分享给朋友了！

---

### 方法二：使用 GitHub 上传（详细步骤）

如果你不熟悉 GitHub，这是详细步骤：

1. **创建 GitHub 账号**
   - 访问 [github.com](https://github.com)
   - 点击 "Sign up" 注册

2. **创建新仓库**
   - 登录后，点击右上角的 "+" 按钮
   - 选择 "New repository"
   - 仓库名称：`image-modifier` 或其他你喜欢的名字
   - 设置为 Public（公开）
   - 点击 "Create repository"

3. **上传代码**

   **选项 A - 使用 Git 命令行（如果你熟悉命令行）：**
   ```bash
   cd /path/to/your/project
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/image-modifier.git
   git push -u origin main
   ```

   **选项 B - 使用 GitHub 网页上传（最简单）：**
   - 在新创建的仓库页面，点击 "uploading an existing file"
   - 把项目文件夹里的所有文件拖拽到网页上
   - 点击 "Commit changes"
   - ⚠️ 注意：不要上传 `node_modules` 文件夹和 `.env` 文件

4. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 用 GitHub 账号登录
   - 点击 "Add New Project"
   - 选择刚才创建的仓库
   - 配置环境变量（见上面的环境变量列表）
   - 点击 "Deploy"

5. **完成！**
   - 等待 2-3 分钟
   - 你会得到一个网址，可以分享了！

---

## 📱 分享给朋友

部署完成后，你会得到一个网址，例如：
- `https://image-modifier-abc123.vercel.app`

这个网址：
- ✅ 可以直接在手机和电脑上访问
- ✅ 支持批量上传图片
- ✅ 自动保存处理记录
- ✅ 24小时在线

---

## 🔧 常见问题

**Q: 部署需要付费吗？**
A: Vercel 有免费套餐，对于个人项目完全够用！

**Q: 如果环境变量配置错误怎么办？**
A: 在 Vercel 项目设置中可以随时修改环境变量，修改后记得重新部署。

**Q: 可以自定义域名吗？**
A: 可以！在 Vercel 项目设置的 "Domains" 中添加你的域名。

**Q: 数据会丢失吗？**
A: 不会！数据都保存在 Supabase 云数据库中。

---

## 🎉 下一步

1. 测试你的网址，确保功能正常
2. 分享给朋友
3. 如果需要修改代码，只需：
   - 修改代码
   - 提交到 GitHub
   - Vercel 会自动重新部署

有问题随时问我！
