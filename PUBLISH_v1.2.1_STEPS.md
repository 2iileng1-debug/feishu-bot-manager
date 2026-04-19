# feishu-bot-manager v1.2.1 发布步骤

下面是建议的实际执行顺序。

## 0. 确认当前本地仓库目录

```bash
cd /Users/ileng/.openclaw/agents/chaomeng/workspace/tmp/feishu-bot-manager-audit
```

## 1. 确认 GitHub 登录状态

```bash
gh auth status
```

如果权限不足，重新登录：

```bash
gh auth login
```

## 2. 修改仓库名

```bash
gh api -X PATCH repos/2iileng1-debug/- -f name='feishu-bot-manager'
```

修改后确认：

```bash
gh repo view 2iileng1-debug/feishu-bot-manager --json name,nameWithOwner,url
```

## 3. 检查远程地址

```bash
git remote -v
```

如果远程还是旧地址，更新它：

```bash
git remote set-url origin git@github.com:2iileng1-debug/feishu-bot-manager.git
```

如果你用 HTTPS：

```bash
git remote set-url origin https://github.com/2iileng1-debug/feishu-bot-manager.git
```

## 4. 拉取并查看当前提交

```bash
git log --oneline -5
```

你应该至少能看到这两个提交：

```text
9a4c586 refactor: extract workspace bootstrap and add release docs
9c72003 chore: add docs, tests, and ci for feishu-bot-manager
```

## 5. 本地最终校验

```bash
cd feishu-bot-manager
npm run verify
cd ..
```

## 6. 推送代码

```bash
git push
```

如果是第一次推送当前分支：

```bash
git push -u origin main
```

## 7. 打 tag（推荐）

```bash
git tag -a v1.2.1 -m "release: v1.2.1"
git push origin v1.2.1
```

## 8. 在 GitHub 创建 Release（可选但推荐）

可以直接用 `RELEASE_NOTES_v1.2.1.md` 里的内容。

如果用 gh CLI：

```bash
gh release create v1.2.1 \
  --title "v1.2.1" \
  --notes-file RELEASE_NOTES_v1.2.1.md
```

## 9. 检查 CI

推送后查看：

```bash
gh run list --repo 2iileng1-debug/feishu-bot-manager --limit 5
```

查看最近一次运行详情：

```bash
gh run view --repo 2iileng1-debug/feishu-bot-manager
```

## 10. 发布后手动验收

建议至少做一次：

- dry-run 验证
- real-write 验证
- rollback 验证
- account 路由验证
- group 路由验证

---

## 最短发布路径

如果你只想快速发出去，最短命令序列是：

```bash
cd /Users/ileng/.openclaw/agents/chaomeng/workspace/tmp/feishu-bot-manager-audit
gh auth status
gh api -X PATCH repos/2iileng1-debug/- -f name='feishu-bot-manager'
git remote set-url origin git@github.com:2iileng1-debug/feishu-bot-manager.git
cd feishu-bot-manager && npm run verify && cd ..
git push
git tag -a v1.2.1 -m "release: v1.2.1"
git push origin v1.2.1
```
