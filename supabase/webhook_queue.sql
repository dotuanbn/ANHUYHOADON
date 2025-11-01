-- SQL script để tạo bảng webhook_queue trong Supabase
-- Chạy script này trong Supabase SQL Editor

-- Tạo bảng webhook_queue
CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  store_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_webhook_queue_processed ON webhook_queue(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_created_at ON webhook_queue(created_at DESC);

-- Tạo index cho store_id nếu cần
CREATE INDEX IF NOT EXISTS idx_webhook_queue_store_id ON webhook_queue(store_id);

-- Enable Row Level Security (RLS) nếu cần
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;

-- Policy để cho phép insert từ service role (serverless function)
CREATE POLICY "Allow service role to insert webhooks"
  ON webhook_queue
  FOR INSERT
  WITH CHECK (true);

-- Policy để cho phép read từ anon key (frontend)
CREATE POLICY "Allow anon to read unprocessed webhooks"
  ON webhook_queue
  FOR SELECT
  USING (processed = false);

-- Policy để cho phép update processed status
CREATE POLICY "Allow anon to update processed status"
  ON webhook_queue
  FOR UPDATE
  USING (processed = false)
  WITH CHECK (processed = true);

-- Xóa webhook đã xử lý sau 7 ngày (optional)
-- CREATE OR REPLACE FUNCTION cleanup_processed_webhooks()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM webhook_queue
--   WHERE processed = true
--   AND created_at < NOW() - INTERVAL '7 days';
-- END;
-- $$ LANGUAGE plpgsql;

-- Schedule cleanup job (cần pg_cron extension)
-- SELECT cron.schedule('cleanup-webhooks', '0 0 * * *', 'SELECT cleanup_processed_webhooks();');

