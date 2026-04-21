# feishu-bot-manager

瀹夊叏鍦版柊澧炴垨鏇存柊 OpenClaw 椋炰功鏈哄櫒浜鸿处鎴凤紝骞跺湪璇诲彇 `app-id/app-secret` 涔嬪墠鎵ц Agent 鍒涘缓鍓嶇疆娴佺▼锛堢洿鎺ュ垱寤?/ 鍏堟⒊鐞嗛渶姹傦級锛岃嚜鍔ㄦ敞鍏ユ不鐞嗕笌璁板繂鍩虹嚎銆?

> 褰撳墠寤鸿浠撳簱鍚嶏細`feishu-bot-manager`

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

---

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

---

## 椤圭洰缁撴瀯

```text
.
鈹溾攢鈹€ README.md
鈹斺攢鈹€ feishu-bot-manager/
    鈹溾攢鈹€ README.md
    鈹溾攢鈹€ SKILL.md
    鈹溾攢鈹€ index.js
    鈹溾攢鈹€ package.json
    鈹斺攢鈹€ lib/
        鈹斺攢鈹€ validator.js
```

### 鏂囦欢璇存槑

- `feishu-bot-manager/index.js`
  - 涓绘祦绋嬪叆鍙?
  - 鍙傛暟瑙ｆ瀽
  - 浜や簰鍚戝
  - 閰嶇疆鍐欏叆
  - 澶囦唤涓庢牎楠?

- `feishu-bot-manager/lib/validator.js`
  - App ID / Account ID / Chat ID / Agent ID 绛夋牎楠?
  - Feishu 缁戝畾涓庨厤缃璞℃牎楠?

- `feishu-bot-manager/SKILL.md`
  - Skill 鍏冧俊鎭?
  - 瑙﹀彂璇?
  - 浣跨敤璇存槑

---

## 杩愯瑕佹眰

- Node.js 18+
- 宸插畨瑁呭苟鍙墽琛?`openclaw`
- 褰撳墠鐜鑳借闂湰鏈?OpenClaw 閰嶇疆
- 鑻ラ渶鍐欏叆鐪熷疄閰嶇疆锛岄渶鏈夊搴旀枃浠舵潈闄?

鍙€変絾鎺ㄨ崘锛?

- 宸插畬鎴?OpenClaw 鍩虹鍒濆鍖?
- 宸插叿澶囬涔﹀簲鐢ㄥ嚟鎹紙App ID / App Secret锛?

---

## 蹇€熷紑濮?

### 鏂瑰紡 1锛氬叏浜や簰寮曞锛堟帹鑽愶級

```bash
cd feishu-bot-manager
node index.js
```

閫傜敤浜庯細
- 杩樻病鍑嗗濂介涔﹀嚟鎹?
- 鎯冲厛鍒涘缓 Agent锛屽啀鎺ュ叆椋炰功
- 鎯宠蛋瀹屾暣瀹夊叏娴佺▼

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

閫傜敤浜庯細
- 宸茬粡鏈夐涔﹀嚟鎹?
- 鍙兂蹇€熼獙璇佸啓鍏ョ粨鏋?

---

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

---

## 浣跨敤绀轰緥

### 1. 璐︽埛绾ц矾鐢?

```bash
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-recruiter \
  --agent-id recruiter \
  --routing-mode account
```

### 2. 缇よ亰绾ц矾鐢?

```bash
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-ops \
  --agent-id ops-agent \
  --routing-mode group \
  --chat-id oc_xxx
```

### 3. 鍙仛鏍￠獙锛屼笉钀界洏

```bash
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --agent-id recruiter \
  --dry-run
```

---

## 瀹夊叏鏈哄埗

鏈」鐩粯璁ゅ亸淇濆畧锛?

1. **鍐欏叆鍓嶅厛澶囦唤閰嶇疆**
2. **鏈湴鏍￠獙澶辫触鐩存帴闃绘柇**
3. **OpenClaw schema 鏍￠獙澶辫触鐩存帴闃绘柇**
4. **榛樿涓嶈嚜鍔ㄩ噸鍚?Gateway**
5. **杈撳嚭鍥炴粴鍛戒护**锛屾柟渚垮揩閫熸仮澶?

---

## 褰撳墠妫€鏌ョ粨璁?

### 宸茬‘璁ゆ甯?

- `index.js` 鑳介€氳繃 `node --check`
- `lib/validator.js` 鑳介€氳繃 `node --check`
- `node index.js --help` 鍙甯歌緭鍑哄府鍔╀俊鎭?
- 椤圭洰缁撴瀯娓呮櫚锛岃亴璐ｅ熀鏈垎绂?

### 褰撳墠瀛樺湪鐨勬敼杩涚偣

1. **浠撳簱鍚嶅師鍏堜笉鍚堢悊**
   - 鍘熶粨搴撳悕涓?`-`
   - 寤鸿鏀逛负 `feishu-bot-manager`

2. **鏍?README 杩樺彲浠ユ洿鑱氱劍**
   - 寤鸿鏄庣‘瀹夎銆佷緷璧栥€佹祦绋嬨€侀敊璇鐞嗐€佸洖婊氳鏄?

3. **缂哄皯娴嬭瘯**
   - 鐩墠鍙湁璇硶妫€鏌?
   - 寤鸿琛ユ渶灏?smoke test / validator test

4. **缂哄皯 License**
   - 濡傛灉鍚庣画瑕佸彂甯冩垨鍏变韩锛屽缓璁ˉ涓?

5. **缂哄皯 CI**
   - 寤鸿鑷冲皯澧炲姞 Node syntax check 鎴栧熀鏈祴璇曞伐浣滄祦

---

## 寤鸿鐨勪笅涓€姝?

### 鏈€浣庝紭鍏堢骇鏀硅繘

- 鏀逛粨搴撳悕涓?`feishu-bot-manager`
- 浣跨敤鏈?README 鏇挎崲鎴栭噸鍐欐牴 README
- 澧炲姞 `LICENSE`
- 澧炲姞 `.gitignore`

### 涓紭鍏堢骇鏀硅繘

- 澧炲姞 `tests/validator.test.js`
- 澧炲姞 CI锛堝 GitHub Actions锛?
- 涓哄け璐ュ満鏅ˉ鏇存竻鏅扮殑閿欒鎻愮ず

### 楂樹紭鍏堢骇鏀硅繘

- 鎷嗗垎 `index.js`锛屾妸浜や簰娴佺▼ / 閰嶇疆鍐欏叆 / 鏂囦欢娌荤悊閫昏緫鍒嗘ā鍧?
- 涓洪厤缃啓鍏ユ祦绋嬪鍔犲彲妯℃嫙娴嬭瘯
- 澧炲姞 dry-run 杈撳嚭 diff 鑳藉姏

---

## 鎺ㄨ崘鍙戝竷鍓嶆鏌ユ竻鍗?

- [ ] 浠撳簱鍚嶅凡鏇存柊
- [ ] README 宸插悓姝?
- [ ] SKILL.md 涓?README 涓€鑷?
- [ ] 鍙傛暟璇存槑瀹屾暣
- [ ] 鑷冲皯鏈夊熀纭€娴嬭瘯
- [ ] 鏈?License
- [ ] 宸查獙璇?dry-run / real-write / rollback 璺緞

---

## 澶囨敞

濡傛灉浣犲噯澶囩户缁淮鎶よ繖涓」鐩紝寤鸿涓嬩竴鐗堟妸瀹冧粠鈥滃崟鑴氭湰宸ュ叿鈥濆崌绾т负鈥滃彲娴嬭瘯鐨勫皬鍨?CLI 椤圭洰鈥濓紝鍚庣画鍙淮鎶ゆ€т細鏄庢樉鏇村ソ銆?


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
