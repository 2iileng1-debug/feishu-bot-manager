const test = require('node:test');
const assert = require('node:assert/strict');

const { handleHelpOption, resolveWizardState, maybeRunWizard } = require('../lib/main-flow');

test('handleHelpOption returns true when help flag is present', () => {
  let rendered = false;
  const result = handleHelpOption({
    options: { help: 'true' },
    renderHelp: () => { rendered = true; }
  });

  assert.equal(result, true);
  assert.equal(rendered, true);
});

test('resolveWizardState reflects credential presence and wizard toggle', () => {
  const result = resolveWizardState({
    options: { appid: 'cli_x', appsecret: 'secret', wizard: 'false' },
    parseBoolean: (value, fallback) => value === 'false' ? false : fallback
  });

  assert.deepEqual(result, {
    hasCredentials: true,
    wizardEnabled: false
  });
});

test('maybeRunWizard exits with code 1 when wizard is disabled and creds missing', async () => {
  const seen = [];
  const originalLog = console.log;
  console.log = (msg = '') => seen.push(String(msg));

  try {
    const result = await maybeRunWizard({
      mergedOptions: {},
      hasCredentials: false,
      wizardEnabled: false,
      log: { error: (msg) => seen.push(`ERR:${msg}`), warning: () => {} },
      feishuCreateUrl: 'https://example.com/create',
      runPreflightWizard: async () => ({}),
      parseBoolean: () => true,
      createAgentFromPlan: () => ({}),
      stdinIsTTY: true
    });

    assert.equal(result.shouldExit, true);
    assert.equal(result.exitCode, 1);
    assert.match(seen.join('\n'), /https:\/\/example.com\/create/);
  } finally {
    console.log = originalLog;
  }
});

test('maybeRunWizard returns wizard options on success', async () => {
  const result = await maybeRunWizard({
    mergedOptions: { foo: 'bar' },
    hasCredentials: false,
    wizardEnabled: true,
    log: { error: () => {}, warning: () => {} },
    feishuCreateUrl: 'https://example.com/create',
    runPreflightWizard: async () => ({ appid: 'cli_x', appsecret: 'secret' }),
    parseBoolean: () => true,
    createAgentFromPlan: () => ({}),
    stdinIsTTY: true
  });

  assert.equal(result.shouldExit, false);
  assert.deepEqual(result.options, { appid: 'cli_x', appsecret: 'secret' });
});
