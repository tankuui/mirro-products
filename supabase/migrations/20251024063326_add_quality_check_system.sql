/*
  # Add Quality Check System

  This migration adds comprehensive quality checking, error classification,
  and metrics tracking to achieve <5% failure rate (stage 1) and <3% (stage 2).

  1. Schema Changes
    - Add quality metrics fields to `modified_images`
    - Create `quality_checks` table for detailed QA results
    - Create `retry_records` table for auto-retry tracking
    - Create `quality_metrics` table for aggregated statistics
    - Create `error_classifications` table for P0/P1/P2 tracking

  2. Error Levels
    - P0 (Critical): Product shape/color/details changed, subject cropped, logo wrong
    - P1 (Severe): Background/lighting off-topic, wrong dimensions, difference <30%
    - P2 (Minor): Small artifacts, shadow issues, compression artifacts

  3. Quality Thresholds
    - SSIM min difference: 0.30 (30% difference required)
    - pHash min distance: 12
    - Geometry max delta: 0.03 (3% max geometric change)
    - Edge quality min score: 0.6

  4. Security
    - Enable RLS on all new tables
    - Public access for read/write (no auth required)
*/

-- Add quality metrics columns to modified_images
ALTER TABLE modified_images
  ADD COLUMN IF NOT EXISTS ssim_score numeric,
  ADD COLUMN IF NOT EXISTS phash_distance int,
  ADD COLUMN IF NOT EXISTS edge_score numeric,
  ADD COLUMN IF NOT EXISTS geom_delta numeric,
  ADD COLUMN IF NOT EXISTS clip_style_score numeric,
  ADD COLUMN IF NOT EXISTS quality_score numeric,
  ADD COLUMN IF NOT EXISTS error_level text CHECK (error_level IN ('P0', 'P1', 'P2', 'OK')),
  ADD COLUMN IF NOT EXISTS error_reasons text[],
  ADD COLUMN IF NOT EXISTS strength_used numeric,
  ADD COLUMN IF NOT EXISTS generation_mode text,
  ADD COLUMN IF NOT EXISTS retry_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_level text CHECK (risk_level IN ('low', 'medium', 'high'));

-- Quality checks table: detailed QA results for each image
CREATE TABLE IF NOT EXISTS quality_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modified_image_id uuid NOT NULL REFERENCES modified_images(id) ON DELETE CASCADE,
  check_type text NOT NULL,
  passed boolean NOT NULL,
  score numeric,
  threshold numeric,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Retry records table: track auto-retry attempts
CREATE TABLE IF NOT EXISTS retry_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES image_jobs(id) ON DELETE CASCADE,
  original_image_id uuid REFERENCES modified_images(id) ON DELETE SET NULL,
  retry_number int NOT NULL,
  reason text NOT NULL,
  strategy text NOT NULL,
  strength_adjustment numeric,
  prompt_template_changed boolean DEFAULT false,
  model_changed boolean DEFAULT false,
  result text CHECK (result IN ('success', 'failed', 'pending')),
  created_at timestamptz DEFAULT now()
);

-- Error classifications table: categorize errors by type
CREATE TABLE IF NOT EXISTS error_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modified_image_id uuid NOT NULL REFERENCES modified_images(id) ON DELETE CASCADE,
  error_level text NOT NULL CHECK (error_level IN ('P0', 'P1', 'P2')),
  error_type text NOT NULL,
  error_description text,
  auto_detected boolean DEFAULT true,
  human_verified boolean DEFAULT false,
  false_positive boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Quality metrics table: aggregated statistics
CREATE TABLE IF NOT EXISTS quality_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_images int NOT NULL DEFAULT 0,
  passed_count int NOT NULL DEFAULT 0,
  p0_count int NOT NULL DEFAULT 0,
  p1_count int NOT NULL DEFAULT 0,
  p2_count int NOT NULL DEFAULT 0,
  avg_ssim numeric,
  avg_phash_distance numeric,
  avg_edge_score numeric,
  avg_geom_delta numeric,
  avg_quality_score numeric,
  pass_rate numeric,
  p0_rate numeric,
  p1_rate numeric,
  retry_rate numeric,
  category text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(period_start, period_end, category)
);

-- Configuration table: store thresholds and policies
CREATE TABLE IF NOT EXISTS quality_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Insert default configuration
INSERT INTO quality_config (config_key, config_value, description) VALUES
  ('qa_thresholds', '{
    "ssim_min_diff": 0.30,
    "phash_min_dist": 12,
    "geom_max_delta": 0.03,
    "edge_min_score": 0.6,
    "max_retries": 2
  }'::jsonb, 'Quality assurance thresholds'),
  ('generation_config', '{
    "k_samples_default": 3,
    "k_samples_high_risk": 4,
    "strength_step_on_retry": 0.15,
    "mode_priority": ["inpaint_bg_only", "variant"]
  }'::jsonb, 'Image generation configuration'),
  ('target_rates', '{
    "p0_rate": 0.01,
    "total_fail_rate_stage1": 0.05,
    "total_fail_rate_stage2": 0.03,
    "p0_rate_mature": 0.005
  }'::jsonb, 'Target quality rates by stage')
ON CONFLICT (config_key) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE retry_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quality_checks
CREATE POLICY "Allow public read access to quality_checks"
  ON quality_checks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to quality_checks"
  ON quality_checks FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for retry_records
CREATE POLICY "Allow public read access to retry_records"
  ON retry_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to retry_records"
  ON retry_records FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to retry_records"
  ON retry_records FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for error_classifications
CREATE POLICY "Allow public read access to error_classifications"
  ON error_classifications FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to error_classifications"
  ON error_classifications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to error_classifications"
  ON error_classifications FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for quality_metrics
CREATE POLICY "Allow public read access to quality_metrics"
  ON quality_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to quality_metrics"
  ON quality_metrics FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to quality_metrics"
  ON quality_metrics FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for quality_config
CREATE POLICY "Allow public read access to quality_config"
  ON quality_config FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public update to quality_config"
  ON quality_config FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quality_checks_image_id ON quality_checks(modified_image_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_type ON quality_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_retry_records_job_id ON retry_records(job_id);
CREATE INDEX IF NOT EXISTS idx_error_classifications_image_id ON error_classifications(modified_image_id);
CREATE INDEX IF NOT EXISTS idx_error_classifications_level ON error_classifications(error_level);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_period ON quality_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_modified_images_error_level ON modified_images(error_level);

-- Function to calculate pass rate for a period
CREATE OR REPLACE FUNCTION calculate_quality_metrics(
  start_time timestamptz,
  end_time timestamptz,
  category_filter text DEFAULT NULL
)
RETURNS TABLE (
  total_images bigint,
  passed_count bigint,
  p0_count bigint,
  p1_count bigint,
  p2_count bigint,
  pass_rate numeric,
  p0_rate numeric,
  p1_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_images,
    COUNT(*) FILTER (WHERE error_level = 'OK')::bigint as passed_count,
    COUNT(*) FILTER (WHERE error_level = 'P0')::bigint as p0_count,
    COUNT(*) FILTER (WHERE error_level = 'P1')::bigint as p1_count,
    COUNT(*) FILTER (WHERE error_level = 'P2')::bigint as p2_count,
    ROUND(COUNT(*) FILTER (WHERE error_level = 'OK')::numeric / NULLIF(COUNT(*), 0), 4) as pass_rate,
    ROUND(COUNT(*) FILTER (WHERE error_level = 'P0')::numeric / NULLIF(COUNT(*), 0), 4) as p0_rate,
    ROUND(COUNT(*) FILTER (WHERE error_level = 'P1')::numeric / NULLIF(COUNT(*), 0), 4) as p1_rate
  FROM modified_images mi
  JOIN image_jobs ij ON mi.job_id = ij.id
  WHERE ij.created_at >= start_time
    AND ij.created_at < end_time
    AND (category_filter IS NULL OR ij.job_id LIKE '%' || category_filter || '%');
END;
$$ LANGUAGE plpgsql;
