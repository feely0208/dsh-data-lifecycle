CREATE TABLE plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  name TEXT NOT NULL
);

INSERT INTO plans (code, name) VALUES ('basic', '基础会员'), ('pro', '专业会员');
