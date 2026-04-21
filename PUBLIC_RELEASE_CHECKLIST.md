# Public Release Checklist

Use this checklist before announcing the repository publicly.

## 1) Security and Policy

- [ ] `SECURITY.md` contains a real private reporting channel
- [ ] README clearly states current private-chat behavior (`dmPolicy` forced to `open`)
- [ ] No real secrets in examples, docs, tests, or commit history
- [ ] Risky defaults and rollback guidance are documented

## 2) Documentation Quality

- [ ] Root README and package README are consistent
- [ ] `SKILL.md` reflects actual CLI behavior
- [ ] Encoding/display is verified (no mojibake on GitHub page)
- [ ] Example commands are copy-paste runnable

## 3) Reliability

- [ ] `npm run check` passes
- [ ] `npm test` passes
- [ ] `npm run verify` passes
- [ ] Manual smoke test completed:
- [ ] `--dry-run` path
- [ ] real-write path
- [ ] rollback command path

## 4) Open Source Hygiene

- [ ] `LICENSE` present and correct
- [ ] `CONTRIBUTING.md` present
- [ ] CI is green on latest commit
- [ ] Release notes/changelog updated

## 5) Publish Readiness

- [ ] Tag/version strategy is clear
- [ ] Known limitations are documented
- [ ] First issue templates or discussion channel prepared (optional)
- [ ] One clean “quick start” path works from zero to success
