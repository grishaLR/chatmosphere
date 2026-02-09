-- chatmosphere application schema

CREATE TABLE IF NOT EXISTS rooms (
  id          TEXT PRIMARY KEY,
  uri         TEXT UNIQUE NOT NULL,
  did         TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  purpose     TEXT NOT NULL DEFAULT 'discussion',
  visibility  TEXT NOT NULL DEFAULT 'public',
  min_account_age_days INTEGER DEFAULT 0,
  slow_mode_seconds    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL,
  indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rooms_visibility ON rooms(visibility);
CREATE INDEX IF NOT EXISTS idx_rooms_did ON rooms(did);

CREATE TABLE IF NOT EXISTS messages (
  id          TEXT PRIMARY KEY,
  uri         TEXT UNIQUE NOT NULL,
  did         TEXT NOT NULL,
  room_id     TEXT NOT NULL REFERENCES rooms(id),
  text        TEXT NOT NULL,
  reply_to    TEXT,
  created_at  TIMESTAMPTZ NOT NULL,
  indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_did ON messages(did);

CREATE TABLE IF NOT EXISTS mod_actions (
  id          SERIAL PRIMARY KEY,
  room_id     TEXT NOT NULL REFERENCES rooms(id),
  actor_did   TEXT NOT NULL,
  subject_did TEXT NOT NULL,
  action      TEXT NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mod_actions_room ON mod_actions(room_id);
CREATE INDEX IF NOT EXISTS idx_mod_actions_subject ON mod_actions(subject_did);

CREATE TABLE IF NOT EXISTS buddy_lists (
  did         TEXT PRIMARY KEY,
  groups      JSONB NOT NULL DEFAULT '[]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buddy_members (
  owner_did   TEXT NOT NULL,
  buddy_did   TEXT NOT NULL,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (owner_did, buddy_did)
);
CREATE INDEX IF NOT EXISTS idx_buddy_members_buddy ON buddy_members(buddy_did);

CREATE TABLE IF NOT EXISTS room_roles (
  id          SERIAL PRIMARY KEY,
  room_id     TEXT NOT NULL REFERENCES rooms(id),
  subject_did TEXT NOT NULL,
  role        TEXT NOT NULL,
  granted_by  TEXT NOT NULL,
  uri         TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL,
  indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_roles_unique ON room_roles(room_id, subject_did, role);

CREATE TABLE IF NOT EXISTS firehose_cursor (
  id          INTEGER PRIMARY KEY DEFAULT 1,
  cursor      BIGINT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dm_conversations (
  id          TEXT PRIMARY KEY,
  did_1       TEXT NOT NULL,
  did_2       TEXT NOT NULL,
  persist     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (did_1, did_2)
);
CREATE INDEX IF NOT EXISTS idx_dm_conversations_did1 ON dm_conversations(did_1);
CREATE INDEX IF NOT EXISTS idx_dm_conversations_did2 ON dm_conversations(did_2);

CREATE TABLE IF NOT EXISTS dm_messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  sender_did      TEXT NOT NULL,
  text            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dm_messages_conversation_created ON dm_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_dm_messages_created ON dm_messages(created_at);
