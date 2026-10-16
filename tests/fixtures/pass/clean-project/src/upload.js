import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { db } from './db.js';
import { logger } from './logger.js';

export const UPLOAD_RETENTION_DAYS = 90;

export async function saveUpload(memberId, file, meta) {
  const day = new Date().toISOString().slice(0, 10);
  const dir = join('uploads', day);
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `${Date.now()}-${file.originalname}`);
  writeFileSync(target, file.buffer ?? Buffer.alloc(0));

  const expiresAt = new Date(Date.now() + UPLOAD_RETENTION_DAYS * 86400000).toISOString();
  db.prepare('INSERT INTO attachments (member_id, path, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(memberId, target, new Date().toISOString(), expiresAt);

  return { memberId, path: target, expiresAt, ...meta };
}

/** 过期附件清理：先查到期行，删文件再删记录 */
export function purgeExpiredUploads(now = new Date()) {
  const rows = db
    .prepare('SELECT id, path FROM attachments WHERE expires_at IS NOT NULL AND expires_at < ?')
    .all(now.toISOString());
  for (const row of rows) {
    if (existsSync(row.path)) rmSync(row.path);
  }
  if (rows.length) {
    db.prepare('DELETE FROM attachments WHERE expires_at < ?').run(now.toISOString());
    logger.info('purgeExpiredUploads done', { count: rows.length });
  }
  return rows.length;
}
