/*
  # 修复现有图片记录的字段

  1. 更新现有记录
    - 为所有现有的image_records设置默认字段值
    - 确保user_feedback_status、regeneration_count和final_approval_status字段有值
*/

-- 更新所有缺失user_feedback_status的记录
UPDATE image_records
SET user_feedback_status = 'pending'
WHERE user_feedback_status IS NULL;

-- 更新所有缺失regeneration_count的记录
UPDATE image_records
SET regeneration_count = 0
WHERE regeneration_count IS NULL;

-- 更新所有缺失final_approval_status的记录
UPDATE image_records
SET final_approval_status = 'pending'
WHERE final_approval_status IS NULL;

-- 更新所有缺失quality_details的记录
UPDATE image_records
SET quality_details = '{}'::jsonb
WHERE quality_details IS NULL;
