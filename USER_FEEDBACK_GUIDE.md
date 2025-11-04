# 用户反馈与错误优化系统 - 使用指南

## 🎯 系统概述

这个系统让用户可以实时反馈图片修改的错误,帮助你每天查看问题并持续优化AI处理效果。

**核心目标**: 从当前75%成功率提升到95%+

---

## 📱 用户使用流程

### 1. 处理图片任务

用户在主页上传图片或输入商品URL后:
- 系统自动处理图片
- 生成修改后的图片
- 显示在任务详情页

### 2. 查看和反馈 (/tasks/[taskId])

在任务详情页,每张生成的图片下方会显示:

**满意/有问题 按钮**
- ✅ **满意**: 用户点击后,记录为通过
- ❌ **有问题**: 展开错误选择表单

### 3. 标注具体错误

当用户点击"有问题"后,会看到错误类型列表:

**P0 致命错误 (红色)**
- 产品形状改变了
- 产品颜色改变了
- 产品尺寸比例不对

**P1 严重错误 (橙色)**
- 背景变化不够明显
- 品牌Logo没去除
- 产品文字/规格丢失

**P2 轻微错误 (黄色)**
- 新Logo不清晰
- 图片模糊/质量差

用户可以:
- 多选错误类型
- 输入详细描述(可选)
- 点击"提交反馈"

### 4. 一键重新生成

提交反馈后:
- 图片状态变为"有问题"
- 显示"重新生成"按钮
- 点击后系统自动使用优化策略重试
- 根据错误类型自动选择:
  - P0错误 → 保守策略,降低修改强度
  - P1差异不足 → 激进策略,增强背景变化
  - 文字问题 → 切换到GPT-4V模型

---

## 📊 每日查看错误分析 (/errors)

### 错误分析中心页面包含:

**1. 总览统计卡片**
- 总反馈数
- 失败率 (目标: <5%)
- P0致命错误数
- 通过数和通过率

**2. 时间范围筛选**
- 24小时
- 7天
- 30天
- 全部

**3. 错误模式标签页**

显示所有错误类型,按出现频率排序:
- 错误名称和描述
- 出现次数 (红色大字)
- 成功修正次数 (绿色)
- 优先级和最后出现时间
- 点击展开查看:
  - 修正策略 (JSON格式)
  - 详细统计信息

**4. 最近反馈标签页**

显示最近50条用户反馈:
- 严重程度标签 (P0/P1/P2/OK)
- 通过/失败状态
- 选中的错误类型
- 用户详细描述
- 提交时间
- "查看任务"按钮跳转

**5. 导出报告**

点击"导出报告"按钮:
- 下载CSV格式错误报告
- 包含所有错误类型统计
- 方便Excel分析

---

## 🔄 优化工作流程

### 每日例行任务

1. **早上查看错误中心**
   - 进入 `/errors` 页面
   - 查看昨日新增错误
   - 识别Top 3高频问题

2. **分析错误模式**
   - 点击展开查看修正策略
   - 确认哪种错误最多
   - 检查是否有新的错误类型

3. **优化Prompt或策略**
   - 针对高频错误调整Prompt
   - 测试新的修正策略
   - 更新错误模式表中的fix_strategy

4. **验证改进效果**
   - 找到之前失败的图片
   - 点击"重新生成"测试
   - 观察成功率是否提升

### 每周例行任务

1. **导出周报**
   - 选择"7天"时间范围
   - 导出CSV报告
   - 统计周成功率趋势

2. **对比改进**
   - 对比本周vs上周失败率
   - 识别改进明显的错误类型
   - 识别仍需优化的错误

3. **调整优先级**
   - 在error_patterns表中更新优先级
   - 高频且未解决的设为high
   - 已改进的降低优先级

---

## 🗄️ 数据库表说明

### human_reviews (人工反馈记录)

存储每次用户反馈:
```sql
- id: 反馈ID
- image_record_id: 关联的图片记录
- task_id: 关联的任务
- status: pass/fail
- error_types: 选中的错误类型数组 (JSONB)
- severity: P0/P1/P2/OK
- detailed_feedback: 用户详细描述
- created_at: 提交时间
```

**查询示例**:
```sql
-- 查看今天所有P0错误
SELECT * FROM human_reviews
WHERE severity = 'P0'
AND created_at >= CURRENT_DATE;

-- 统计本周各类错误数量
SELECT severity, COUNT(*)
FROM human_reviews
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY severity;
```

### error_patterns (错误模式库)

存储错误类型统计:
```sql
- id: 模式ID
- error_type: 错误类型代码
- error_category: P0_critical/P1_major/P2_minor
- description: 描述
- occurrence_count: 出现次数 (自动累加)
- success_count: 成功修正次数
- fix_strategy: 修正策略 (JSONB)
- last_occurred_at: 最后出现时间
```

**更新策略示例**:
```sql
-- 更新某个错误的修正策略
UPDATE error_patterns
SET fix_strategy = '{
  "prompt": "use_conservative",
  "model": "google/gemini-2.5-flash-preview-image",
  "strength_adjustment": -0.3
}'::jsonb
WHERE error_type = 'product_shape_changed';
```

### regeneration_attempts (重新生成记录)

追踪每次重新生成:
```sql
- id: 记录ID
- image_record_id: 图片ID
- attempt_number: 第几次尝试
- strategy_used: 使用的策略
- model_used: 使用的模型
- parameters: 参数配置 (JSONB)
- success: 是否成功
- created_at: 生成时间
```

**分析重试效果**:
```sql
-- 统计各策略的成功率
SELECT
  strategy_used,
  COUNT(*) as total,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as success_count,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM regeneration_attempts
GROUP BY strategy_used;
```

---

## 🎯 优化策略建议

### 针对P0错误 (产品形状/颜色改变)

**问题原因**: AI修改过度,改变了产品本身

**优化方案**:
1. 使用保守Prompt (强调"产品必须99%相同")
2. 降低modification_level (减20%)
3. 使用Gemini模型 (更稳定)

**Prompt示例**:
```
⚠️ ABSOLUTE RULE: Product MUST be 99% identical
- Keep exact same shape/form
- Keep exact same colors
- ONLY change background
- Product is UNTOUCHABLE
```

### 针对P1错误 (背景变化不足)

**问题原因**: AI修改太保守,背景几乎没变

**优化方案**:
1. 使用激进Prompt (强调"背景必须完全不同")
2. 提高modification_level (增20%)
3. 增加候选数量 (k=5)

**Prompt示例**:
```
⚠️ REQUIREMENT: Background MUST be DRAMATICALLY different
- Completely new environment
- Different lighting style
- Creative background
- Think "different photoshoot"
```

### 针对文字丢失问题

**问题原因**: AI误删了产品规格文字

**优化方案**:
1. 使用Claude模型 (文字理解强)
2. 在Prompt中多次强调保留文字
3. 列举具体要保留的文字类型

**Prompt示例**:
```
⚠️ CRITICAL: Preserve ALL text (any language)
✅ KEEP: Product specs, features, descriptions
❌ REMOVE: ONLY brand logos/company names

Examples:
- Chinese: Keep "防水", "透气"
- Russian: Keep "Нержавеющая сталь"
- Remove ONLY brand names
```

---

## 📈 成功率提升路径

**当前**: 75%

**第1周目标**: 80%
- 修复Top 3高频错误
- 优化Prompt针对P0错误

**第2周目标**: 85%
- 引入多模型策略
- 完善重试机制

**第3周目标**: 90%
- 调优所有错误类型
- A/B测试不同Prompt

**第4周目标**: 95%+
- 精细化调整
- 边缘案例处理

---

## 🚀 快速开始

1. **用户开始使用系统**
   - 上传图片测试
   - 标注遇到的问题

2. **第一天积累数据**
   - 处理20-50张图片
   - 收集用户反馈

3. **第二天查看错误中心**
   - 进入 `/errors`
   - 查看Top 3错误
   - 导出报告分析

4. **开始优化**
   - 针对高频错误调整策略
   - 重新测试失败图片
   - 观察改进效果

5. **持续迭代**
   - 每天查看新增错误
   - 每周统计成功率趋势
   - 逐步达成95%目标

---

## 💡 提示

- **鼓励用户反馈**: 可以在界面添加提示"帮助我们改进,点击反馈"
- **快速响应**: 用户反馈后,尽快优化并重新生成给他看
- **透明化**: 可以在错误中心显示"已优化"标签,让用户知道你在改进
- **数据驱动**: 不要凭感觉,用数据指导优化方向

---

## 🔗 相关页面

- 主页: `/`
- 任务列表: `/tasks`
- 任务详情: `/tasks/[taskId]` (包含反馈功能)
- **错误分析中心**: `/errors` (每天查看)
- 质量指标: `/metrics`

---

## ❓ 常见问题

**Q: 用户不反馈怎么办?**
A: 在界面上添加明显的反馈引导,或者设置小奖励

**Q: 如何知道优化是否有效?**
A: 对比优化前后的error_patterns occurrence_count,看是否下降

**Q: 应该优先修复哪些错误?**
A: 优先P0 > 高频P1 > 其他,影响最大的先修

**Q: 多久能达到95%?**
A: 如果每天优化,预计2-4周可以达成

---

**祝优化顺利! 🎉**
