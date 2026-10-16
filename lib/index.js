import { createPlugin, pkgRootFrom } from '@deepwhale-cn/dsh-guard-core/plugin';

export const { name, inject, apply } = createPlugin({
  name: 'data-lifecycle',
  pkgRoot: pkgRootFrom(import.meta.url),
  skillFile: 'skill/data-lifecycle.md',
  binFile: 'bin/cli.mjs',
  description: '数据留存期限与过期清理：查「说不清留多久」「留太久」「只写不删」',
  whenToUse: '当你想确认数据是不是留太久了、该删的有没有删时使用。项目里用了数据库 / 日志文件 / 上传目录，却说不清各类数据的留存期限；或者要检查有没有到期清理任务。用户会说：「数据留存多久」「留存期限」「有没有过期清理」「该删的删了吗」「数据生命周期」「数据是不是一直躺着」。与 dsh-cn-log-retention 的分界：那个查日志留存够不够 6 个月，这个查留得太久 / 该删没删。',
});
