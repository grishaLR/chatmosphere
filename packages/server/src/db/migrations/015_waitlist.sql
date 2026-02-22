CREATE TABLE IF NOT EXISTS waitlist (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  handle     TEXT,
  source     TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
