import cron from 'node-cron';
import { db } from '../src/db.js';
import { logger } from '../src/logger.js';

/** 每天把新增会员数汇总成一条日报，写进日志供运维查看 */
export function sendDailyReport() {
  const rows = db
    .prepare('SELECT date(created_at) AS day, count(*) AS n FROM members GROUP BY day')
    .all();
  logger.info('daily member report', { rows });
  return rows;
}

cron.schedule('0 2 * * *', () => {
  try {
    sendDailyReport();
  } catch (err) {
    logger.error('daily report failed', { err: String(err) });
  }
});
