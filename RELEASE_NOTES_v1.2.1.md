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

## Changed
- Reworked root `README.md` for clearer public-facing documentation
- Extended `package.json` scripts with `test` and `verify`
- Performed low-risk refactor: extracted workspace bootstrap logic into `lib/workspace-bootstrap.js`

## Verified
- `npm run check`
- `npm test`
- `npm run verify`

## Recommended next steps
- Rename GitHub repository to `feishu-bot-manager`
- Push the latest commits and enable CI
- Verify dry-run / real-write / rollback flows in a real OpenClaw environment
- Consider further modularizing `index.js` into smaller CLI-oriented modules
