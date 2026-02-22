-- Bridge waitlist signups to global_allowlist approvals.
-- Adds tracking columns so approval workflow can be queried:
--   SELECT * FROM waitlist WHERE status = 'pending'
--   SELECT * FROM waitlist WHERE status = 'approved' ORDER BY approved_at DESC

ALTER TABLE waitlist
  ADD COLUMN did         TEXT,
  ADD COLUMN status      TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN approved_at TIMESTAMPTZ;

-- Partial index for quick pending lookups
CREATE INDEX idx_waitlist_pending ON waitlist (created_at) WHERE status = 'pending';
