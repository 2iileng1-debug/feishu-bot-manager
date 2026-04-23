---
name: feishu-bot-manager
description: 安全地新增或更新 OpenClaw 飞书机器人账户，并在读取 app-id/app-secret 前执行 Agent 创建前置流程（直接创建或先梳理需求多轮提问），自动注入治理与记忆基线。
user-invokable: true
invocations:
  - words:
      - 添加飞书机器人
      - 配置飞书机器人
      - 新增飞书账户
      - 添加机器人账户
      - feishu bot
      - 飞书多账户
      - 创建agent并接入飞书
    description: 先创建/梳理 Agent，再接入飞书机器人
---

# feishu-bot-manager

跨平台（Windows/macOS/Linux）飞书多账户接入工具，默认安全模式。

## 前置工作流（在读取 app-id/app-secret 之前）

### 工作流 1：Agent 创建方式选择

当用户提出“创建 Agent”时，先问：
1. 直接创建 Agent
2. 先梳理 Agent 工作内容

如果选“直接创建”：
- 按用户当前需求直接创建 Agent。

如果选“先梳理工作内容”：
- 用多轮提问澄清目标、输入、输出、边界、工具、节奏；
- 直到你判断信息足够，或用户明确说“可以了”；
- 再创建 Agent。

### 工作流 2：创建 Agent 时的默认治理与记忆基线

创建完成后自动写入以下基线：
1. 灵魂/身份写入确认闸门（SOUL.md / IDENTITY.md）
2. 在进化规则源头写入“禁止只口头不执行”
3. 默认治理规则：治理文件修改必须确认
4. Skill 文档与示例配置同步更新
5. 防失忆基线：每日记忆 `memory/YYYY-MM-DD.md` + 长期记忆 `MEMORY.md`

### 工作流 3：输出飞书创建链接并等待凭据

向用户输出：
https://open.feishu.cn/page/openclaw?form=multiAgent

等待用户输入：
- `--app-id`
- `--app-secret`

然后再执行飞书账户写入与路由绑定。

## 路由模式

### account（账户级）
该飞书账户所有消息 -> 指定 Agent

### group（群聊级）
指定群聊消息 -> 指定 Agent

## 安全机制

1. 写入前自动备份 `openclaw.json`
2. 本地校验 + `openclaw config validate --json`
3. 校验失败阻止写入
4. 默认不自动重启 Gateway（需显式 `--restart`）
5. 提供 `--agent-id` 时自动给该 Agent 注入 Feishu outbound 基线（工具 allowlist + TOOLS.md runbook）

## 命令示例

```bash
# 推荐：全交互前置流程（会先走 Agent 创建与需求澄清）
node index.js

# 直接参数模式（不走前置问答）
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-sales \
  --agent-id recruiter \
  --routing-mode account \
  --dry-run

# 隔离 profile 测试
node index.js --openclaw-profile test --wizard true
```

## 参数

| 参数 | 说明 |
|---|---|
| `--app-id` | 飞书 App ID（`cli_xxx`） |
| `--app-secret` | 飞书 App Secret |
| `--account-id` | 账户 ID（默认自动生成） |
| `--bot-name` | 机器人名（写入 `name` 字段） |
| `--dm-policy` | `open (fixed)` |
| `--agent-id` | 绑定的 Agent ID |
| `--routing-mode` | `account/group` |
| `--chat-id` | 群聊 ID（`group` 模式必填） |
| `--dry-run` | 仅校验，不写入 |
| `--set-dm-scope` | 写入后设置 `session.dmScope` |
| `--restart` | 写入后自动重启 Gateway |
| `--wizard` | 无凭据时是否启用交互前置流程（默认启用） |
| `--openclaw-profile` | 可选 profile（便于隔离测试） |
