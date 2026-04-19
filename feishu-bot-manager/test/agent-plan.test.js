const test = require('node:test');
const assert = require('node:assert/strict');

const {
  resolveAgentPlanContext,
  createAgentViaOpenClaw,
  setAgentIdentity
} = require('../lib/agent-plan');

test('resolveAgentPlanContext derives sanitized id and workspace', () => {
  const result = resolveAgentPlanContext({
    plan: { coreRequirement: 'Sales Recruiter' },
    options: {},
    sanitizeAgentId: (value) => value.toLowerCase().replace(/\s+/g, '-'),
    validateAgentId: (value) => value === 'sales-recruiter',
    defaultWorkspaceForAgent: (homeDir, agentId) => `${homeDir}/${agentId}`,
    homeDir: '/tmp/home'
  });

  assert.deepEqual(result, {
    agentId: 'sales-recruiter',
    workspace: '/tmp/home/sales-recruiter'
  });
});

test('createAgentViaOpenClaw builds add command and parses success', () => {
  let seenArgs = null;
  const parsed = createAgentViaOpenClaw({
    agentId: 'demo',
    workspace: '/tmp/demo',
    model: 'cpa/gpt-5.4',
    runOpenClaw: (args) => {
      seenArgs = args;
      return { stdout: '{"id":"demo"}', stderr: '', code: 0 };
    },
    extractJsonObject: (text) => text,
    parseAgentAddResult: () => ({ id: 'demo' })
  });

  assert.equal(parsed.id, 'demo');
  assert.deepEqual(seenArgs, ['agents', 'add', 'demo', '--workspace', '/tmp/demo', '--non-interactive', '--json', '--model', 'cpa/gpt-5.4']);
});

test('setAgentIdentity sends the expected command', () => {
  let seenArgs = null;
  const result = setAgentIdentity({
    agentId: 'demo',
    workspace: '/tmp/demo',
    identityName: 'Demo Agent',
    runOpenClaw: (args) => {
      seenArgs = args;
      return { code: 0 };
    }
  });

  assert.equal(result.code, 0);
  assert.deepEqual(seenArgs, ['agents', 'set-identity', '--agent', 'demo', '--workspace', '/tmp/demo', '--name', 'Demo Agent', '--json']);
});
