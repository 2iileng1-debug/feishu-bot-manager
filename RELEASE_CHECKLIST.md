# feishu-bot-manager 发布检查清单

## 仓库与命名
- [ ] GitHub 仓库名已改为 `feishu-bot-manager`
- [ ] 本地 clone 的远程地址已同步更新
- [ ] 仓库描述已更新为清晰一句话

## 文档
- [ ] 根目录 `README.md` 已更新
- [ ] `feishu-bot-manager/README.md` 与根 README 不冲突
- [ ] `SKILL.md` 与 README 参数说明一致
- [ ] 示例命令已验证可运行

## 许可证与元数据
- [ ] `LICENSE` 已确认
- [ ] `package.json` 名称/版本/描述正确
- [ ] 如果需要发布，作者信息与主页链接已补全

## 质量保障
- [ ] `npm run check` 通过
- [ ] `npm test` 通过
- [ ] `npm run verify` 通过
- [ ] GitHub Actions CI 已启用且绿色

## 功能验证
- [ ] dry-run 路径已实测
- [ ] real write 路径已实测
- [ ] rollback 命令已验证可恢复
- [ ] group routing 路径已验证
- [ ] account routing 路径已验证

## OpenClaw / Feishu 场景验证
- [ ] `openclaw config validate --json` 正常
- [ ] 目标环境存在有效 `openclaw.json`
- [ ] Feishu App ID / App Secret 可正常接入
- [ ] Gateway 重启路径已验证（如使用）

## 发布动作
- [ ] 已推送最新 commit
- [ ] 已打 tag（如需要）
- [ ] 已写 release notes
- [ ] 已通知相关使用者或团队

## 建议首个发布版本
- [ ] `v1.2.1`（文档、测试、CI、结构轻拆分版）
