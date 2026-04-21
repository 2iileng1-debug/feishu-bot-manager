---
name: feishu-bot-manager
description: 瀹夊叏鍦版柊澧炴垨鏇存柊 OpenClaw 椋炰功鏈哄櫒浜鸿处鎴凤紝骞跺湪璇诲彇 app-id/app-secret 鍓嶆墽琛?Agent 鍒涘缓鍓嶇疆娴佺▼锛堢洿鎺ュ垱寤烘垨鍏堟⒊鐞嗛渶姹傚杞彁闂級锛岃嚜鍔ㄦ敞鍏ユ不鐞嗕笌璁板繂鍩虹嚎銆?
user-invokable: true
invocations:
  - words:
      - 娣诲姞椋炰功鏈哄櫒浜?
      - 閰嶇疆椋炰功鏈哄櫒浜?
      - 鏂板椋炰功璐︽埛
      - 娣诲姞鏈哄櫒浜鸿处鎴?
      - feishu bot
      - 椋炰功澶氳处鎴?
      - 鍒涘缓agent骞舵帴鍏ラ涔?
    description: 鍏堝垱寤?姊崇悊 Agent锛屽啀鎺ュ叆椋炰功鏈哄櫒浜?
---

# feishu-bot-manager

璺ㄥ钩鍙帮紙Windows/macOS/Linux锛夐涔﹀璐︽埛鎺ュ叆宸ュ叿锛岄粯璁ゅ畨鍏ㄦā寮忋€?

## 鍓嶇疆宸ヤ綔娴侊紙鍦ㄨ鍙?app-id/app-secret 涔嬪墠锛?

### 宸ヤ綔娴?1锛欰gent 鍒涘缓鏂瑰紡閫夋嫨

褰撶敤鎴锋彁鍑衡€滃垱寤?Agent鈥濇椂锛屽厛闂細
1. 鐩存帴鍒涘缓 Agent
2. 鍏堟⒊鐞?Agent 宸ヤ綔鍐呭

濡傛灉閫夆€滅洿鎺ュ垱寤衡€濓細
- 鎸夌敤鎴峰綋鍓嶉渶姹傜洿鎺ュ垱寤?Agent銆?

濡傛灉閫夆€滃厛姊崇悊宸ヤ綔鍐呭鈥濓細
- 鐢ㄥ杞彁闂緞娓呯洰鏍囥€佽緭鍏ャ€佽緭鍑恒€佽竟鐣屻€佸伐鍏枫€佽妭濂忥紱
- 鐩村埌浣犲垽鏂俊鎭冻澶燂紝鎴栫敤鎴锋槑纭鈥滃彲浠ヤ簡鈥濓紱
- 鍐嶅垱寤?Agent銆?

### 宸ヤ綔娴?2锛氬垱寤?Agent 鏃剁殑榛樿娌荤悊涓庤蹇嗗熀绾?

鍒涘缓瀹屾垚鍚庤嚜鍔ㄥ啓鍏ヤ互涓嬪熀绾匡細
1. 鐏甸瓊/韬唤鍐欏叆纭闂搁棬锛圫OUL.md / IDENTITY.md锛?
2. 鍦ㄨ繘鍖栬鍒欐簮澶村啓鍏モ€滅姝㈠彧鍙ｅご涓嶆墽琛屸€?
3. 榛樿娌荤悊瑙勫垯锛氭不鐞嗘枃浠朵慨鏀瑰繀椤荤‘璁?
4. Skill 鏂囨。涓庣ず渚嬮厤缃悓姝ユ洿鏂?
5. 闃插け蹇嗗熀绾匡細姣忔棩璁板繂 `memory/YYYY-MM-DD.md` + 闀挎湡璁板繂 `MEMORY.md`

### 宸ヤ綔娴?3锛氳緭鍑洪涔﹀垱寤洪摼鎺ュ苟绛夊緟鍑嵁

鍚戠敤鎴疯緭鍑猴細
https://open.feishu.cn/page/openclaw?form=multiAgent

绛夊緟鐢ㄦ埛杈撳叆锛?
- `--app-id`
- `--app-secret`

鐒跺悗鍐嶆墽琛岄涔﹁处鎴峰啓鍏ヤ笌璺敱缁戝畾銆?

## 璺敱妯″紡

### account锛堣处鎴风骇锛?
璇ラ涔﹁处鎴锋墍鏈夋秷鎭?-> 鎸囧畾 Agent

### group锛堢兢鑱婄骇锛?
鎸囧畾缇よ亰娑堟伅 -> 鎸囧畾 Agent

## 瀹夊叏鏈哄埗

1. 鍐欏叆鍓嶈嚜鍔ㄥ浠?`openclaw.json`
2. 鏈湴鏍￠獙 + `openclaw config validate --json`
3. 鏍￠獙澶辫触闃绘鍐欏叆
4. 榛樿涓嶈嚜鍔ㄩ噸鍚?Gateway锛堥渶鏄惧紡 `--restart`锛?

## 鍛戒护绀轰緥

```bash
# 鎺ㄨ崘锛氬叏浜や簰鍓嶇疆娴佺▼锛堜細鍏堣蛋 Agent 鍒涘缓涓庨渶姹傛緞娓咃級
node index.js

# 鐩存帴鍙傛暟妯″紡锛堜笉璧板墠缃棶绛旓級
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-sales \
  --agent-id recruiter \
  --routing-mode account \
  --dry-run

# 闅旂 profile 娴嬭瘯
node index.js --openclaw-profile test --wizard true
```

## 鍙傛暟

| 鍙傛暟 | 璇存槑 |
|---|---|
| `--app-id` | 椋炰功 App ID锛坄cli_xxx`锛?|
| `--app-secret` | 椋炰功 App Secret |
| `--account-id` | 璐︽埛 ID锛堥粯璁よ嚜鍔ㄧ敓鎴愶級 |
| `--bot-name` | 鏈哄櫒浜哄悕锛堝啓鍏?`name` 瀛楁锛?|
| `--dm-policy` | `open (fixed)` |
| `--agent-id` | 缁戝畾鐨?Agent ID |
| `--routing-mode` | `account/group` |
| `--chat-id` | 缇よ亰 ID锛坄group` 妯″紡蹇呭～锛?|
| `--dry-run` | 浠呮牎楠岋紝涓嶅啓鍏?|
| `--set-dm-scope` | 鍐欏叆鍚庤缃?`session.dmScope` |
| `--restart` | 鍐欏叆鍚庤嚜鍔ㄩ噸鍚?Gateway |
| `--wizard` | 鏃犲嚟鎹椂鏄惁鍚敤浜や簰鍓嶇疆娴佺▼锛堥粯璁ゅ惎鐢級 |
| `--openclaw-profile` | 鍙€?profile锛堜究浜庨殧绂绘祴璇曪級 |

