import { db } from './db.js';

export const MEMBER_RETENTION_DAYS = 180;

export function saveMember(input) {
  const info = db
    .prepare('INSERT INTO members (phone, nickname, created_at) VALUES (?, ?, ?)')
    .run(input.phone, input.nickname, new Date().toISOString());
  return { id: info.lastInsertRowid, phone: input.phone };
}

export function updateProfile(id, patch) {
  db.prepare('UPDATE members SET nickname = ? WHERE id = ?').run(patch.nickname, id);
  return { id, ...patch };
}

export function listMembers({ page, size }) {
  return db
    .prepare('SELECT id, phone, nickname FROM members LIMIT ? OFFSET ?')
    .all(size, (page - 1) * size);
}
