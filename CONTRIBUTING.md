# Contributing

Thanks for contributing to `feishu-bot-manager`.

## Development Setup

1. Install Node.js 18+.
2. Clone the repository.
3. Install dependencies:

```bash
cd feishu-bot-manager
npm install
```

## Local Validation

Run these before opening a PR:

```bash
npm run check
npm test
npm run verify
```

## Pull Request Guidelines

- Keep changes focused and minimal.
- Add or update tests for behavior changes.
- Update docs when CLI behavior, defaults, or safety semantics change.
- Do not include real credentials, tokens, or production config in commits.

## Commit and Scope Guidance

- Prefer small, reviewable commits.
- Separate refactors from behavior changes when possible.
- If changing config-write behavior, include rollback notes in PR description.

## High-Risk Areas (Need Extra Review)

- `feishu-bot-manager/lib/config-workflow.js`
- `feishu-bot-manager/lib/config-apply.js`
- `feishu-bot-manager/lib/quick-mode.js`
- Any change that impacts `dmPolicy`, route binding logic, or backup/restore flow

## Disclosure Requirement

If a change affects security posture (for example `dmPolicy`, secret handling, validation bypass, or gateway restart behavior), call it out clearly in:
- PR title or first paragraph
- Changelog / release notes
- README / SKILL docs when user-facing behavior changes
