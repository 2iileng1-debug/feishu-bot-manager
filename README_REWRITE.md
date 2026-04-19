# feishu-bot-manager

安全地新增或更新 OpenClaw 飞书机器人账户，并在读取 `app-id/app-secret` 之前执行 Agent 创建前置流程（直接创建 / 先梳理需求），自动注入治理与记忆基线。

> 当前建议仓库名：`feishu-bot-manager`

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

---

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

---

## 项目结构

```text
.
├── README.md
└── feishu-bot-manager/
    ├── README.md
    ├── SKILL.md
    ├── index.js
    ├── package.json
    └── lib/
        └── validator.js
```

### 文件说明

- `feishu-bot-manager/index.js`
  - 主流程入口
  - 参数解析
  - 交互向导
  - 配置写入
  - 备份与校验

- `feishu-bot-manager/lib/validator.js`
  - App ID / Account ID / Chat ID / Agent ID 等校验
  - Feishu 绑定与配置对象校验

- `feishu-bot-manager/SKILL.md`
  - Skill 元信息
  - 触发词
  - 使用说明

---

## 运行要求

- Node.js 18+
- 已安装并可执行 `openclaw`
- 当前环境能访问本机 OpenClaw 配置
- 若需写入真实配置，需有对应文件权限

可选但推荐：

- 已完成 OpenClaw 基础初始化
- 已具备飞书应用凭据（App ID / App Secret）

---

## 快速开始

### 方式 1：全交互引导（推荐）

```bash
cd feishu-bot-manager
node index.js
```

适用于：
- 还没准备好飞书凭据
- 想先创建 Agent，再接入飞书
- 想走完整安全流程

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

适用于：
- 已经有飞书凭据
- 只想快速验证写入结果

---

## 参数说明

| 参数 | 说明 |
|---|---|
| `--app-id` | 飞书 App ID，格式应为 `cli_xxx` |
| `--app-secret` | 飞书 App Secret |
| `--account-id` | 账户 ID，默认 `bot-时间戳` |
| `--bot-name` | 机器人显示名 |
| `--dm-policy` | `open / pairing / allowlist` |
| `--agent-id` | 绑定的 Agent ID |
| `--routing-mode` | `account / group`，默认 `account` |
| `--chat-id` | 群聊 ID，`group` 模式必填 |
| `--dry-run` | 仅校验，不写入 |
| `--set-dm-scope` | 写入后设置 `session.dmScope` |
| `--restart` | 写入后重启 Gateway |
| `--wizard` | 缺少凭据时是否启用交互前置流程 |
| `--openclaw-profile` | 指定 OpenClaw profile |

---

## 使用示例

### 1. 账户级路由

```bash
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-recruiter \
  --agent-id recruiter \
  --routing-mode account
```

### 2. 群聊级路由

```bash
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --account-id bot-ops \
  --agent-id ops-agent \
  --routing-mode group \
  --chat-id oc_xxx
```

### 3. 只做校验，不落盘

```bash
node index.js \
  --app-id cli_xxx \
  --app-secret yyy \
  --agent-id recruiter \
  --dry-run
```

---

## 安全机制

本项目默认偏保守：

1. **写入前先备份配置**
2. **本地校验失败直接阻断**
3. **OpenClaw schema 校验失败直接阻断**
4. **默认不自动重启 Gateway**
5. **输出回滚命令**，方便快速恢复

---

## 当前检查结论

### 已确认正常

- `index.js` 能通过 `node --check`
- `lib/validator.js` 能通过 `node --check`
- `node index.js --help` 可正常输出帮助信息
- 项目结构清晰，职责基本分离

### 当前存在的改进点

1. **仓库名原先不合理**
   - 原仓库名为 `-`
   - 建议改为 `feishu-bot-manager`

2. **根 README 还可以更聚焦**
   - 建议明确安装、依赖、流程、错误处理、回滚说明

3. **缺少测试**
   - 目前只有语法检查
   - 建议补最少 smoke test / validator test

4. **缺少 License**
   - 如果后续要发布或共享，建议补上

5. **缺少 CI**
   - 建议至少增加 Node syntax check 或基本测试工作流

---

## 建议的下一步

### 最低优先级改进

- 改仓库名为 `feishu-bot-manager`
- 使用本 README 替换或重写根 README
- 增加 `LICENSE`
- 增加 `.gitignore`

### 中优先级改进

- 增加 `tests/validator.test.js`
- 增加 CI（如 GitHub Actions）
- 为失败场景补更清晰的错误提示

### 高优先级改进

- 拆分 `index.js`，把交互流程 / 配置写入 / 文件治理逻辑分模块
- 为配置写入流程增加可模拟测试
- 增加 dry-run 输出 diff 能力

---

## 推荐发布前检查清单

- [ ] 仓库名已更新
- [ ] README 已同步
- [ ] SKILL.md 与 README 一致
- [ ] 参数说明完整
- [ ] 至少有基础测试
- [ ] 有 License
- [ ] 已验证 dry-run / real-write / rollback 路径

---

## 备注

如果你准备继续维护这个项目，建议下一版把它从“单脚本工具”升级为“可测试的小型 CLI 项目”，后续可维护性会明显更好。
