CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  nickname TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  path TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_members_phone ON members (phone);
CREATE INDEX idx_attachments_member ON attachments (member_id);
