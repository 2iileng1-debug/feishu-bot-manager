# Release Notes — v1.2.1

## Summary
This release improves project maintainability and release readiness for `feishu-bot-manager`.

## Added
- Added `LICENSE` (MIT)
- Added `.gitignore`
- Added validator unit tests with Node built-in test runner
- Added GitHub Actions CI workflow
- Added release checklist for future publishing
- Added audit report and rewritten README draft
- Added focused tests for CLI helpers, output helpers, quick mode, agent plan flow, config apply flow, and main flow wizard helpers

## Changed
- Reworked root `README.md` for clearer public-facing documentation
- Extended `package.json` scripts with `test` and `verify`
- Performed low-risk modular refactor of the CLI entry flow
- Extracted workspace bootstrap logic into `lib/workspace-bootstrap.js`
- Extracted runtime and config store logic into dedicated modules
- Extracted CLI helpers into `lib/cli-helpers.js`
- Extracted CLI output helpers into `lib/output.js`
- Extracted quick mode option parsing into `lib/quick-mode.js`
- Extracted agent creation plan helpers into `lib/agent-plan.js`
- Extracted config apply workflow helpers into `lib/config-apply.js`
- Extracted main flow wizard helpers into `lib/main-flow.js`

## Verified
- `npm run check`
- `npm test`
- `npm run verify`
- 26/26 tests passing after refactor sequence

## Release state
- Repository renamed to `2iileng1-debug/feishu-bot-manager`
- `main` pushed successfully
- Tag `v1.2.1` pushed successfully
- GitHub release published successfully

## Recommended next steps
- Verify dry-run / real-write / rollback flows in a real OpenClaw environment
- Consider a future release after real-environment acceptance testing
