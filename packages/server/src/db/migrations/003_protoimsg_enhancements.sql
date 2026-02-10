-- Migration 003: protoimsg enhancements
-- Room: add topic + allowlist_enabled
-- Messages: structured reply (root+parent), facets, embed
-- Rename buddy tables → community tables
-- Allowlist table

-- Room: add topic (idempotent)
DO $$ BEGIN
  ALTER TABLE rooms ADD COLUMN topic TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
UPDATE rooms SET topic = purpose WHERE topic IS NULL;
ALTER TABLE rooms ALTER COLUMN topic SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rooms_topic ON rooms(topic);

-- Room: add allowlist_enabled (idempotent)
DO $$ BEGIN
  ALTER TABLE rooms ADD COLUMN allowlist_enabled BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Messages: structured reply (rename reply_to → reply_parent, add root)
DO $$ BEGIN
  ALTER TABLE messages RENAME COLUMN reply_to TO reply_parent;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE messages ADD COLUMN reply_root TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Messages: facets + embed metadata
DO $$ BEGIN
  ALTER TABLE messages ADD COLUMN facets JSONB;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE messages ADD COLUMN embed JSONB;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Rename buddy_lists → community_lists (idempotent)
DO $$ BEGIN
  ALTER TABLE buddy_lists RENAME TO community_lists;
EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE buddy_members RENAME TO community_members;
EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE community_members RENAME COLUMN buddy_did TO member_did;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- Allowlist table
CREATE TABLE IF NOT EXISTS room_allowlist (
  id          TEXT PRIMARY KEY,
  room_id     TEXT NOT NULL REFERENCES rooms(id),
  subject_did TEXT NOT NULL,
  uri         TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL,
  indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_allowlist_room_subject ON room_allowlist(room_id, subject_did);
