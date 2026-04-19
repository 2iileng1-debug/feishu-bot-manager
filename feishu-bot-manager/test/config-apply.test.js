const test = require('node:test');
const assert = require('node:assert/strict');

const {
  applyAccountRouting,
  validateCandidateConfig,
  finalizeConfigApply
} = require('../lib/config-apply');

test('applyAccountRouting adds account binding', () => {
  const candidate = {};
  const calls = [];
  applyAccountRouting({
    candidate,
    options: { agentid: 'demo' },
    mode: 'account',
    accountId: 'bot-demo',
    upsertBinding: (_candidate, binding) => calls.push(binding),
    log: { success: () => {}, warning: () => {} }
  });

  assert.deepEqual(calls[0], {
    type: 'route',
    agentId: 'demo',
    match: { channel: 'feishu', accountId: 'bot-demo' }
  });
});

test('validateCandidateConfig returns false on local validation errors', () => {
  const seen = [];
  const result = validateCandidateConfig({
    candidate: {},
    validateConfig: () => ['bad config'],
    validateWithSchema: () => ({ valid: true, issues: [] }),
    log: {
      error: (msg) => seen.push(msg),
      preview: (msg) => seen.push(msg)
    }
  });

  assert.equal(result.ok, false);
  assert.match(seen.join('\n'), /Local validation failed/);
});

test('finalizeConfigApply stops on dry run', () => {
  let saved = false;
  finalizeConfigApply({
    candidate: {},
    dryRun: true,
    createBackup: () => { throw new Error('should not backup'); },
    saveConfig: () => { saved = true; },
    log: { warning: () => {}, success: () => {}, info: () => {} },
    configPath: '/tmp/openclaw.json',
    getRestoreCommand: () => 'restore',
    platform: process.platform,
    setDmScope: false,
    dmScopeValue: 'scope',
    runOpenClaw: () => ({ code: 0 }),
    restart: false
  });

  assert.equal(saved, false);
});
