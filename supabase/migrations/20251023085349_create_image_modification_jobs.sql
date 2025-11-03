/*
  # Create image modification jobs table

  1. New Tables
    - `image_jobs`
      - `id` (uuid, primary key) - Unique job identifier
      - `job_id` (text, unique) - User-facing job ID
      - `status` (text) - Job status: processing, completed, error
      - `original_url` (text) - Original image URL
      - `modification_level` (int) - Modification level (30-100)
      - `error_message` (text, nullable) - Error message if failed
      - `created_at` (timestamptz) - Job creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `modified_images`
      - `id` (uuid, primary key) - Unique image identifier
      - `job_id` (uuid, foreign key) - Reference to image_jobs
      - `image_url` (text) - Generated image URL or base64
      - `similarity` (numeric) - Similarity score
      - `difference` (numeric) - Difference score
      - `created_at` (timestamptz) - Image creation timestamp

  2. Security
    - Enable RLS on both tables
    - Public read access (no auth required for this tool)
*/

CREATE TABLE IF NOT EXISTS image_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  original_url text NOT NULL,
  modification_level int NOT NULL DEFAULT 50,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modified_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES image_jobs(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  similarity numeric NOT NULL,
  difference numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE image_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE modified_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to jobs"
  ON image_jobs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to jobs"
  ON image_jobs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to jobs"
  ON image_jobs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to images"
  ON modified_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to images"
  ON modified_images FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_image_jobs_job_id ON image_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_modified_images_job_id ON modified_images(job_id);
