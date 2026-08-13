CREATE TABLE IF NOT EXISTS issues (
  number INTEGER PRIMARY KEY,
  node_id TEXT,
  title TEXT NOT NULL,
  body TEXT,
  state TEXT NOT NULL,
  locked INTEGER NOT NULL DEFAULT 0,
  author_login TEXT,
  author_avatar_url TEXT,
  html_url TEXT NOT NULL,
  comments_count INTEGER NOT NULL DEFAULT 0,
  labels_json TEXT NOT NULL DEFAULT '[]',
  assignees_json TEXT NOT NULL DEFAULT '[]',
  milestone_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  closed_at TEXT,
  synced_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS issues_updated_at_idx ON issues(updated_at DESC);

CREATE TABLE IF NOT EXISTS issue_comments (
  id INTEGER PRIMARY KEY,
  issue_number INTEGER NOT NULL,
  author_login TEXT,
  body TEXT,
  html_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (issue_number) REFERENCES issues(number) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS issue_comments_issue_number_idx
  ON issue_comments(issue_number, created_at);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  issues_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  error TEXT
);
