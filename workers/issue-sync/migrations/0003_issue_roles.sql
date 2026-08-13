ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'player';

CREATE TABLE IF NOT EXISTS reserved_usernames (
  username_key TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO reserved_usernames (username_key, username, role, created_at)
VALUES
  ('rinnrei', 'RinnRei', 'admin', '2026-08-14T00:00:00.000Z'),
  ('uwugl', 'uwugl', 'admin', '2026-08-14T00:00:00.000Z'),
  ('likw233', 'likw233', 'admin', '2026-08-14T00:00:00.000Z');

UPDATE users
SET role = 'admin'
WHERE lower(username) IN ('rinnrei', 'uwugl', 'likw233');
