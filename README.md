# feishu-bot-manager

瀹夊叏鍦版柊澧炴垨鏇存柊 OpenClaw 椋炰功鏈哄櫒浜鸿处鎴凤紝骞跺湪璇诲彇 `app-id/app-secret` 涔嬪墠鎵ц Agent 鍒涘缓鍓嶇疆娴佺▼锛堢洿鎺ュ垱寤?/ 鍏堟⒊鐞嗛渶姹傦級锛岃嚜鍔ㄦ敞鍏ユ不鐞嗕笌璁板繂鍩虹嚎銆?

> 寤鸿浠撳簱鍚嶏細`feishu-bot-manager`

## 椤圭洰绠€浠?

`feishu-bot-manager` 鏄竴涓潰鍚?OpenClaw 鐨勮剼鏈瀷 Skill锛岀敤鏉ヨВ鍐充袱绫婚棶棰橈細

1. **椋炰功鏈哄櫒浜烘帴鍏?*
   - 鍐欏叆椋炰功澶氳处鎴烽厤缃?
   - 閰嶇疆璐︽埛绾?/ 缇よ亰绾ф秷鎭矾鐢?
   - 鍐欏叆鍓嶈嚜鍔ㄥ仛鏈湴鏍￠獙涓?OpenClaw schema 鏍￠獙

2. **Agent 鍒涘缓鍓嶇疆娴佺▼**
   - 鍦ㄧ湡姝ｈ鍙栭涔﹀嚟鎹墠锛屽厛瀹屾垚 Agent 鍒涘缓娴佺▼
   - 鏀寔涓ょ妯″紡锛?
     - 鐩存帴鍒涘缓 Agent
     - 鍏堝杞⒊鐞嗛渶姹傦紝鍐嶅垱寤?Agent
   - 鑷姩琛ラ綈娌荤悊鍜岃蹇嗗熀绾挎枃浠?

## 椤圭洰缁撴瀯

```text
.
鈹溾攢鈹€ README.md
鈹溾攢鈹€ LICENSE
鈹溾攢鈹€ .gitignore
鈹溾攢鈹€ .github/
鈹?  鈹斺攢鈹€ workflows/
鈹?      鈹斺攢鈹€ ci.yml
鈹斺攢鈹€ feishu-bot-manager/
    鈹溾攢鈹€ README.md
    鈹溾攢鈹€ SKILL.md
    鈹溾攢鈹€ index.js
    鈹溾攢鈹€ package.json
    鈹溾攢鈹€ lib/
    鈹?  鈹斺攢鈹€ validator.js
    鈹斺攢鈹€ test/
        鈹斺攢鈹€ validator.test.js
```

## 鍔熻兘鐗规€?

### 1) 鍓嶇疆宸ヤ綔娴?
褰撶敤鎴疯繕娌℃湁鎻愪緵 `--app-id` / `--app-secret` 鏃讹紝鑴氭湰浼氬厛杩涘叆寮曞娴佺▼锛?

- 閫夋嫨 Agent 鍒涘缓鏂瑰紡
- 鐩存帴鍒涘缓锛屾垨鍏堟⒊鐞嗛渶姹?
- 鑷姩鐢熸垚 Agent 宸ヤ綔鍖哄熀纭€鍐呭
- 杈撳嚭椋炰功鏈哄櫒浜哄垱寤洪摼鎺?
- 绛夊緟鐢ㄦ埛琛ュ厖鍑嵁鍚庣户缁啓閰嶇疆

椋炰功鍒涘缓閾炬帴锛?

```text
https://open.feishu.cn/page/openclaw?form=multiAgent
```

### 2) 椋炰功閰嶇疆瀹夊叏鍐欏叆
鑴氭湰浼氬湪鍐欏叆閰嶇疆鍓嶅仛浠ヤ笅鍔ㄤ綔锛?

- 璇诲彇 `openclaw.json`
- 鑷姩鍒涘缓澶囦唤
- 鏈湴瑙勫垯鏍￠獙
- 璋冪敤 `openclaw config validate --json` 鍋?schema 鏍￠獙
- 鏍￠獙閫氳繃鍚庢墠鍐欏叆

### 3) 璺敱缁戝畾
鏀寔涓ょ璺敱鏂瑰紡锛?

- `account`
  - 涓€涓涔﹁处鎴风殑鎵€鏈夋秷鎭矾鐢卞埌涓€涓?Agent
- `group`
  - 鎸囧畾椋炰功缇よ亰娑堟伅璺敱鍒颁竴涓?Agent

### 4) 娌荤悊涓庤蹇嗗熀绾?
鍦?Agent 鍒涘缓娴佺▼涓彲鑷姩琛ラ綈锛?

- `SOUL.md / IDENTITY.md` 鐩稿叧娌荤悊鍧?
- 鈥滅姝㈠彧鍙ｅご涓嶆墽琛屸€濈害鏉?
- 姣忔棩璁板繂 `memory/YYYY-MM-DD.md`
- 闀挎湡璁板繂 `MEMORY.md`

## 杩愯瑕佹眰

- Node.js 18+
- 宸插畨瑁呭苟鍙墽琛?`openclaw`
- 褰撳墠鐜鑳借闂湰鏈?OpenClaw 閰嶇疆
- 鑻ラ渶鍐欏叆鐪熷疄閰嶇疆锛岄渶鏈夊搴旀枃浠舵潈闄?

## 蹇€熷紑濮?

### 鏂瑰紡 1锛氬叏浜や簰寮曞锛堟帹鑽愶級

```bash
cd feishu-bot-manager
node index.js
```

### 鏂瑰紡 2锛氱洿鎺ュ弬鏁版ā寮?

```bash
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-sales \
  --agent-id recruiter \
  --routing-mode account \
  --dry-run
```

## 鍙傛暟璇存槑

| 鍙傛暟 | 璇存槑 |
|---|---|
| `--app-id` | 椋炰功 App ID锛屾牸寮忓簲涓?`cli_xxx` |
| `--app-secret` | 椋炰功 App Secret |
| `--account-id` | 璐︽埛 ID锛岄粯璁?`bot-鏃堕棿鎴砢 |
| `--bot-name` | 鏈哄櫒浜烘樉绀哄悕 |
| `--dm-policy` | `open (fixed)` |
| `--agent-id` | 缁戝畾鐨?Agent ID |
| `--routing-mode` | `account / group`锛岄粯璁?`account` |
| `--chat-id` | 缇よ亰 ID锛宍group` 妯″紡蹇呭～ |
| `--dry-run` | 浠呮牎楠岋紝涓嶅啓鍏?|
| `--set-dm-scope` | 鍐欏叆鍚庤缃?`session.dmScope` |
| `--restart` | 鍐欏叆鍚庨噸鍚?Gateway |
| `--wizard` | 缂哄皯鍑嵁鏃舵槸鍚﹀惎鐢ㄤ氦浜掑墠缃祦绋?|
| `--openclaw-profile` | 鎸囧畾 OpenClaw profile |

## 甯哥敤鍛戒护

```bash
# 璇硶妫€鏌?
npm run check

# 杩愯娴嬭瘯
npm test

# 瀹屾暣鏍￠獙
npm run verify
```

## 瀹夊叏鏈哄埗

1. 鍐欏叆鍓嶈嚜鍔ㄥ浠介厤缃?
2. 鏈湴鏍￠獙澶辫触鐩存帴闃绘柇
3. OpenClaw schema 鏍￠獙澶辫触鐩存帴闃绘柇
4. 榛樿涓嶈嚜鍔ㄩ噸鍚?Gateway
5. 杈撳嚭鍥炴粴鍛戒护锛屼究浜庡揩閫熸仮澶?

## 褰撳墠鐘舵€?

杩欎釜椤圭洰宸茬粡鍏峰绗竴鐗堝彲鐢ㄦ€э紝閫傚悎缁х画鎵撶（鎴愭寮忓彲鍙戝竷 Skill銆?

寤鸿浼樺厛浜嬮」锛?
- 淇敼浠撳簱鍚嶄负 `feishu-bot-manager`
- 鍚屾 README / SKILL 鏂囨。
- 琛ユ祴璇曚笌 CI
- 鍚庣画鍐嶆媶鍒?`index.js`


---

## 赞赏渠道

如果这个项目对你有帮助，欢迎赞赏支持：
说明：仅用于请咖啡赞赏，不作为商务收款渠道。

<p align="center">
  <img src="./assets/donation/alipay.jpg" alt="支付宝赞赏码" width="260" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./assets/donation/wechat.jpg" alt="微信赞赏码" width="260" />
</p>

<p align="center">
  支付宝 &nbsp;&nbsp;|&nbsp;&nbsp; 微信支付
</p>
