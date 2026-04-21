# feishu-bot-manager

跨平台（Windows/macOS/Linux）飞书机器人接入与 Agent 路由管理脚本，用于**安全新增或更新 OpenClaw 飞书机器人账户**，并在真正读取 `--app-id` / `--app-secret` 之前完成 Agent 创建前置流程、治理注入与记忆基线初始化。

## 当前状态

项目当前已完成：

- GitHub 仓库已稳定使用 `feishu-bot-manager`
- `main` 分支与 `v1.2.1` tag 已落到远端
- 已补齐测试与发布说明
- 已完成多轮**低风险模块化重构**，入口文件从大块混合逻辑逐步收敛为主流程 orchestrator

本次仓库收尾已补齐：

- `LICENSE`（MIT）
- GitHub Actions CI（push / pull_request 自动跑 `npm run verify`）

说明：
- 若 GitHub Release 页面尚未创建，可在已有 `v1.2.1` tag 基础上补建 Release
- README 现在与仓库真实状态保持一致

## 你会得到什么

### 1. 接入前置工作流
- 在读取 `--app-id` / `--app-secret` 前，先处理 Agent 创建
- 创建方式二选一：
  - 直接创建 Agent
  - 先多轮梳理需求，再创建 Agent

### 2. 自动治理注入
- SOUL / IDENTITY 写入确认闸门
- “禁止只口头不执行”规则注入
- 治理文件修改确认机制
- Skill 文档与示例配置同步约束

### 3. 记忆基线
- 每日记忆文件：`memory/YYYY-MM-DD.md`
- 长期记忆文件：`MEMORY.md`

### 4. 飞书配置安全写入
- 写入前备份 `openclaw.json`
- 本地校验 + `openclaw config validate --json`
- 默认不自动重启 Gateway（`--restart` 才重启）
- 输出 rollback 命令，便于快速恢复

## 参数

- `--app-id` 飞书 App ID（`cli_xxx`）
- `--app-secret` 飞书 App Secret
- `--account-id` 账户 ID（默认自动生成）
- `--bot-name` 机器人名
- `--dm-policy` `open (fixed)`
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

## 模块结构

```text
lib/
├── agent-plan.js
├── cli-helpers.js
├── config-apply.js
├── config-store.js
├── config-workflow.js
├── main-flow.js
├── openclaw-runtime.js
├── output.js
├── quick-mode.js
├── validator.js
├── wizard.js
└── workspace-bootstrap.js
```

## 测试

当前测试覆盖以下模块：

- `validator`
- `cli-helpers`
- `output`
- `quick-mode`
- `agent-plan`
- `config-apply`
- `main-flow`

常用命令：

```bash
npm test
npm run check
npm run verify
```

CI 会在 `push` 和 `pull_request` 时自动执行 `npm run verify`。

## 文件说明

- `index.js` 主流程入口（当前主要负责 orchestrator 编排）
- `lib/validator.js` 参数/配置校验
- `lib/wizard.js` 前置交互向导
- `lib/config-workflow.js` 飞书配置构建与 summary 输出
- `lib/config-apply.js` 配置应用、校验、收尾动作
- `SKILL.md` Skill 元信息与触发描述
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