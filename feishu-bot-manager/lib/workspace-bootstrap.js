const fs = require('fs');
const path = require('path');

function sanitizeAgentId(input) {
  const raw = String(input || '').trim().toLowerCase();
  if (!raw) return `agent-${Date.now()}`;

  const normalized = raw.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!normalized) return `agent-${Date.now()}`;
  return normalized.slice(0, 63);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${text.replace(/\s+$/, '')}\n`, 'utf8');
}

function escapeRegExp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function upsertManagedBlock(filePath, blockId, blockContent, fallbackHeader = '') {
  const start = `<!-- ${blockId}:start -->`;
  const end = `<!-- ${blockId}:end -->`;
  const managed = `${start}\n${blockContent.trim()}\n${end}`;

  let text = readText(filePath);
  if (!text.trim() && fallbackHeader) text = `${fallbackHeader.trim()}\n`;

  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, 'm');
  if (pattern.test(text)) text = text.replace(pattern, managed);
  else text = `${text.replace(/\s+$/, '')}\n\n${managed}\n`;

  writeText(filePath, text);
}

function createAgentBrief(plan, meta) {
  return [
    '# AGENT_BRIEF.md',
    '',
    `- Created at: ${new Date().toISOString()}`,
    `- Agent ID: ${meta.agentId}`,
    `- Workspace: ${meta.workspace}`,
    `- Creation mode: ${plan.mode}`,
    '',
    '## Core Requirement',
    plan.coreRequirement || '(not specified)',
    '',
    '## Requirement Notes',
    plan.notes.length > 0 ? plan.notes.map((x, i) => `${i + 1}. ${x}`).join('\n') : '1. (none)',
    '',
    '## Success Definition',
    plan.successDefinition || '(not specified)',
    '',
    '## Boundaries',
    plan.boundaries || '(not specified)',
    ''
  ].join('\n');
}

function bootstrapGovernanceAndMemory(plan, meta) {
  const workspace = meta.workspace;
  const today = new Date().toISOString().slice(0, 10);

  ensureDir(workspace);
  ensureDir(path.join(workspace, 'memory'));
  ensureDir(path.join(workspace, 'memory', '.daily'));

  writeText(path.join(workspace, 'AGENT_BRIEF.md'), createAgentBrief(plan, meta));

  const governanceBody = [
    '# GOVERNANCE.md',
    '',
    '## Confirmation Gates',
    '- Soul/Identity write gate: before modifying `SOUL.md` or `IDENTITY.md`, require explicit user confirmation in the current thread.',
    '- Governance file confirmation: before modifying `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `TOOLS.md`, `MEMORY.md`, confirm with the user.',
    '',
    '## Execution Discipline',
    '- 禁止只口头不执行: do not stop at verbal promises; execute changes or clearly report concrete blockers.',
    '- Always prefer runnable edits and verifiable outputs over abstract plans.',
    '',
    '## Evolution Rules',
    '- Rule promotion flow must include soul/identity confirmation gate checks.',
    '- Skill docs and example config must be updated together (no doc/config drift).',
    '',
    '## Memory Anti-Amnesia Baseline',
    '- Keep daily memory notes in `memory/YYYY-MM-DD.md`.',
    '- Keep long-term distilled memory in `MEMORY.md`.',
    '- Periodically promote stable lessons from daily logs into `MEMORY.md`.',
    ''
  ].join('\n');
  writeText(path.join(workspace, 'GOVERNANCE.md'), governanceBody);

  upsertManagedBlock(
    path.join(workspace, 'SOUL.md'),
    'feishu-bot-manager-soul-gate',
    [
      '## Soul / Identity Write Confirmation Gate',
      '- Any change to this file must be explicitly confirmed by the user in the current thread.',
      '- If confirmation is missing, do not edit and explain why.',
      '- 禁止只口头不执行: after confirmation, execute edits directly and show concrete diff/changes.'
    ].join('\n'),
    '# SOUL.md'
  );

  upsertManagedBlock(
    path.join(workspace, 'IDENTITY.md'),
    'feishu-bot-manager-identity-gate',
    [
      '## Identity Write Confirmation Gate',
      '- Editing identity fields requires explicit user confirmation in the current thread.',
      '- Keep identity updates synced with `SOUL.md` when values conflict.'
    ].join('\n'),
    '# IDENTITY.md'
  );

  upsertManagedBlock(
    path.join(workspace, 'AGENTS.md'),
    'feishu-bot-manager-governance-default',
    [
      '## Governance Defaults (Managed)',
      '- Governance files require user confirmation before edits: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `TOOLS.md`, `MEMORY.md`.',
      '- Skill documentation and example configuration must be updated in the same change set.',
      '- 禁止只口头不执行: complete executable work, not only verbal intent.',
      '- Daily memory: update `memory/YYYY-MM-DD.md` during work.',
      '- Long-term memory: periodically distill into `MEMORY.md`.'
    ].join('\n')
  );

  upsertManagedBlock(
    path.join(workspace, 'TOOLS.md'),
    'feishu-bot-manager-outbound-baseline',
    [
      '## Feishu Outbound Messaging Baseline (Managed)',
      '',
      'Required capability goal:',
      '- Agent can proactively send DM/group messages to explicit Feishu targets.',
      '- Agent can read replies (including thread replies when available).',
      '- Agent can produce cross-session summary reports from reply threads.',
      '',
      'Operational checklist for each outbound task:',
      '1. Resolve targets first (user IDs / chat IDs / aliases) and record the final target list before sending.',
      '2. Send proactive messages using outbound-capable tools (message send / feishu chat tools).',
      '3. Read replies with a bounded window and capture message ids/thread ids for traceability.',
      '4. Aggregate replies across sessions/chats into a normalized summary (who replied, key points, blockers, next actions).',
      '',
      'Troubleshooting order (when outbound is missing):',
      '- Check tool exposure (agent tool allowlist).',
      '- Check message router/binding for the target account or group.',
      '- Check policy allowlist/denylist conflicts.',
      '- Check target parsing/ID normalization (person vs group).',
      '- Check account routing and channel account-id selection.',
      '',
      'Acceptance target:',
      '- Proactive DM send works.',
      '- Proactive group/broadcast send works.',
      '- Reply readback works.',
      '- Cross-session summary output is complete and auditable.'
    ].join('\n'),
    '# TOOLS.md'
  );

  const memoryPath = path.join(workspace, 'MEMORY.md');
  if (!fs.existsSync(memoryPath)) {
    writeText(memoryPath, ['# MEMORY.md', '', 'Long-term memory for this agent.', '', '## Durable Facts', '- (fill in)', '', '## Stable Rules', '- (fill in)', '', '## Reusable Patterns', '- (fill in)', ''].join('\n'));
  }

  const dailyPath = path.join(workspace, 'memory', `${today}.md`);
  if (!fs.existsSync(dailyPath)) {
    writeText(dailyPath, [`# ${today}`, '', '## Work Log', '- ', '', '## Decisions', '- ', '', '## Follow-ups', '- ', ''].join('\n'));
  }

  const evolutionMessage = [
    'Maintain self-evolution and memory consistency for this agent workspace.',
    '',
    'Hard gates:',
    '1) Soul/Identity write confirmation gate: before changing SOUL.md or IDENTITY.md, explicit user confirmation is required.',
    '2) 禁止只口头不执行: do not end with verbal promises; execute or report concrete blockers.',
    '3) Governance file changes must be confirmed.',
    '4) Skill docs and example config must be updated together.',
    '',
    'Memory policy:',
    '- Daily memory file: memory/YYYY-MM-DD.md',
    '- Long-term memory file: MEMORY.md',
    '- Promote stable lessons from daily to long-term memory regularly.'
  ].join('\n');
  writeText(path.join(workspace, 'self-evolution-memory-cron-message.txt'), evolutionMessage);
}

function defaultWorkspaceForAgent(homeDir, agentId) {
  return path.join(homeDir, '.openclaw', 'workspaces', agentId);
}

function parseAgentAddResult(extractJsonObject, rawOutput) {
  const parsed = extractJsonObject(rawOutput);
  if (!parsed || !parsed.agentId || !parsed.workspace) return null;
  return parsed;
}

module.exports = {
  sanitizeAgentId,
  ensureDir,
  bootstrapGovernanceAndMemory,
  defaultWorkspaceForAgent,
  parseAgentAddResult
};
