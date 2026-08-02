-- Run this in Supabase -> SQL Editor -> New Query -> Run

-- Sessions table: stores every interview attempt
CREATE TABLE sessions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     text        DEFAULT 'guest',
  question    text        NOT NULL,
  transcript  text,
  feedback    jsonb,
  score       integer,
  audio_url   text,
  created_at  timestamp   DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow all reads and inserts for now because the app uses a guest flow.
-- Tighten this policy before adding real user accounts or private data.
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- Questions table. The current app keeps questions in code, but this is ready
-- if you want to move questions into Supabase later.
CREATE TABLE questions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  category    text        CHECK (category IN ('hr', 'technical', 'dsa')),
  question    text        NOT NULL,
  difficulty  text        CHECK (difficulty IN ('easy', 'medium', 'hard')),
  hint        text,
  created_at  timestamp   DEFAULT now()
);
