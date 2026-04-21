# Security Policy

## Supported Versions

Security fixes are currently provided for the latest version on the default branch (`main`).

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Report privately by email:
- `2iileng1@gmail.com`

Please include:
- Affected version / commit SHA
- Reproduction steps
- Impact assessment
- Suggested mitigation (if any)

## Response Targets

- Initial acknowledgement: within 3 business days
- Triage update: within 7 business days
- Fix timeline: based on severity and exploitability

## Project-Specific Security Notes

This project writes Feishu account configuration and route bindings into OpenClaw config files. Treat all credentials and config artifacts as sensitive.

Important behavior:
- New account creation is intentionally forced to `dmPolicy = open`.
- This is an explicit product decision for this repository, not a safe default for every environment.
- If your environment requires stricter private-message controls, do not use this repository as-is.

Operational recommendations:
- Always run `--dry-run` before production writes.
- Keep backups enabled (the tool creates backups before writing).
- Use least-privilege credentials and rotate secrets regularly.
- Avoid committing real `app-id` / `app-secret` values to any repository.
