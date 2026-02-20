-- Channels: Room → Channel → Messages/Polls
-- Alpha wipe: all existing rooms/messages/polls will be lost.

CREATE TABLE IF NOT EXISTS channels (
  id          TEXT PRIMARY KEY,
  uri         TEXT UNIQUE NOT NULL,
  did         TEXT NOT NULL,
  cid         TEXT,
  room_id     TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  position    INTEGER NOT NULL DEFAULT 0,
  post_policy TEXT NOT NULL DEFAULT 'everyone',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL,
  indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channels_room_id ON channels(room_id, position);

-- Wipe existing data (alpha — no backfill)
TRUNCATE TABLE poll_votes CASCADE;
TRUNCATE TABLE polls CASCADE;
TRUNCATE TABLE messages CASCADE;

-- Add channel_id FK to messages and polls
ALTER TABLE messages ADD COLUMN channel_id TEXT NOT NULL DEFAULT '' REFERENCES channels(id) ON DELETE CASCADE;
ALTER TABLE messages ALTER COLUMN channel_id DROP DEFAULT;

ALTER TABLE polls ADD COLUMN channel_id TEXT NOT NULL DEFAULT '' REFERENCES channels(id) ON DELETE CASCADE;
ALTER TABLE polls ALTER COLUMN channel_id DROP DEFAULT;

CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON messages(channel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_polls_channel_id ON polls(channel_id);
