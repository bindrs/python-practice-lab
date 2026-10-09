CREATE TABLE IF NOT EXISTS classroom_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code TEXT NOT NULL,
  sender_session_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  sender_avatar TEXT,
  text TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classroom_messages_class_code ON classroom_messages (class_code);

ALTER TABLE classroom_messages ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE classroom_messages TO anon, authenticated;

DROP POLICY IF EXISTS "anyone can select classroom_messages" ON classroom_messages;
CREATE POLICY "anyone can select classroom_messages" ON classroom_messages
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anyone can insert classroom_messages" ON classroom_messages;
CREATE POLICY "anyone can insert classroom_messages" ON classroom_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
