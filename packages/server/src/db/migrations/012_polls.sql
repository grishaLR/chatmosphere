-- Migration 012: Polls and votes
-- Polls appear inline in chat room timelines. Same ATProto data ownership
-- pattern as messages: user writes record to PDS → Jetstream → server indexes.

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
  id              TEXT PRIMARY KEY,
  uri             TEXT UNIQUE NOT NULL,
  did             TEXT NOT NULL,
  cid             TEXT,
  room_id         TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  question        TEXT NOT NULL,
  options         JSONB NOT NULL,
  allow_multiple  BOOLEAN NOT NULL DEFAULT false,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL,
  indexed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_room_id ON polls(room_id, created_at DESC);

-- Votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id               TEXT PRIMARY KEY,
  uri              TEXT UNIQUE NOT NULL,
  did              TEXT NOT NULL,
  cid              TEXT,
  poll_id          TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL,
  indexed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(poll_id, did)
);

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);

-- CHECK constraints
DO $$ BEGIN
  ALTER TABLE polls ADD CONSTRAINT chk_polls_question_length
    CHECK (char_length(question) BETWEEN 1 AND 200);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
