-- Global allowlist: when REQUIRE_ALLOWLIST=true, only DIDs in this table can
-- authenticate. Mirrors global_bans — in-memory Set loaded at startup, this
-- table is the durable backing store.

CREATE TABLE IF NOT EXISTS global_allowlist (
  did        TEXT PRIMARY KEY,
  handle     TEXT,
  reason     TEXT,
  added_by   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
