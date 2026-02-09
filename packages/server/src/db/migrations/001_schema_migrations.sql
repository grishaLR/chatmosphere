-- Tracks which migrations have been applied (run first to bootstrap versioning)
CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
