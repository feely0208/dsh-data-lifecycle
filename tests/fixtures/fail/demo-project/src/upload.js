import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const uploadDir = 'uploads';

/** 附件按上传日期分目录落盘，路径写回 attachments 表 */
export async function saveUpload(memberId, file, meta) {
  const day = new Date().toISOString().slice(0, 10);
  const dir = join(uploadDir, day);
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `${Date.now()}-${file.originalname}`);
  writeFileSync(target, file.buffer ?? Buffer.alloc(0));

  const { db } = await import('./db.js');
  db.prepare('INSERT INTO attachments (member_id, path, created_at) VALUES (?, ?, ?)')
    .run(memberId, target, new Date().toISOString());

  return { memberId, path: target, size: file.size, ...meta };
}
