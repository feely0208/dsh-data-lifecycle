CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  nickname TEXT,
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  expires_at TEXT
);

CREATE INDEX idx_members_expires ON members (expires_at);

CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT
);

CREATE INDEX idx_attachments_expires ON attachments (expires_at);

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT
);

CREATE TABLE plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  name TEXT NOT NULL
);

INSERT INTO plans (code, name) VALUES ('basic', '基础会员'), ('pro', '专业会员');
