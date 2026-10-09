CREATE TABLE IF NOT EXISTS classroom_live_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code TEXT NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  teacher_name TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classroom_actions_code ON classroom_live_actions (class_code);

ALTER TABLE classroom_live_actions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE classroom_live_actions TO anon, authenticated;

DROP POLICY IF EXISTS "anyone can select classroom_live_actions" ON classroom_live_actions;
CREATE POLICY "anyone can select classroom_live_actions" ON classroom_live_actions
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anyone can insert classroom_live_actions" ON classroom_live_actions;
CREATE POLICY "anyone can insert classroom_live_actions" ON classroom_live_actions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
