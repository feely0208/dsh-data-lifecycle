#!/bin/bash
# 双向验证：正例必须报，反例必须不报（误报是安全工具的头号杀手）
set -uo pipefail
export PATH="/usr/local/bin:$PATH"
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo ""; echo "  @deepwhale-cn/dsh-data-lifecycle · 双向验证"
echo "  ────────────────────────────────────────────────"

J=$(node bin/cli.mjs --root tests/fixtures/fail/demo-project --json 2>&1)
echo ""; echo "  【正例】只往库里写、从不清理、也没有留存期限的会员中心（5 条都要报）"
for rid in LIFE-NO-RETENTION-POLICY LIFE-RETENTION-TOO-LONG LIFE-WRITE-NO-PURGE LIFE-SCHEDULE-NO-CLEANUP LIFE-SCHEMA-NO-EXPIRY-FIELD; do
  c=$(echo "$J" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    print(len([f for f in d.get('findings',[]) if f.get('ruleId')=='$rid']))
except Exception: print(0)" 2>/dev/null)
  [ "${c:-0}" -gt 0 ] && ok "$rid 报出（$c 处）" || bad "$rid 未报出"
done

echo ""; echo "  【反例】有完整留存策略 + 清理任务的项目（必须 0 命中 —— 误报是头号杀手）"
M=$(node bin/cli.mjs --root tests/fixtures/pass/clean-project --quiet 2>&1 | grep -oE '^[0-9]+' | head -1)
[ "${M:-1}" = "0" ] && ok "干净样本 0 命中" || bad "误报 ${M} 条"

echo ""; echo "  【溯源】每条规则必须带 source，且指得到法条 / 标准"
python3 - <<'PY' && ok "全部规则均有 source 且能指到出处" || bad "有规则缺 source / 出处"
import json, glob, sys
for f in glob.glob('rules/*.json'):
    r = json.load(open(f, encoding='utf-8')); s = r.get('source', '')
    if not s:
        print('缺 source:', r.get('id'), file=sys.stderr); sys.exit(1)
    if not any(k in s for k in ('第十九条', '第二十一条', '第四十七条', '第五十一条', '第五十条', '第十六条', '法律', '标准', 'GB')):
        print('出处不可查:', r.get('id'), file=sys.stderr); sys.exit(1)
PY

echo ""; echo "  【纪律】规则标题只描述事实，不对被扫对象下「安全 / 违规」结论"
BADTITLE=$(python3 - <<'PYB'
import json, glob, sys
VERDICT = ('违规', '违法', '不安全', '有问题', '风险很高')
for f in glob.glob('rules/*.json'):
    t = json.load(open(f, encoding='utf-8')).get('title', '')
    if any(w in t for w in VERDICT):
        print(t); sys.exit(0)
PYB
)
if [ -n "$BADTITLE" ]; then bad "规则标题出现定性措辞：$BADTITLE"; else ok "规则标题只描述事实，不下结论"; fi

echo ""; echo "  【边界】与 dsh-cn-log-retention 不重叠 —— 同一份样本，两边报的不是同一件事"
if [ -f ../dsh-cn-log-retention/bin/cli.mjs ]; then
  # 方向一：日志留存插件跑我的正例（里面没有任何短于 6 个月的日志期限）→ 应为 0 命中
  L=$(node ../dsh-cn-log-retention/bin/cli.mjs --root tests/fixtures/fail/demo-project --json 2>&1 | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin); print(len(d.get('findings',[])))
except Exception: print(-1)" 2>/dev/null)
  [ "${L:-1}" = "0" ] && ok "log-retention 在「留太久 / 该删没删」的样本上 0 命中（它不查这些）" || bad "log-retention 命中 ${L} 条 —— 边界可能重叠，需复核"
  # 方向二：我跑日志留存的正例（日志期限被写短）→ 不该报「留太久」
  O=$(node bin/cli.mjs --root ../dsh-cn-log-retention/tests/fixtures/fail/demo-project --json 2>&1 | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    print(len([f for f in d.get('findings',[]) if f.get('ruleId')=='LIFE-RETENTION-TOO-LONG']))
except Exception: print(-1)" 2>/dev/null)
  [ "${O:-1}" = "0" ] && ok "「留太短」样本上我不报「留太久」（阈值不同，各管一头）" || bad "在留太短的样本上误报留太多 ${O} 条"
else
  echo "  ⏭  未找到 ../dsh-cn-log-retention，跳过边界核对"
fi

echo ""; echo "  ────────────────────────────────────────────────"
echo "  通过 $PASS · 失败 $FAIL"; echo ""
[ "$FAIL" -eq 0 ] || exit 1
