# 图片修改质量检测系统

## 概述

本系统实现了一个完整的图片修改质量检测流程，通过**前置拦截 → 生成控制 → 生成后复检 → 智能重试 → 人审兜底**的流水线，将不合格率从"100张错10张"降低到目标区间。

## 🎯 核心目标 (Objectives)

### 量化指标

| 阶段 | 总不合格率 | P0致命错误率 |
|------|-----------|-------------|
| **第一阶段** | ≤ 5% | ≤ 1% |
| **第二阶段** | ≤ 3% | ≤ 1% |
| **成熟期** | ≤ 2% | ≤ 0.5% |

### 当前进展

访问 `/metrics` 页面查看实时质量指标和目标达成情况。

## 📊 错误分级 (Error Taxonomy)

### P0 - 致命错误 (必须拦截)

**定义**: 产品主体发生不可接受的改变

**示例**:
- 改动了产品形状/比例/颜色/细节
- 主体被裁断/缺失
- Logo错换或严重错位
- 严重分辨率崩塌
- 明显AI伪影

**处理**: 自动重试最多2次，降低修改强度

### P1 - 严重错误 (不可放行)

**定义**: 修改不符合要求或质量指标未达标

**示例**:
- 背景/光照严重偏题
- 宽高比或像素不合规
- 与原图差异度 < 30%
- pHash距离 < 12
- SSIM差异 < 0.30

**处理**: 自动重试，调整提示词模板和修改强度

### P2 - 轻微瑕疵 (可放行)

**定义**: 存在小瑕疵但不影响整体质量

**示例**:
- 细小毛刺
- 阴影轻微不自然
- 轻微压缩失真
- 边缘质量略低于阈值

**处理**: 可以接受，不触发重试

## 🏗️ 系统架构

### 核心模块

```
lib/
├── quality-scorer.ts      # 质量评分模块 (SSIM, pHash, 边缘检测, 几何一致性)
├── auto-retry.ts          # 自动重试逻辑 (强度调整, 模板切换, 候选重排)
├── image-modifier.ts      # 图片修改核心 (集成OpenRouter AI生成)
└── similarity-detector.ts # 相似度检测 (遗留模块，已被质量评分取代)
```

### API接口

```
/api/metrics              # GET - 获取质量统计
  ?period=1h|24h|7d|30d   # 时间周期
  ?category=shoes|...     # 可选：类目筛选
```

### 数据库表

```sql
modified_images           # 修改后的图片记录
├── ssim_score           # SSIM结构相似度
├── phash_distance       # 感知哈希距离
├── edge_score          # 边缘质量分
├── geom_delta          # 几何变化量
├── error_level         # P0|P1|P2|OK
├── error_reasons       # 错误原因列表
├── retry_count         # 重试次数
└── strength_used       # 实际使用的修改强度

quality_checks          # 详细质量检查结果
retry_records          # 重试记录
error_classifications  # 错误分类
quality_metrics        # 聚合统计
quality_config         # 配置参数
```

## 🔄 质检流程 (Pipeline)

### 1. Preflight (前置拦截)

**未完全实现** - 需要服务端处理能力

理想实现:
- 主体分割 + 掩膜 (SAM/U²Net)
- 尺寸/比例校验
- 材质风险标注 (玻璃/金属/高反光)
- Logo检测 (OCR/模板检测)

当前实现:
- 客户端文件验证
- 基础尺寸检查

### 2. Generation Control (生成控制)

**已实现**

- ✅ 修改强度映射 (10-100% → AI参数)
- ✅ 多候选生成 (k=3, 高风险k=4)
- ✅ 风险等级评估 (low/medium/high)
- ✅ 提示词模板系统
  - light_texture: 轻微调整
  - new_background: 背景替换
  - strong_lighting: 强光照变化

### 3. Post-check (生成后复检)

**已完整实现**

质量检查项:

| 指标 | 阈值 | 说明 |
|------|------|------|
| SSIM差异 | ≥ 0.30 | 结构相似度，确保足够不同 |
| pHash距离 | ≥ 12 | 感知哈希，防止过于相似 |
| 边缘质量 | ≥ 0.6 | Sobel边缘检测，确保清晰度 |
| 几何变化 | ≤ 0.03 | 主体形变控制在3%以内 |

**错误分类逻辑**:
```typescript
if (geomDelta > 0.03) → P0 致命
if (ssimDiff < 0.30 || phashDist < 12) → P1 严重
if (edgeScore < 0.6) → P2 轻微
else → OK 通过
```

### 4. Auto-retry (智能重试)

**已完整实现**

重试策略:

```
第1次重试:
├─ P0错误 → 降低强度 15% + light_texture模板
└─ P1错误 → 提高强度 15% + new_background模板

第2次重试:
├─ P0错误 → 继续降低强度
└─ P1错误 → 提高强度 22.5% + strong_lighting模板
```

**候选重排算法**:
```typescript
score = 0.3*ssimDiff + 0.25*norm(phashDist) + 0.25*edgeScore + 0.2*(1-geomDelta)
```

选择得分最高且通过质检的候选图片。

### 5. Human Review (人工复审)

**未实现** - 预留扩展

计划功能:
- 对P0可疑样本做2-5%抽检
- 人工标注"真缺陷/假阳性"
- 动态调整阈值

## 📈 指标监控 (Metrics Dashboard)

访问: `http://localhost:3000/metrics`

### 核心指标

- **总处理数**: 时间段内处理的总图片数
- **通过率**: OK状态占比
- **P0错误率**: 致命错误占比
- **P1错误率**: 严重错误占比
- **重试率**: 需要重试的图片占比

### 质量分数平均值

- SSIM相似度
- pHash距离
- 边缘质量分
- 几何差异百分比

### 错误原因分析

显示Top 10错误原因及其出现频率。

## ⚙️ 配置参数 (Thresholds & Policies)

存储在数据库 `quality_config` 表中:

### qa_thresholds (质检阈值)

```json
{
  "ssim_min_diff": 0.30,      // SSIM最小差异
  "phash_min_dist": 12,        // pHash最小距离
  "geom_max_delta": 0.03,      // 几何最大变化 3%
  "edge_min_score": 0.6,       // 边缘最低分
  "max_retries": 2             // 最大重试次数
}
```

### generation_config (生成配置)

```json
{
  "k_samples_default": 3,      // 默认候选数
  "k_samples_high_risk": 4,    // 高风险候选数
  "strength_step_on_retry": 0.15,  // 重试强度步长
  "mode_priority": ["inpaint_bg_only", "variant"]
}
```

### target_rates (目标指标)

```json
{
  "p0_rate": 0.01,                  // P0率目标 1%
  "total_fail_rate_stage1": 0.05,   // 第一阶段 5%
  "total_fail_rate_stage2": 0.03,   // 第二阶段 3%
  "p0_rate_mature": 0.005           // 成熟期 0.5%
}
```

## 🚀 实施路线图 (Roadmap)

### ✅ 已完成 (Current)

- [x] 数据库架构设计和迁移
- [x] 质量评分模块 (SSIM, pHash, 边缘, 几何)
- [x] 自动重试逻辑和策略切换
- [x] 候选图片重排算法
- [x] 指标统计API
- [x] 实时指标仪表板
- [x] 错误分级系统 (P0/P1/P2)
- [x] 批量上传功能 (最多50张)
- [x] 原图/新图并列对比展示

### 🔄 进行中 (T+1周)

- [ ] 集成质量检查到主流程
- [ ] 前端错误标签显示
- [ ] "仅重试失败项"功能
- [ ] ZIP批量下载
- [ ] 本地任务历史存储 (localStorage)

### 📅 计划中

#### T+2周: 多候选优化
- [ ] 一次生成k=3候选的完整实现
- [ ] 高风险样本k=4
- [ ] 类目特定模板 (鞋/服/电器等)
- [ ] 前置拦截部分功能 (客户端侧)

#### T+4周: 高级功能
- [ ] Logo透视变换和光照匹配
- [ ] 主体分割集成 (需要Edge Function)
- [ ] Poisson blending for logo
- [ ] 二级回退 (模型切换)

#### T+8周: AI模型优化 (可选)
- [ ] 引入可微调模型 (SDXL+LoRA)
- [ ] 针对高频类目训练
- [ ] 目标: P0 ≤ 0.5%, 总体 ≤ 2%

## 🛠️ 使用方法

### 1. 批量处理图片

1. 访问主页
2. 点击上传区域选择图片 (最多50张)
3. 调整修改程度 (10-100%)
4. 可选：输入Logo文字
5. 点击"批量处理"

系统将:
- 依次处理每张图片
- 实时显示进度
- 自动质量检查
- 失败自动重试 (最多2次)
- 展示原图/新图对比

### 2. 查看质量指标

访问 `/metrics` 页面:
- 选择时间周期 (1h/24h/7d/30d)
- 查看通过率和错误分布
- 分析错误原因
- 监控目标达成情况

### 3. 失败项重试 (计划中)

对于标记为P0/P1的图片:
- 可单独重试
- 或批量重试所有失败项
- 系统自动调整策略

## 🔧 开发调试

### 本地运行

```bash
npm install
npm run dev
```

访问:
- 主页: http://localhost:3000
- 指标: http://localhost:3000/metrics
- API: http://localhost:3000/api/metrics

### 数据库迁移

```bash
# 查看迁移
ls supabase/migrations/

# 应用迁移 (通过Supabase Dashboard或CLI)
```

### 测试质量评分

```typescript
import { scoreImageQuality } from '@/lib/quality-scorer';

const result = await scoreImageQuality(
  'https://example.com/original.jpg',
  'https://example.com/modified.jpg'
);

console.log(result.errorLevel);  // 'P0' | 'P1' | 'P2' | 'OK'
console.log(result.scores);
console.log(result.reasons);
```

## 📝 注意事项

### 性能考虑

- 质量评分在客户端运行，可能较慢
- 批量处理50张图片可能需要5-10分钟
- SSIM和pHash计算需要加载完整图片

### 限制

- 需要CORS-enabled的图片URL
- 浏览器内存限制 (大图片可能崩溃)
- AI生成速度受限于OpenRouter配额

### 最佳实践

- 单次处理10-20张图片
- 使用压缩后的图片 (< 2MB)
- 定期查看指标调整阈值
- 保存历史数据用于分析

## 📚 技术栈

- **前端**: Next.js 13, React, TypeScript, TailwindCSS
- **UI**: shadcn/ui, Lucide Icons
- **数据库**: Supabase (PostgreSQL)
- **AI**: OpenRouter (GPT-4o + Gemini 2.5 Flash)
- **图像处理**: Canvas API, 自研算法

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

重点改进方向:
1. 优化质量评分算法速度
2. 增加更多错误类型检测
3. 实现服务端图像处理
4. 添加更多类目模板
5. 改进重试策略

## 📄 许可证

MIT License

---

**当前版本**: v0.2.0 (质检系统完整版)

**更新日期**: 2025-10-24
