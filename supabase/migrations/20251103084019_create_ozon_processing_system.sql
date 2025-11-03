/*
  # Ozon商品智能处理系统 - 数据库架构

  ## 1. 新建表

  ### tasks (任务表)
  - `id` (uuid, primary key) - 任务ID
  - `user_id` (text) - 用户ID（暂时用文本，未来可关联auth.users）
  - `product_url` (text) - 商品URL
  - `product_title` (text) - 商品标题
  - `status` (text) - 任务状态: pending/downloading/processing/packing/completed/failed
  - `progress` (int) - 进度百分比 (0-100)
  - `current_step` (text) - 当前步骤描述
  - `total_images` (int) - 图片总数
  - `processed_images` (int) - 已处理图片数
  - `original_description` (text) - 原始商品描述
  - `modified_description` (text) - 修改后的描述
  - `zip_url` (text) - 打包文件下载链接
  - `error_message` (text) - 错误信息
  - `created_at` (timestamptz) - 创建时间
  - `updated_at` (timestamptz) - 更新时间
  - `completed_at` (timestamptz) - 完成时间

  ### image_records (图片处理记录表)
  - `id` (uuid, primary key) - 记录ID
  - `task_id` (uuid, foreign key) - 关联任务ID
  - `original_url` (text) - 原始图片URL
  - `modified_url` (text) - 修改后图片URL
  - `storage_path` (text) - Supabase Storage路径
  - `status` (text) - 处理状态: pending/processing/completed/failed
  - `similarity` (numeric) - 相似度
  - `difference` (numeric) - 差异度
  - `error_message` (text) - 错误信息
  - `processing_time` (int) - 处理耗时（毫秒）
  - `created_at` (timestamptz) - 创建时间
  - `completed_at` (timestamptz) - 完成时间

  ### processing_configs (处理配置表)
  - `id` (uuid, primary key) - 配置ID
  - `name` (text) - 配置名称
  - `config_type` (text) - 配置类型: image_processing/text_rewrite
  - `is_active` (boolean) - 是否激活
  - `settings` (jsonb) - 配置设置（JSON格式）
  - `description` (text) - 配置描述
  - `created_at` (timestamptz) - 创建时间
  - `updated_at` (timestamptz) - 更新时间

  ### task_logs (任务日志表)
  - `id` (uuid, primary key) - 日志ID
  - `task_id` (uuid, foreign key) - 关联任务ID
  - `log_type` (text) - 日志类型: info/warning/error
  - `message` (text) - 日志消息
  - `metadata` (jsonb) - 额外元数据
  - `created_at` (timestamptz) - 创建时间

  ## 2. 安全设置
  - 所有表启用RLS
  - 添加基础访问策略（暂时允许所有认证用户访问，未来可细化）

  ## 3. 索引
  - tasks表：按user_id和status索引
  - image_records表：按task_id索引
  - task_logs表：按task_id索引
*/

-- 创建tasks表
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'anonymous',
  product_url text,
  product_title text,
  status text NOT NULL DEFAULT 'pending',
  progress int DEFAULT 0,
  current_step text,
  total_images int DEFAULT 0,
  processed_images int DEFAULT 0,
  original_description text,
  modified_description text,
  zip_url text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 创建image_records表
CREATE TABLE IF NOT EXISTS image_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  original_url text NOT NULL,
  modified_url text,
  storage_path text,
  status text NOT NULL DEFAULT 'pending',
  similarity numeric,
  difference numeric,
  error_message text,
  processing_time int,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- 创建processing_configs表
CREATE TABLE IF NOT EXISTS processing_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  config_type text NOT NULL,
  is_active boolean DEFAULT false,
  settings jsonb NOT NULL DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建task_logs表
CREATE TABLE IF NOT EXISTS task_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  log_type text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_records_task_id ON image_records(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_task_id ON task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_processing_configs_type_active ON processing_configs(config_type, is_active);

-- 启用RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略（暂时允许所有操作，未来可添加认证）
CREATE POLICY "Allow all operations on tasks"
  ON tasks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on image_records"
  ON image_records
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on processing_configs"
  ON processing_configs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on task_logs"
  ON task_logs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 插入默认配置
INSERT INTO processing_configs (name, config_type, is_active, settings, description)
VALUES 
  (
    '默认图片处理配置',
    'image_processing',
    true,
    '{"modification_level": 100, "ai_model": "google/gemini-2.5-flash-preview-image", "logo_text": "", "quality": 85}'::jsonb,
    '使用Gemini 2.5 Flash进行图片修改，默认修改程度100'
  ),
  (
    '默认文本改写配置',
    'text_rewrite',
    true,
    '{"ai_model": "openai/gpt-4o", "style": "professional", "preserve_keywords": true, "target_length": "same"}'::jsonb,
    '使用GPT-4o进行文本改写，保持专业风格'
  )
ON CONFLICT DO NOTHING;
