CREATE TABLE IF NOT EXISTS classroom_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code TEXT NOT NULL,
  from_session_id TEXT NOT NULL,
  target_session_id TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classroom_signals_target ON classroom_signals(class_code, target_session_id, timestamp);

ALTER TABLE classroom_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_all_signals ON classroom_signals;
CREATE POLICY allow_all_signals ON classroom_signals FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);
