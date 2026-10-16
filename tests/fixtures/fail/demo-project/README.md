# member-hub-api

会员中心的后端服务：账号注册、资料维护、附件上传、操作审计。

## 快速开始

```bash
npm install
npm run migrate     # 建表
npm start           # 默认监听 :3000
```

## 数据放在哪

| 数据 | 位置 | 说明 |
| --- | --- | --- |
| 会员资料 | `data/member-hub.db` · `members` | SQLite，表结构见 `migrations/` |
| 附件 | `uploads/`（按日期分目录） | 通过 `POST /api/members/:id/attachments` 上传 |
| 运行日志 | `logs/app.log` | winston 写入，按大小切割 |
| 操作审计 | `audit_logs` | 每次创建 / 修改都记一条 |

## 接口

- `POST /api/members` 创建会员
- `PUT /api/members/:id` 修改资料
- `POST /api/members/:id/attachments` 上传附件
- `GET /api/members` 分页查询

## 运维

- `npm run migrate` 建表并写入套餐基础数据
- `npm run report` 手动跑一次日报（线上由 `jobs/nightly-report.js` 每日调度）
