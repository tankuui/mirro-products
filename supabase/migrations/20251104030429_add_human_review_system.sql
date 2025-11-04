/*
  # 人工审核与反馈系统

  1. 新建表
    - human_reviews (人工审核记录)
      - 记录用户对每张生成图的反馈
      - 包含错误类型、严重程度、详细描述
      - 支持图片标注和参考图上传
    
    - error_patterns (错误模式库)
      - 记录常见错误模式
      - 存储失败案例和成功修正案例
      - 追踪修正策略和效果
    
    - regeneration_attempts (重新生成记录)
      - 记录每次重新生成的尝试
      - 追踪使用的策略和参数
      - 对比修正前后效果

  2. 扩展现有表
    - image_records 添加字段
      - user_feedback_status (用户反馈状态)
      - regeneration_count (重新生成次数)
      - final_approval_status (最终审批状态)

  3. 索引优化
    - 按反馈状态和错误类型索引
    - 提高查询性能

  4. RLS策略
    - 允许所有操作(后续可细化为按用户权限)
*/

-- 人工审核记录表
CREATE TABLE IF NOT EXISTS human_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_record_id uuid NOT NULL REFERENCES image_records(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id text DEFAULT 'anonymous',
  status text NOT NULL DEFAULT 'pending',
  error_types jsonb DEFAULT '[]',
  severity text NOT NULL DEFAULT 'OK',
  detailed_feedback text,
  expected_result text,
  annotated_image_url text,
  reference_image_url text,
  user_rating int,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- 错误模式库表
CREATE TABLE IF NOT EXISTS error_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text NOT NULL,
  error_category text NOT NULL,
  description text NOT NULL,
  original_image_url text NOT NULL,
  failed_output_url text NOT NULL,
  success_output_url text,
  fix_strategy jsonb DEFAULT '{}',
  occurrence_count int DEFAULT 1,
  success_count int DEFAULT 0,
  is_resolved boolean DEFAULT false,
  priority text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_occurred_at timestamptz DEFAULT now()
);

-- 重新生成尝试记录表
CREATE TABLE IF NOT EXISTS regeneration_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_record_id uuid NOT NULL REFERENCES image_records(id) ON DELETE CASCADE,
  human_review_id uuid REFERENCES human_reviews(id) ON DELETE SET NULL,
  attempt_number int NOT NULL DEFAULT 1,
  strategy_used text NOT NULL,
  prompt_template text,
  model_used text,
  parameters jsonb DEFAULT '{}',
  generated_url text,
  quality_scores jsonb DEFAULT '{}',
  success boolean DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- 成功案例知识库表
CREATE TABLE IF NOT EXISTS success_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_image_url text NOT NULL,
  success_output_url text NOT NULL,
  image_category text,
  difficulty_level text DEFAULT 'medium',
  prompt_used text NOT NULL,
  model_used text NOT NULL,
  parameters jsonb DEFAULT '{}',
  quality_scores jsonb DEFAULT '{}',
  human_rating int,
  reuse_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_reused_at timestamptz
);

-- 扩展 image_records 表
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'image_records' AND column_name = 'user_feedback_status'
  ) THEN
    ALTER TABLE image_records ADD COLUMN user_feedback_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'image_records' AND column_name = 'regeneration_count'
  ) THEN
    ALTER TABLE image_records ADD COLUMN regeneration_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'image_records' AND column_name = 'final_approval_status'
  ) THEN
    ALTER TABLE image_records ADD COLUMN final_approval_status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'image_records' AND column_name = 'quality_details'
  ) THEN
    ALTER TABLE image_records ADD COLUMN quality_details jsonb DEFAULT '{}';
  END IF;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_human_reviews_status ON human_reviews(status);
CREATE INDEX IF NOT EXISTS idx_human_reviews_severity ON human_reviews(severity);
CREATE INDEX IF NOT EXISTS idx_human_reviews_image_record ON human_reviews(image_record_id);
CREATE INDEX IF NOT EXISTS idx_human_reviews_task ON human_reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_human_reviews_created_at ON human_reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_patterns_type ON error_patterns(error_type);
CREATE INDEX IF NOT EXISTS idx_error_patterns_category ON error_patterns(error_category);
CREATE INDEX IF NOT EXISTS idx_error_patterns_unresolved ON error_patterns(is_resolved) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_error_patterns_occurrence ON error_patterns(occurrence_count DESC);

CREATE INDEX IF NOT EXISTS idx_regeneration_attempts_image ON regeneration_attempts(image_record_id);
CREATE INDEX IF NOT EXISTS idx_regeneration_attempts_success ON regeneration_attempts(success);

CREATE INDEX IF NOT EXISTS idx_success_cases_category ON success_cases(image_category);
CREATE INDEX IF NOT EXISTS idx_success_cases_rating ON success_cases(human_rating DESC);

CREATE INDEX IF NOT EXISTS idx_image_records_feedback_status ON image_records(user_feedback_status);
CREATE INDEX IF NOT EXISTS idx_image_records_approval_status ON image_records(final_approval_status);

-- 启用RLS
ALTER TABLE human_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE regeneration_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_cases ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Allow all operations on human_reviews"
  ON human_reviews
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on error_patterns"
  ON error_patterns
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on regeneration_attempts"
  ON regeneration_attempts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on success_cases"
  ON success_cases
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 插入错误类型预设
INSERT INTO error_patterns (error_type, error_category, description, original_image_url, failed_output_url, fix_strategy, occurrence_count)
VALUES 
  ('product_shape_changed', 'P0_critical', '产品形状/容器类型发生改变', 'placeholder', 'placeholder', '{"prompt": "use_conservative", "model": "gemini", "strength_adjustment": -0.2}'::jsonb, 0),
  ('product_color_changed', 'P0_critical', '产品主要颜色发生明显改变', 'placeholder', 'placeholder', '{"prompt": "use_conservative", "model": "gemini", "strength_adjustment": -0.15}'::jsonb, 0),
  ('product_size_wrong', 'P0_critical', '产品尺寸比例不正确', 'placeholder', 'placeholder', '{"prompt": "use_conservative", "model": "gpt4v", "strength_adjustment": -0.2}'::jsonb, 0),
  ('background_insufficient', 'P1_major', '背景变化不够明显', 'placeholder', 'placeholder', '{"prompt": "use_aggressive", "model": "gemini", "strength_adjustment": 0.2}'::jsonb, 0),
  ('background_too_different', 'P1_major', '背景变化过大,不像同类产品', 'placeholder', 'placeholder', '{"prompt": "use_balanced", "model": "gpt4v", "strength_adjustment": -0.1}'::jsonb, 0),
  ('logo_not_removed', 'P1_major', '品牌Logo没有完全去除', 'placeholder', 'placeholder', '{"prompt": "use_logo_removal", "model": "claude", "strength_adjustment": 0}'::jsonb, 0),
  ('text_missing', 'P1_major', '产品文字/规格信息丢失', 'placeholder', 'placeholder', '{"prompt": "use_text_protection", "model": "claude", "strength_adjustment": 0}'::jsonb, 0),
  ('new_logo_unclear', 'P2_minor', '新Logo不清晰或位置不当', 'placeholder', 'placeholder', '{"prompt": "use_logo_enhancement", "model": "gemini", "strength_adjustment": 0}'::jsonb, 0),
  ('image_blurry', 'P2_minor', '生成图片模糊或质量差', 'placeholder', 'placeholder', '{"prompt": "use_quality_enhancement", "model": "gpt4v", "strength_adjustment": -0.1}'::jsonb, 0),
  ('dimension_mismatch', 'P2_minor', '图片尺寸与原图不匹配', 'placeholder', 'placeholder', '{"prompt": "use_dimension_lock", "model": "gemini", "strength_adjustment": 0}'::jsonb, 0)
ON CONFLICT DO NOTHING;
