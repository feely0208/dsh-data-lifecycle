# @deepwhale-cn/dsh-data-lifecycle

**数据不该永远躺着 —— 该删的，删了没。**

**关键词**：数据留存 · 留存期限 · 过期清理 · 数据生命周期 · 该删没删 · 主动删除 · 最短必要 · 日志轮转 · 到期删除

---

## 先说清楚它是什么、不是什么

**是**：静态检查一个项目在「数据留存」这件事上的三处空白 ——
① **说不清留多久**：有数据库 / 日志文件 / 上传目录，却没有一处写明留存期限；
② **留太久**：期限被写成 3 年以上（1095 天 / 36 个月）；
③ **只写不删**：代码里全是 `INSERT` / 上传 / 落盘，找不到任何过期清理路径。

**不是**：
- ❌ **不是运行时清理工具** —— 它不删你的数据，只告诉你「清理这条路好像不存在」
- ❌ **不是数据分类分级** —— 那是 `dsh-data-classify` 的活（哪些数据是敏感级、有没有台账）
- ❌ **不是「日志留存够不够 6 个月」** —— 那是 `dsh-cn-log-retention` 的活（见下方分界）
- ❌ **不是用户行使删除权** —— 那是 `dsh-data-rights` 的活（用户点「注销」时删不删得掉）
- ❌ **不下「合规 / 违规」的结论** —— 只描述代码与配置里的事实，判断留给你

**一句话分界**：**`dsh-cn-log-retention` 查「留够没」，这个查「留太久 / 该删没删」。**

```
dsh-cn-log-retention  = 日志留存够不够 6 个月（法定下限，网络安全法第 21 条）
dsh-data-lifecycle    = 各类数据留多久、到期有没有人删（个保法第 19 / 47 条）
dsh-data-classify     = 数据分没分级、有没有台账
dsh-data-rights       = 用户来要求删除时，删不删得掉
dsh-pipia             = 影响评估报告本身要不要留三年（个保法第 56 条）
```

---

## 它查什么（5 条）

| 规则 | 查什么 | 级别 |
|---|---|---|
| `LIFE-NO-RETENTION-POLICY` | 有数据落地，却找不到任何成文的留存期限规定 | 🔴 |
| `LIFE-RETENTION-TOO-LONG` | 留存期限写成 3 年以上 / 1095 天以上（`expireAfterDays: 3650` 这类也算） | 🔴 |
| `LIFE-WRITE-NO-PURGE` | 有写入路径，整份代码里找不到清理 / 过期删除实现 | 🔴 |
| `LIFE-SCHEDULE-NO-CLEANUP` | 有定时任务，但任务里没有一个是清理 | 🟡 |
| `LIFE-SCHEMA-NO-EXPIRY-FIELD` | 建表 / 模型里没有 `expires_at` / `deleted_at` 这类字段 | 🔵（弱信号） |

**每条都会给出：哪个文件、第几行、那行长什么样、依据是哪一条法规。**

前三条规则都带「适用前提」（`when`）：项目里得先有数据落地的痕迹（数据库、日志、上传目录），规则才会跑 ——
纯前端、纯工具库的项目不会被它们打扰。

---

## 安装

```bash
dsh plugin --profile web add @deepwhale-cn/dsh-data-lifecycle
```

## 用法

```bash
# 扫当前项目
dsh-data-lifecycle

# 扫指定目录
dsh-data-lifecycle --root /path/to/project

# 看内置演示（一个「只往库里写、从不删、也没写留存期限」的会员中心）
dsh-data-lifecycle --demo

# 列出规则与依据
dsh-data-lifecycle --list-rules

# 出 HTML 报告
dsh-data-lifecycle --root /path/to/project --html report.html
```

---

## 一个真实的例子

`--demo` 里那个会员中心，看起来是个正常项目：有 `package.json`、有表结构、有上传接口、有日志、还有每日定时任务。

它的问题不在「有没有写代码」，而在「没人负责让数据消失」：

```
🔴 11 个文件里找不到任何一处写明的留存期限（README / 配置 / 代码都没有）
🔴 src/media/expiry.js:3   expireAfterDays: 3650        ← 附件留 10 年
🔴 有 INSERT / writeFileSync / 上传落盘，但没有一处 purge / 过期删除
🟡 jobs/nightly-report.js 有 cron 定时任务，报的是日报，不是清理
🔵 migrations/*.sql 建了 3 张表，没有 expires_at / deleted_at
```

对照的干净样本（`tests/fixtures/pass/clean-project/`）长这样：README 里有一张留存期限表，
`config/retention.yml` 里写死 180 / 90 天，`jobs/purge-expired.js` 每日 03:00 清理，表里有 `expires_at` —— **0 命中**。

---

## 边界（它做不到什么）

- **只做静态检查** —— 清理做在部署层（对象存储生命周期规则、数据库分区、DBA 手工脚本）时，它看不见，会照样提示你确认
- **只认常见写法** —— 抓的是 `retention` / `expire` / `purge` / `cleanup` 这类命名；自创命名（比如 `sweep()`）可能漏掉
- **不看运行时** —— 数据实际删了没有、备份里还有没有，只有你自己的流程知道
- **报出来是提示确认，不是判定违规** —— 长期保存可能有法律依据，请在文档里写明
- **依据是法条与标准的原文条款** —— 每条规则的 `source` 都指得到具体条款，可自行核对

---

## License

MIT © 深鲸 DeepWhale
