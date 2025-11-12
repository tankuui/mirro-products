-- 查看最近的任务状态
SELECT 
  id, 
  status, 
  current_step, 
  error_message, 
  created_at,
  updated_at
FROM tasks 
ORDER BY created_at DESC 
LIMIT 5;

-- 查看最近的任务日志
SELECT 
  task_id,
  log_type,
  message,
  created_at
FROM task_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- 查看失败的图片记录
SELECT 
  id,
  task_id,
  status,
  error_message,
  regeneration_count,
  created_at
FROM image_records 
WHERE status = 'failed'
ORDER BY created_at DESC 
LIMIT 10;
