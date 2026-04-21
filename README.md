# feishu-bot-manager

安全地新增或更新 OpenClaw 飞书机器人账户，并在读取 `app-id/app-secret` 之前执行 Agent 创建前置流程（直接创建 / 先梳理需求），自动注入治理与记忆基线。

> 建议仓库名：`feishu-bot-manager`

## 项目简介

`feishu-bot-manager` 是一个面向 OpenClaw 的脚本型 Skill，用来解决两类问题：

1. **飞书机器人接入**
   - 写入飞书多账户配置
   - 配置账户级 / 群聊级消息路由
   - 写入前自动做本地校验与 OpenClaw schema 校验

2. **Agent 创建前置流程**
   - 在真正读取飞书凭据前，先完成 Agent 创建流程
   - 支持两种模式：
     - 直接创建 Agent
     - 先多轮梳理需求，再创建 Agent
   - 自动补齐治理和记忆基线文件

## 项目结构

```text
.
├── README.md
├── LICENSE
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
└── feishu-bot-manager/
    ├── README.md
    ├── SKILL.md
    ├── index.js
    ├── package.json
    ├── lib/
    │   └── validator.js
    └── test/
        └── validator.test.js
```

## 功能特性

### 1) 前置工作流
当用户还没有提供 `--app-id` / `--app-secret` 时，脚本会先进入引导流程：

- 选择 Agent 创建方式
- 直接创建，或先梳理需求
- 自动生成 Agent 工作区基础内容
- 输出飞书机器人创建链接
- 等待用户补充凭据后继续写配置

飞书创建链接：

```text
https://open.feishu.cn/page/openclaw?form=multiAgent
```

### 2) 飞书配置安全写入
脚本会在写入配置前做以下动作：

- 读取 `openclaw.json`
- 自动创建备份
- 本地规则校验
- 调用 `openclaw config validate --json` 做 schema 校验
- 校验通过后才写入

### 3) 路由绑定
支持两种路由方式：

- `account`
  - 一个飞书账户的所有消息路由到一个 Agent
- `group`
  - 指定飞书群聊消息路由到一个 Agent

### 4) 治理与记忆基线
在 Agent 创建流程中可自动补齐：

- `SOUL.md / IDENTITY.md` 相关治理块
- “禁止只口头不执行”约束
- 每日记忆 `memory/YYYY-MM-DD.md`
- 长期记忆 `MEMORY.md`

## 运行要求

- Node.js 18+
- 已安装并可执行 `openclaw`
- 当前环境能访问本机 OpenClaw 配置
- 若需写入真实配置，需有对应文件权限

## 快速开始

### 方式 1：全交互引导（推荐）

```bash
cd feishu-bot-manager
node index.js
```

### 方式 2：直接参数模式

```bash
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-sales \
  --agent-id recruiter \
  --routing-mode account \
  --dry-run
```

## 参数说明

| 参数 | 说明 |
|---|---|
| `--app-id` | 飞书 App ID，格式应为 `cli_xxx` |
| `--app-secret` | 飞书 App Secret |
| `--account-id` | 账户 ID，默认 `bot-时间戳` |
| `--bot-name` | 机器人显示名 |
| `--dm-policy` | `open (fixed)` |
| `--agent-id` | 绑定的 Agent ID |
| `--routing-mode` | `account / group`，默认 `account` |
| `--chat-id` | 群聊 ID，`group` 模式必填 |
| `--dry-run` | 仅校验，不写入 |
| `--set-dm-scope` | 写入后设置 `session.dmScope` |
| `--restart` | 写入后重启 Gateway |
| `--wizard` | 缺少凭据时是否启用交互前置流程 |
| `--openclaw-profile` | 指定 OpenClaw profile |

## 常用命令

```bash
# 语法检查
npm run check

# 运行测试
npm test

# 完整校验
npm run verify
```

## 安全机制

1. 写入前自动备份配置
2. 本地校验失败直接阻断
3. OpenClaw schema 校验失败直接阻断
4. 默认不自动重启 Gateway
5. 输出回滚命令，便于快速恢复

## 当前状态

这个项目已经具备第一版可用性，适合继续打磨成正式可发布 Skill。

建议优先事项：
- 修改仓库名为 `feishu-bot-manager`
- 同步 README / SKILL 文档
- 补测试与 CI
- 后续再拆分 `index.js`
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