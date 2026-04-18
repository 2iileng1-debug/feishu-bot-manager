# feishu-bot-manager

跨平台（Windows/macOS/Linux）飞书机器人接入与 Agent 路由管理脚本。

## 你会得到什么

1. 接入前置工作流
- 在读取 `--app-id` / `--app-secret` 前，先处理 Agent 创建
- 创建方式二选一：
  - 直接创建 Agent
  - 先多轮梳理需求，再创建 Agent

2. 自动治理注入
- SOUL/IDENTITY 写入确认闸门
- “禁止只口头不执行”规则注入
- 治理文件修改确认机制
- Skill 文档与示例配置同步约束

3. 记忆基线
- 每日记忆文件：`memory/YYYY-MM-DD.md`
- 长期记忆文件：`MEMORY.md`

4. 飞书配置安全写入
- 写入前备份 `openclaw.json`
- 本地校验 + `openclaw config validate --json`
- 默认不自动重启 Gateway（`--restart` 才重启）

## 参数

- `--app-id` 飞书 App ID（`cli_xxx`）
- `--app-secret` 飞书 App Secret
- `--account-id` 账户 ID（默认自动生成）
- `--bot-name` 机器人名
- `--agent-id` 路由绑定 Agent
- `--routing-mode` `account/group`
- `--chat-id` 群聊 ID（`group` 模式必填）
- `--dry-run` 仅校验不写入
- `--set-dm-scope` 写入后设置 `session.dmScope`
- `--restart` 写入后重启 Gateway
- `--wizard` 无凭据时启用交互前置流程（默认 true）
- `--openclaw-profile` 指定 OpenClaw profile

## 示例

```bash
# 推荐：全交互前置流程
node index.js

# 参数模式 + dry-run
node index.js --app-id cli_xxx --app-secret yyy --agent-id recruiter --routing-mode account --dry-run
```

## 文件说明

- `index.js` 主流程与交互向导
- `lib/validator.js` 参数/配置校验
- `SKILL.md` Skill 元信息与触发描述
