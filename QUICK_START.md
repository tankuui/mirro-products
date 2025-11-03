# 🚀 快速开始 - 5分钟上手指南

## ⚠️ 重要：第一步

在使用系统之前，**必须**先设置Edge Function的环境变量：

### 设置OPENROUTER_API_KEY

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/kqbycaospxztjmverqpz/settings/functions)
2. 进入 **Settings** → **Edge Functions**
3. 点击 **Add secret** 按钮
4. 添加：
   ```
   Name: OPENROUTER_API_KEY
   Value: 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
   ```
5. 保存

**如果不设置这个，任务会一直卡在"pending"状态！**

---

## 📦 安装和启动

```bash
npm install
npm run dev
```

访问 http://localhost:3000

---

## 🔧 三种使用方式

### 方式1：浏览器插件（推荐）

**优点**：
- ✅ 一键提取Ozon商品所有数据
- ✅ 绕过反爬机制
- ✅ 支持批量处理多张图片
- ✅ 自动提取商品描述

**步骤**：

1. **安装插件**
   ```
   Chrome浏览器 → chrome://extensions/
   开启"开发者模式" → "加载已解压的扩展程序"
   选择项目中的 browser-extension 文件夹
   ```

2. **打开Ozon商品页面**
   ```
   https://www.ozon.ru/product/任意商品链接
   ```

3. **点击插件图标**
   - 点击"提取商品数据"
   - 查看提取结果（标题、图片数、描述长度）
   - 点击"发送到AI处理"

4. **查看进度**
   - 自动跳转到任务详情页
   - 实时查看处理进度
   - 完成后下载修改后的图片

---

### 方式2：Web界面（单图）

**适用场景**：只需要处理1-2张图片

**步骤**：

1. 访问 http://localhost:3000

2. 获取图片直链：
   - 在Ozon商品页右键图片
   - 选择"在新标签页中打开图片"
   - 复制地址栏的URL（类似 https://cdn1.ozon.ru/.../wc1200/xxx.jpg）

3. 粘贴到输入框，点击"开始AI修改"

4. 等待处理完成，下载结果

---

### 方式3：API调用（开发者）

**适用场景**：集成到自己的系统

**创建任务**：
```javascript
const response = await fetch('http://localhost:3000/api/tasks/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productUrl: 'https://www.ozon.ru/product/...',
    productTitle: '商品标题',
    images: [
      'https://cdn1.ozon.ru/.../image1.jpg',
      'https://cdn1.ozon.ru/.../image2.jpg'
    ],
    description: '商品描述'
  })
});

const { taskId } = await response.json();
```

**查询进度**：
```javascript
const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
const { task, images, logs } = await response.json();

console.log(`进度: ${task.progress}%`);
console.log(`状态: ${task.status}`);
```

---

## 🎯 快速测试

### 测试方法1：使用现有图片

1. 访问 http://localhost:3000
2. 输入这个测试图片URL：
   ```
   https://cdn1.ozon.ru/s3/multimedia-1/wc1200/6497436777.jpg
   ```
3. 点击"开始AI修改"
4. 查看结果

### 测试方法2：使用插件

1. 安装插件（见上方）
2. 访问这个Ozon商品页（测试用）：
   ```
   https://www.ozon.ru/product/xiaomi-redmi-note-12-pro-256gb-black-1234567/
   ```
3. 点击插件提取数据
4. 发送处理

---

## 📊 查看结果

### 任务列表页面

访问 http://localhost:3000/tasks

可以看到：
- 所有历史任务
- 实时进度更新（处理中的任务）
- 状态标识（等待中、处理中、已完成、失败）

### 任务详情页面

点击任务列表中的"查看详情"按钮，可以看到：
- 详细进度（百分比、当前步骤）
- 每张图片的处理状态
- 原图 vs 修改后对比
- 相似度和差异度统计
- 处理日志
- 下载按钮

---

## ⚙️ 配置优化

访问 http://localhost:3000/config

### 图片处理配置

- **修改程度**：10-100%，推荐从50%开始测试
- **AI模型**：默认已配置最佳模型
- **Logo文字**：留空则只移除原品牌，不添加新logo

### 文本改写配置

- **AI模型**：默认GPT-4o
- **改写风格**：professional（专业）
- **保留关键词**：建议开启

---

## 🐛 常见问题

### ❌ 任务卡在"pending"状态

**原因**：Edge Function的OPENROUTER_API_KEY未设置

**解决**：按照本文档第一步设置环境变量

---

### ❌ 插件无法提取图片

**原因**：页面未完全加载

**解决**：
1. 刷新Ozon商品页面
2. 滚动到底部让所有图片加载
3. 再点击插件提取

---

### ❌ 图片修改不明显

**原因**：修改程度设置过低

**解决**：
1. 访问 /config 配置页面
2. 提高"修改程度"到70-100%
3. 保存配置后重新创建任务

---

### ❌ Edge Function部署失败

**解决**：Edge Function已经部署好了，只需要设置环境变量即可

如果需要重新部署：
```bash
# 系统已自动部署，无需手动操作
# 如果确实需要，可以在Supabase Dashboard的Edge Functions页面查看
```

---

## 📈 性能参考

| 任务类型 | 图片数量 | 预计耗时 |
|---------|---------|---------|
| 单图处理 | 1张 | 15-30秒 |
| 小批量 | 3-5张 | 1-2分钟 |
| 中批量 | 10-15张 | 3-5分钟 |
| 大批量 | 20+张 | 8-15分钟 |

**注意**：处理时间取决于：
- OpenRouter API响应速度
- 图片大小和复杂度
- 当前API负载情况

---

## 🎓 下一步

- 📖 阅读完整文档：[SYSTEM_GUIDE.md](./SYSTEM_GUIDE.md)
- 🔧 了解高级配置和优化技巧
- 🚀 部署到生产环境
- 🔌 自定义插件功能

---

## 💡 提示

1. **首次使用建议**：先用单张图片测试，熟悉流程后再批量处理
2. **保存配置**：找到满意的参数后，在/config页面保存
3. **查看日志**：处理失败时，查看任务详情页的日志找原因
4. **备份数据**：Supabase会自动保存所有任务记录

开始使用吧！🎉
