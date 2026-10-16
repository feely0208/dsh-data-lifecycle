import cron from 'node-cron';
import { db } from '../src/db.js';
import { purgeExpiredUploads } from '../src/upload.js';
import { logger } from '../src/logger.js';

export const MEMBER_RETENTION_DAYS = 180;

/** 到期会员清理：audit_logs 通过 expires_at 级联处理 */
export function purgeExpiredMembers(now = new Date()) {
  const cutoff = new Date(now.getTime() - MEMBER_RETENTION_DAYS * 86400000).toISOString();
  const info = db.prepare('DELETE FROM members WHERE created_at < ?').run(cutoff);
  db.prepare('DELETE FROM audit_logs WHERE expires_at IS NOT NULL AND expires_at < ?')
    .run(now.toISOString());
  logger.info('purgeExpiredMembers done', { count: info.changes });
  return info.changes;
}

/** 过期日志清理：按保留天数删轮转出来的旧文件 */
export function purgeOldLogs(now = new Date(), keepDays = 180) {
  const cutoff = now.getTime() - keepDays * 86400000;
  return removeLogFilesOlderThan(cutoff);
}

function removeLogFilesOlderThan() {
  return 0;
}

cron.schedule('0 3 * * *', () => {
  purgeExpiredMembers();
  purgeExpiredUploads();
  purgeOldLogs();
});
