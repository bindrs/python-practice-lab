CREATE TABLE IF NOT EXISTS classroom_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  code TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classroom_codes_class ON classroom_codes (class_code);

ALTER TABLE classroom_codes ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE classroom_codes TO anon, authenticated;

DROP POLICY IF EXISTS "anyone can select classroom_codes" ON classroom_codes;
CREATE POLICY "anyone can select classroom_codes" ON classroom_codes
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anyone can insert classroom_codes" ON classroom_codes;
CREATE POLICY "anyone can insert classroom_codes" ON classroom_codes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
