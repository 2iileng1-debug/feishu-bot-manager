const test = require('node:test');
const assert = require('node:assert/strict');

const { getQuickModeSettings, validateQuickModeOptions } = require('../lib/quick-mode');
const { parseBoolean } = require('../lib/cli-helpers');

test('getQuickModeSettings derives defaults and booleans', () => {
  const originalNow = Date.now;
  Date.now = () => 1234567890;

  try {
    const result = getQuickModeSettings({ restart: 'yes', dryrun: '0' }, parseBoolean);
    assert.deepEqual(result, {
      mode: 'account',
      accountId: 'bot-1234567890',
      dryRun: false,
      restart: true,
      setDmScope: false
    });
  } finally {
    Date.now = originalNow;
  }
});

test('validateQuickModeOptions accepts a valid group routing config', () => {
  assert.doesNotThrow(() => {
    validateQuickModeOptions({
      options: {
        appid: 'cli_abc123',
        appsecret: 'secret',
        chatid: 'oc_123',
        dmpolicy: 'pairing'
      },
      mode: 'group',
      accountId: 'bot-sales',
      validateAppId: (value) => value.startsWith('cli_'),
      validateAccountId: (value) => value === 'bot-sales',
      validateRoutingMode: (value) => ['account', 'group'].includes(value),
      validateDmPolicy: (value) => ['open', 'pairing', 'allowlist'].includes(value),
      validateChatId: (value) => value.startsWith('oc_')
    });
  });
});

test('validateQuickModeOptions throws on invalid chat id', () => {
  assert.throws(
    () => validateQuickModeOptions({
      options: {
        appid: 'cli_abc123',
        appsecret: 'secret',
        chatid: 'bad_chat'
      },
      mode: 'group',
      accountId: 'bot-sales',
      validateAppId: () => true,
      validateAccountId: () => true,
      validateRoutingMode: () => true,
      validateDmPolicy: () => true,
      validateChatId: () => false
    }),
    /Invalid chat-id format/
  );
});
