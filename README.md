# feishu-bot-manager

一个可跨平台（Windows/macOS/Linux）运行的 OpenClaw Skill，用于：

- 在飞书创建并接入机器人多账号
- 绑定消息路由到指定 Agent（账户级 / 群聊级）
- 在接入前执行 Agent 创建前置工作流（直接创建 or 先梳理需求）
- 自动注入治理与记忆基线（防失忆、规则闸门、安全约束）

## 仓库结构

```text
.
└── feishu-bot-manager/
    ├── index.js
    ├── package.json
    ├── SKILL.md
    ├── README.md
    └── lib/
        └── validator.js
```

## 核心特性

1. 前置工作流（读取 app-id/app-secret 前）
- 询问用户是“直接创建 Agent”还是“先梳理工作内容再创建”
- 支持多轮提问，直到需求清晰或用户说“可以了”
- 自动创建 Agent，并写入治理/记忆基线

2. 规则与治理基线自动化
- 灵魂/身份写入确认闸门（SOUL.md / IDENTITY.md）
- “禁止只口头不执行”写入治理规则
- 治理文件修改必须确认
- Skill 文档与示例配置同步更新

3. 防失忆记忆机制
- 每日记忆：`memory/YYYY-MM-DD.md`
- 长期记忆：`MEMORY.md`
- 提供长期沉淀入口与默认模板

4. 飞书接入安全流程
- 自动备份 `openclaw.json`
- 本地校验 + `openclaw config validate --json`
- 校验失败阻止写入
- 默认不自动重启 Gateway（需显式 `--restart`）

## 快速使用

在 Skill 目录下：

```bash
node index.js
```

或通过 OpenClaw：

```bash
openclaw skills run feishu-bot-manager --
```

## 常见命令

```bash
# 全交互模式（推荐）
node index.js

# 直接参数 dry-run
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-sales \
  --agent-id recruiter \
  --routing-mode account \
  --dry-run
```

## 说明

- 脚本会输出飞书创建链接：
  `https://open.feishu.cn/page/openclaw?form=multiAgent`
- 创建机器人后，按提示输入 `--app-id` 与 `--app-secret` 即可继续。

## 版本

当前仓库部署版本来自 `feishu-bot-manager` `v1.2.0`（前置 Agent 工作流 + 安全增强版）。
