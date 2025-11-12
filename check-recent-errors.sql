-- 查看最近失败的图片
SELECT 
  id,
  task_id,
  status,
  error_message,
  regeneration_count,
  created_at,
  completed_at
FROM image_records 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 查看最近的错误日志
SELECT 
  task_id,
  log_type,
  message,
  metadata,
  created_at
FROM task_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND log_type IN ('error', 'warning')
ORDER BY created_at DESC;
