CREATE TABLE IF NOT EXISTS classroom_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  username TEXT NOT NULL,
  class_code TEXT NOT NULL,
  joined_at BIGINT NOT NULL,
  camera_active BOOLEAN DEFAULT false,
  mic_active BOOLEAN DEFAULT false,
  avatar_color TEXT,
  last_ping BIGINT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classroom_users_class_code ON classroom_users (class_code);
CREATE INDEX IF NOT EXISTS idx_classroom_users_session_id ON classroom_users (session_id);

ALTER TABLE classroom_users ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE classroom_users TO anon, authenticated;

DROP POLICY IF EXISTS "anyone can select classroom_users" ON classroom_users;
CREATE POLICY "anyone can select classroom_users" ON classroom_users
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anyone can insert classroom_users" ON classroom_users;
CREATE POLICY "anyone can insert classroom_users" ON classroom_users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "anyone can update classroom_users" ON classroom_users;
CREATE POLICY "anyone can update classroom_users" ON classroom_users
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "anyone can delete classroom_users" ON classroom_users;
CREATE POLICY "anyone can delete classroom_users" ON classroom_users
  FOR DELETE TO anon, authenticated
  USING (true);
