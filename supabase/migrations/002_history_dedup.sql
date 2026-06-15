-- Dedup exam history rows per user (sync upsert by stable client entry id).
-- Idempotent: safe to re-run.

ALTER TABLE lc_user_history ADD COLUMN IF NOT EXISTS entry_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_history_user_entrykey
  ON lc_user_history(user_id, entry_key) WHERE entry_key IS NOT NULL;
