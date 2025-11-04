# 用户反馈系统 - 技术架构文档

## 🏗️ 系统架构概览

```
┌─────────────┐
│   用户界面   │  任务详情页 - 反馈按钮 - 错误选择
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  反馈API    │  /api/feedback - 记录反馈
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  数据库层   │  human_reviews + error_patterns
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 错误分析中心 │  /errors - 查看统计和报告
└─────────────┘
       │
       ▼
┌─────────────┐
│  重新生成   │  /api/regenerate - 智能重试
└─────────────┘
```

---

## 📁 文件结构

```
project/
├── app/
│   ├── tasks/[taskId]/page.tsx      # 任务详情页 (含反馈UI)
│   ├── errors/page.tsx               # 错误分析中心
│   ├── api/
│   │   ├── feedback/route.ts        # 反馈提交API
│   │   └── regenerate/route.ts      # 重新生成API
│   └── page.tsx                      # 主页 (添加导航链接)
│
├── supabase/
│   └── migrations/
│       └── add_human_review_system.sql  # 数据库迁移
│
└── USER_FEEDBACK_GUIDE.md            # 使用指南
```

---

## 🗄️ 数据库架构

### 1. human_reviews (人工审核记录表)

**用途**: 存储每次用户反馈

```sql
CREATE TABLE human_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_record_id uuid NOT NULL,           -- 关联图片记录
  task_id uuid NOT NULL,                   -- 关联任务
  reviewer_id text DEFAULT 'anonymous',    -- 审核人
  status text NOT NULL DEFAULT 'pending',  -- pass/fail/needs_rework
  error_types jsonb DEFAULT '[]',          -- 错误类型数组
  severity text NOT NULL DEFAULT 'OK',     -- P0/P1/P2/OK
  detailed_feedback text,                  -- 详细描述
  expected_result text,                    -- 期望结果
  annotated_image_url text,                -- 标注图片URL
  reference_image_url text,                -- 参考图片URL
  user_rating int,                         -- 用户评分(1-5)
  is_resolved boolean DEFAULT false,       -- 是否已解决
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_human_reviews_status ON human_reviews(status);
CREATE INDEX idx_human_reviews_severity ON human_reviews(severity);
CREATE INDEX idx_human_reviews_image_record ON human_reviews(image_record_id);
CREATE INDEX idx_human_reviews_created_at ON human_reviews(created_at DESC);
```

### 2. error_patterns (错误模式库表)

**用途**: 统计和管理错误类型

```sql
CREATE TABLE error_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text NOT NULL,                -- 错误类型代码
  error_category text NOT NULL,            -- P0_critical/P1_major/P2_minor
  description text NOT NULL,               -- 错误描述
  original_image_url text NOT NULL,        -- 问题原图
  failed_output_url text NOT NULL,         -- 失败的生成图
  success_output_url text,                 -- 成功修正后的图
  fix_strategy jsonb DEFAULT '{}',         -- 修正策略
  occurrence_count int DEFAULT 1,          -- 出现次数
  success_count int DEFAULT 0,             -- 成功修正次数
  is_resolved boolean DEFAULT false,       -- 是否已解决
  priority text DEFAULT 'medium',          -- 优先级
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_occurred_at timestamptz DEFAULT now()
);

CREATE INDEX idx_error_patterns_type ON error_patterns(error_type);
CREATE INDEX idx_error_patterns_category ON error_patterns(error_category);
CREATE INDEX idx_error_patterns_occurrence ON error_patterns(occurrence_count DESC);
```

### 3. regeneration_attempts (重新生成尝试表)

**用途**: 追踪重新生成历史

```sql
CREATE TABLE regeneration_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_record_id uuid NOT NULL,           -- 图片记录ID
  human_review_id uuid,                    -- 关联反馈ID
  attempt_number int NOT NULL DEFAULT 1,   -- 第几次尝试
  strategy_used text NOT NULL,             -- 使用的策略
  prompt_template text,                    -- 使用的Prompt
  model_used text,                         -- 使用的模型
  parameters jsonb DEFAULT '{}',           -- 参数配置
  generated_url text,                      -- 生成的图片URL
  quality_scores jsonb DEFAULT '{}',       -- 质量评分
  success boolean DEFAULT false,           -- 是否成功
  error_message text,                      -- 错误信息
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_regeneration_attempts_image ON regeneration_attempts(image_record_id);
CREATE INDEX idx_regeneration_attempts_success ON regeneration_attempts(success);
```

### 4. success_cases (成功案例知识库)

**用途**: 存储成功案例供参考

```sql
CREATE TABLE success_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_image_url text NOT NULL,        -- 原图
  success_output_url text NOT NULL,        -- 成功的生成图
  image_category text,                     -- 图片类别
  difficulty_level text DEFAULT 'medium',  -- 难度
  prompt_used text NOT NULL,               -- 使用的Prompt
  model_used text NOT NULL,                -- 使用的模型
  parameters jsonb DEFAULT '{}',           -- 参数
  quality_scores jsonb DEFAULT '{}',       -- 质量评分
  human_rating int,                        -- 人工评分
  reuse_count int DEFAULT 0,               -- 被复用次数
  created_at timestamptz DEFAULT now(),
  last_reused_at timestamptz
);

CREATE INDEX idx_success_cases_category ON success_cases(image_category);
CREATE INDEX idx_success_cases_rating ON success_cases(human_rating DESC);
```

### 5. 扩展 image_records 表

```sql
ALTER TABLE image_records
ADD COLUMN user_feedback_status text DEFAULT 'pending',  -- pending/pass/fail/regenerating
ADD COLUMN regeneration_count int DEFAULT 0,             -- 重新生成次数
ADD COLUMN final_approval_status text DEFAULT 'pending', -- 最终审批状态
ADD COLUMN quality_details jsonb DEFAULT '{}';           -- 质量详情

CREATE INDEX idx_image_records_feedback_status ON image_records(user_feedback_status);
CREATE INDEX idx_image_records_approval_status ON image_records(final_approval_status);
```

---

## 🔄 API端点详解

### 1. POST /api/feedback

**功能**: 接收用户反馈并记录

**请求体**:
```typescript
{
  imageRecordId: string,      // 图片记录ID
  taskId: string,             // 任务ID
  status: 'pass' | 'fail',    // 通过/失败
  errorTypes: string[],       // 错误类型数组
  detailedFeedback?: string,  // 详细描述
  severity: 'P0' | 'P1' | 'P2' | 'OK'  // 严重程度
}
```

**处理流程**:
1. 验证参数
2. 插入human_reviews记录
3. 更新image_records.user_feedback_status
4. 累加error_patterns.occurrence_count
5. 更新last_occurred_at时间戳
6. 返回成功响应

**响应**:
```typescript
{
  success: true,
  review: { id, created_at, ... }
}
```

### 2. POST /api/regenerate

**功能**: 智能重新生成图片

**请求体**:
```typescript
{
  imageRecordId: string,  // 图片记录ID
  taskId: string          // 任务ID
}
```

**处理流程**:
1. 查询image_record和最新human_review
2. 根据error_types智能选择策略:
   - P0错误 → conservative + strength -0.2
   - P1差异不足 → aggressive + strength +0.2
   - 文字问题 → GPT-4V模型
3. 插入regeneration_attempts记录
4. 更新image_records状态为pending
5. 异步调用modify-images Edge Function
6. 等待生成完成,更新结果
7. 返回成功响应

**策略映射表**:
```typescript
const strategyMap = {
  'product_shape_changed': {
    strategy: 'conservative',
    model: 'google/gemini-2.5-flash-preview-image',
    strengthAdjustment: -0.2
  },
  'background_insufficient': {
    strategy: 'aggressive',
    model: 'google/gemini-2.5-flash-preview-image',
    strengthAdjustment: 0.2
  },
  'text_missing': {
    strategy: 'text_protection',
    model: 'openai/gpt-4o',
    strengthAdjustment: 0
  }
};
```

---

## 🎨 前端组件详解

### 1. 任务详情页反馈UI (app/tasks/[taskId]/page.tsx)

**新增状态**:
```typescript
const [feedbackImageId, setFeedbackImageId] = useState<string | null>(null);
const [feedbackMode, setFeedbackMode] = useState<'good' | 'bad' | null>(null);
const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
const [feedbackText, setFeedbackText] = useState("");
const [regenerating, setRegenerating] = useState<string | null>(null);
```

**反馈流程**:
```
用户点击"有问题"
→ 展开错误选择表单
→ 多选错误类型 + 输入描述
→ 提交反馈
→ 显示"重新生成"按钮
→ 点击重新生成
→ 系统自动重试
```

**UI组件结构**:
```tsx
{image.status === "completed" && (
  <div>
    {/* 质量指标 */}
    <div>差异度: {difference}% | 相似度: {similarity}%</div>

    {/* 反馈表单 */}
    {feedbackImageId === image.id ? (
      <div>
        {/* 错误类型多选框 */}
        <CheckboxList errors={errorTypes} />

        {/* 详细描述 */}
        <Textarea placeholder="详细描述问题..." />

        {/* 提交/取消按钮 */}
        <Button onClick={handleFeedbackSubmit}>提交</Button>
      </div>
    ) : (
      <>
        {/* 满意/有问题按钮 */}
        {user_feedback_status === 'pending' && (
          <div>
            <Button onClick={() => handleFeedbackClick(image.id, 'good')}>
              满意 ✅
            </Button>
            <Button onClick={() => handleFeedbackClick(image.id, 'bad')}>
              有问题 ❌
            </Button>
          </div>
        )}

        {/* 重新生成按钮 */}
        {user_feedback_status === 'fail' && (
          <Button onClick={() => handleRegenerate(image.id)}>
            重新生成 🔄 (第{regeneration_count + 1}次)
          </Button>
        )}
      </>
    )}

    {/* 下载按钮 */}
    <Button onClick={handleDownloadImage}>下载</Button>
  </div>
)}
```

### 2. 错误分析中心 (app/errors/page.tsx)

**数据获取**:
```typescript
useEffect(() => {
  // 获取error_patterns
  const { data: patterns } = await supabase
    .from('error_patterns')
    .select('*')
    .order('occurrence_count', { ascending: false });

  // 获取human_reviews
  const { data: reviews } = await supabase
    .from('human_reviews')
    .select('*')
    .gte('created_at', dateFilter)
    .order('created_at', { ascending: false });

  // 计算统计数据
  setStats({
    totalReviews: reviews.length,
    p0Count: reviews.filter(r => r.severity === 'P0').length,
    p1Count: reviews.filter(r => r.severity === 'P1').length,
    failRate: ...
  });
}, [timeRange]);
```

**页面布局**:
```
┌─────────────────────────────────────┐
│  标题 + 导出报告按钮 + 返回主页     │
├─────────────────────────────────────┤
│  时间范围选择: 24h | 7d | 30d | 全部 │
├─────────────────────────────────────┤
│  统计卡片: 总数 | 失败率 | P0 | 通过  │
├─────────────────────────────────────┤
│  Tabs: [错误模式] [最近反馈]        │
│  ┌───────────────────────────────┐  │
│  │ 错误模式列表                   │  │
│  │ - 产品形状改变  出现20次 ⬇️    │  │
│  │ - 背景变化不足  出现15次      │  │
│  │ - 文字丢失      出现10次      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🔧 核心功能实现

### 1. 错误类型自动累计

当用户提交反馈时:
```typescript
// /api/feedback/route.ts
if (errorTypes && errorTypes.length > 0) {
  for (const errorType of errorTypes) {
    const { data: existingPattern } = await supabase
      .from('error_patterns')
      .select('*')
      .eq('error_type', errorType)
      .single();

    if (existingPattern) {
      await supabase
        .from('error_patterns')
        .update({
          occurrence_count: existingPattern.occurrence_count + 1,
          last_occurred_at: new Date().toISOString()
        })
        .eq('id', existingPattern.id);
    }
  }
}
```

### 2. 智能策略选择

重新生成时根据错误类型选择策略:
```typescript
// /api/regenerate/route.ts
const errorTypes = review?.error_types || [];

let strategy = 'balanced';
let model = 'google/gemini-2.5-flash-preview-image';
let strengthAdjustment = 0;

// P0致命错误 → 保守策略
if (errorTypes.some(e => e.includes('product_'))) {
  strategy = 'conservative';
  strengthAdjustment = -0.2;
}
// P1差异不足 → 激进策略
else if (errorTypes.includes('background_insufficient')) {
  strategy = 'aggressive';
  strengthAdjustment = 0.2;
}
// 文字问题 → 切换模型
else if (errorTypes.some(e => e.includes('text_') || e.includes('logo_'))) {
  strategy = 'text_protection';
  model = 'openai/gpt-4o';
}
```

### 3. 错误报告导出

CSV格式导出:
```typescript
// app/errors/page.tsx
const exportErrorReport = () => {
  const csvContent = [
    ['错误类型', '描述', '出现次数', '解决次数', '优先级', '最后出现时间'],
    ...errorPatterns.map(p => [
      getErrorTypeName(p.error_type),
      p.description,
      p.occurrence_count,
      p.success_count,
      p.priority,
      new Date(p.last_occurred_at).toLocaleString('zh-CN')
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `错误报告_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
```

---

## 📊 数据分析查询示例

### 查看今日所有反馈
```sql
SELECT
  hr.severity,
  hr.status,
  hr.error_types,
  hr.detailed_feedback,
  hr.created_at
FROM human_reviews hr
WHERE hr.created_at >= CURRENT_DATE
ORDER BY hr.created_at DESC;
```

### 统计错误类型分布
```sql
SELECT
  ep.error_type,
  ep.error_category,
  ep.occurrence_count,
  ep.success_count,
  ROUND(100.0 * ep.success_count / NULLIF(ep.occurrence_count, 0), 2) as success_rate
FROM error_patterns ep
ORDER BY ep.occurrence_count DESC;
```

### 查看重试成功率
```sql
SELECT
  ra.strategy_used,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN ra.success THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN ra.success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM regeneration_attempts ra
GROUP BY ra.strategy_used;
```

### 计算每日成功率趋势
```sql
SELECT
  DATE(hr.created_at) as date,
  COUNT(*) as total_reviews,
  SUM(CASE WHEN hr.status = 'pass' THEN 1 ELSE 0 END) as passed,
  ROUND(100.0 * SUM(CASE WHEN hr.status = 'pass' THEN 1 ELSE 0 END) / COUNT(*), 2) as pass_rate
FROM human_reviews hr
WHERE hr.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(hr.created_at)
ORDER BY date DESC;
```

---

## 🚀 部署和启动

### 1. 应用数据库迁移
```bash
# 迁移已自动应用
# 检查表是否创建成功
supabase db tables list
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问页面
- 主页: http://localhost:3000
- 任务列表: http://localhost:3000/tasks
- 错误分析中心: http://localhost:3000/errors
- 质量指标: http://localhost:3000/metrics

---

## 🔐 安全考虑

1. **RLS策略**: 所有表已启用Row Level Security
2. **输入验证**: API端点验证所有输入参数
3. **SQL注入防护**: 使用Supabase客户端参数化查询
4. **CORS**: Edge Functions已配置CORS头

---

## 📈 性能优化

1. **数据库索引**: 已为常用查询添加索引
2. **分页加载**: 最近反馈限制50条
3. **缓存策略**: 可考虑添加Redis缓存热数据
4. **异步处理**: 重新生成采用异步模式

---

## 🛠️ 扩展建议

1. **用户认证**: 当前为匿名,可集成Supabase Auth
2. **实时更新**: 使用Supabase Realtime订阅数据变化
3. **批量操作**: 支持批量重新生成
4. **A/B测试**: 对比不同策略效果
5. **机器学习**: 训练模型预测最佳策略

---

**系统已完整搭建,可立即使用! 🎉**
