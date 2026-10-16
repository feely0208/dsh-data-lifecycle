import { db } from './db.js';

export function saveMember(input) {
  const info = db
    .prepare('INSERT INTO members (phone, nickname, created_at) VALUES (?, ?, ?)')
    .run(input.phone, input.nickname, new Date().toISOString());
  return { id: info.lastInsertRowid, phone: input.phone, nickname: input.nickname };
}

export function updateProfile(id, patch) {
  db.prepare('UPDATE members SET nickname = ? WHERE id = ?').run(patch.nickname, id);
  db.prepare('INSERT INTO audit_logs (actor, action, created_at) VALUES (?, ?, ?)')
    .run(String(id), 'update_profile', new Date().toISOString());
  return { id, ...patch };
}

export function listMembers({ page, size }) {
  return db
    .prepare('SELECT id, phone, nickname, created_at FROM members LIMIT ? OFFSET ?')
    .all(size, (page - 1) * size);
}
