CREATE TABLE IF NOT EXISTS website_issue_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (issue_id) REFERENCES website_issues(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS website_issue_comments_issue_idx
  ON website_issue_comments(issue_id, created_at ASC);

CREATE INDEX IF NOT EXISTS website_issue_comments_author_idx
  ON website_issue_comments(author_id, created_at DESC);
