/*
  # 创建产品图片存储桶

  1. 创建存储桶
    - 创建 product-images 公共存储桶
    - 允许匿名用户上传和读取
  
  2. 安全策略
    - 允许所有人读取
    - 允许所有人上传（用于演示，生产环境需要限制）
*/

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete own files" ON storage.objects;

-- 允许所有人读取文件
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 允许所有人上传文件
CREATE POLICY "Anyone can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- 允许所有人更新文件
CREATE POLICY "Anyone can update own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- 允许所有人删除文件
CREATE POLICY "Anyone can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
