# member-hub-api

会员中心的后端服务：账号注册、资料维护、附件上传、操作审计。

## 数据留存期限

按「实现处理目的所必要的最短时间」设定（《个人信息保护法》第十九条），到期主动删除（第四十七条）。

| 数据 | 位置 | 留存期限 | 到期处理 |
| --- | --- | --- | --- |
| 会员资料 | `data/member-hub.db` · `members` | 180 天 | 每日 03:00 执行 `purgeExpiredMembers()` |
| 附件 | `uploads/` + 对象存储 | 90 天 | 每日 03:00 执行 `purgeExpiredUploads()` + 存储桶生命周期规则 |
| 运行日志 | `logs/app.log` | 180 天 | 日志轮转 + `purgeOldLogs()` |
| 操作审计 | `audit_logs` | 180 天 | 随会员资料一并清理 |

详细的期限依据与调整流程见 `docs/data-retention.md`，可机读的配置在 `config/retention.yml`。

## 接口

- `POST /api/members` 创建会员
- `PUT /api/members/:id` 修改资料
- `POST /api/members/:id/attachments` 上传附件
- `GET /api/members` 分页查询

## 运维

- `npm run migrate` 建表
- `npm run purge` 手动跑一次过期清理（线上由 `jobs/purge-expired.js` 每日调度）
