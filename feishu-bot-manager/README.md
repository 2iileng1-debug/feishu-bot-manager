# feishu-bot-manager

璺ㄥ钩鍙帮紙Windows/macOS/Linux锛夐涔︽満鍣ㄤ汉鎺ュ叆涓?Agent 璺敱绠＄悊鑴氭湰锛岀敤浜?*瀹夊叏鏂板鎴栨洿鏂?OpenClaw 椋炰功鏈哄櫒浜鸿处鎴?*锛屽苟鍦ㄧ湡姝ｈ鍙?`--app-id` / `--app-secret` 涔嬪墠瀹屾垚 Agent 鍒涘缓鍓嶇疆娴佺▼銆佹不鐞嗘敞鍏ヤ笌璁板繂鍩虹嚎鍒濆鍖栥€?

## 褰撳墠鐘舵€?

椤圭洰褰撳墠宸插畬鎴愶細

- GitHub 浠撳簱宸茬ǔ瀹氫娇鐢?`feishu-bot-manager`
- `main` 鍒嗘敮涓?`v1.2.1` tag 宸茶惤鍒拌繙绔?
- 宸茶ˉ榻愭祴璇曚笌鍙戝竷璇存槑
- 宸插畬鎴愬杞?*浣庨闄╂ā鍧楀寲閲嶆瀯**锛屽叆鍙ｆ枃浠朵粠澶у潡娣峰悎閫昏緫閫愭鏀舵暃涓轰富娴佺▼ orchestrator

鏈浠撳簱鏀跺熬宸茶ˉ榻愶細

- `LICENSE`锛圡IT锛?
- GitHub Actions CI锛坧ush / pull_request 鑷姩璺?`npm run verify`锛?

璇存槑锛?
- 鑻?GitHub Release 椤甸潰灏氭湭鍒涘缓锛屽彲鍦ㄥ凡鏈?`v1.2.1` tag 鍩虹涓婅ˉ寤?Release
- README 鐜板湪涓庝粨搴撶湡瀹炵姸鎬佷繚鎸佷竴鑷?

## 浣犱細寰楀埌浠€涔?

### 1. 鎺ュ叆鍓嶇疆宸ヤ綔娴?
- 鍦ㄨ鍙?`--app-id` / `--app-secret` 鍓嶏紝鍏堝鐞?Agent 鍒涘缓
- 鍒涘缓鏂瑰紡浜岄€変竴锛?
  - 鐩存帴鍒涘缓 Agent
  - 鍏堝杞⒊鐞嗛渶姹傦紝鍐嶅垱寤?Agent

### 2. 鑷姩娌荤悊娉ㄥ叆
- SOUL / IDENTITY 鍐欏叆纭闂搁棬
- 鈥滅姝㈠彧鍙ｅご涓嶆墽琛屸€濊鍒欐敞鍏?
- 娌荤悊鏂囦欢淇敼纭鏈哄埗
- Skill 鏂囨。涓庣ず渚嬮厤缃悓姝ョ害鏉?

### 3. 璁板繂鍩虹嚎
- 姣忔棩璁板繂鏂囦欢锛歚memory/YYYY-MM-DD.md`
- 闀挎湡璁板繂鏂囦欢锛歚MEMORY.md`

### 4. 椋炰功閰嶇疆瀹夊叏鍐欏叆
- 鍐欏叆鍓嶅浠?`openclaw.json`
- 鏈湴鏍￠獙 + `openclaw config validate --json`
- 榛樿涓嶈嚜鍔ㄩ噸鍚?Gateway锛坄--restart` 鎵嶉噸鍚級
- 杈撳嚭 rollback 鍛戒护锛屼究浜庡揩閫熸仮澶?

## 鍙傛暟

- `--app-id` 椋炰功 App ID锛坄cli_xxx`锛?
- `--app-secret` 椋炰功 App Secret
- `--account-id` 璐︽埛 ID锛堥粯璁よ嚜鍔ㄧ敓鎴愶級
- `--bot-name` 鏈哄櫒浜哄悕
- `--agent-id` 璺敱缁戝畾 Agent
- `--routing-mode` `account/group`
- `--chat-id` 缇よ亰 ID锛坄group` 妯″紡蹇呭～锛?
- `--dry-run` 浠呮牎楠屼笉鍐欏叆
- `--set-dm-scope` 鍐欏叆鍚庤缃?`session.dmScope`
- `--restart` 鍐欏叆鍚庨噸鍚?Gateway
- `--wizard` 鏃犲嚟鎹椂鍚敤浜や簰鍓嶇疆娴佺▼锛堥粯璁?true锛?
- `--openclaw-profile` 鎸囧畾 OpenClaw profile

## 绀轰緥

```bash
# 鎺ㄨ崘锛氬叏浜や簰鍓嶇疆娴佺▼
node index.js

# 鍙傛暟妯″紡 + dry-run
node index.js --app-id cli_xxx --app-secret yyy --agent-id recruiter --routing-mode account --dry-run
```

## 妯″潡缁撴瀯

```text
lib/
鈹溾攢鈹€ agent-plan.js
鈹溾攢鈹€ cli-helpers.js
鈹溾攢鈹€ config-apply.js
鈹溾攢鈹€ config-store.js
鈹溾攢鈹€ config-workflow.js
鈹溾攢鈹€ main-flow.js
鈹溾攢鈹€ openclaw-runtime.js
鈹溾攢鈹€ output.js
鈹溾攢鈹€ quick-mode.js
鈹溾攢鈹€ validator.js
鈹溾攢鈹€ wizard.js
鈹斺攢鈹€ workspace-bootstrap.js
```

## 娴嬭瘯

褰撳墠娴嬭瘯瑕嗙洊浠ヤ笅妯″潡锛?

- `validator`
- `cli-helpers`
- `output`
- `quick-mode`
- `agent-plan`
- `config-apply`
- `main-flow`

甯哥敤鍛戒护锛?

```bash
npm test
npm run check
npm run verify
```

CI 浼氬湪 `push` 鍜?`pull_request` 鏃惰嚜鍔ㄦ墽琛?`npm run verify`銆?

## 鏂囦欢璇存槑

- `index.js` 涓绘祦绋嬪叆鍙ｏ紙褰撳墠涓昏璐熻矗 orchestrator 缂栨帓锛?
- `lib/validator.js` 鍙傛暟/閰嶇疆鏍￠獙
- `lib/wizard.js` 鍓嶇疆浜や簰鍚戝
- `lib/config-workflow.js` 椋炰功閰嶇疆鏋勫缓涓?summary 杈撳嚭
- `lib/config-apply.js` 閰嶇疆搴旂敤銆佹牎楠屻€佹敹灏惧姩浣?
- `SKILL.md` Skill 鍏冧俊鎭笌瑙﹀彂鎻忚堪


---

## 赞赏渠道

如果这个项目对你有帮助，欢迎赞赏支持：
说明：仅用于请咖啡赞赏，不作为商务收款渠道。

<p align="center">
  <img src="../assets/donation/alipay.jpg" alt="支付宝赞赏码" width="260" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="../assets/donation/wechat.jpg" alt="微信赞赏码" width="260" />
</p>

<p align="center">
  支付宝 &nbsp;&nbsp;|&nbsp;&nbsp; 微信支付
</p>
