/*
  # Add index for created_at column

  ## Changes
  - Add index on image_records.created_at for faster sorting queries
  - This will significantly improve query performance when ordering by created_at

  ## Performance Impact
  - Current queries are timing out due to missing index
  - With index, queries should complete in milliseconds
*/

-- Add index for created_at to improve query performance
CREATE INDEX IF NOT EXISTS idx_image_records_created_at 
ON image_records(created_at DESC);

-- Add composite index for status and created_at (common query pattern)
CREATE INDEX IF NOT EXISTS idx_image_records_status_created_at 
ON image_records(status, created_at DESC);