const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateAppId,
  validateAccountId,
  validateChatId,
  validateAgentId,
  validateDmPolicy,
  validateRoutingMode,
  validateConfig
} = require('../lib/validator');

test('validateAppId works for valid and invalid inputs', () => {
  assert.equal(validateAppId('cli_abc123'), true);
  assert.equal(validateAppId('app_abc123'), false);
  assert.equal(validateAppId(''), false);
});

test('validateAccountId accepts lowercase letters numbers and hyphen', () => {
  assert.equal(validateAccountId('bot-sales'), true);
  assert.equal(validateAccountId('BotSales'), false);
  assert.equal(validateAccountId('bot_sales'), false);
});

test('validateChatId validates oc_ prefix', () => {
  assert.equal(validateChatId('oc_abc123'), true);
  assert.equal(validateChatId('ou_abc123'), false);
});

test('validateAgentId validates normalized ids', () => {
  assert.equal(validateAgentId('recruiter'), true);
  assert.equal(validateAgentId('sales-agent-01'), true);
  assert.equal(validateAgentId('-bad'), false);
});

test('validateDmPolicy only accepts supported values', () => {
  assert.equal(validateDmPolicy('open'), true);
  assert.equal(validateDmPolicy('pairing'), true);
  assert.equal(validateDmPolicy('allowlist'), true);
  assert.equal(validateDmPolicy('closed'), false);
});

test('validateRoutingMode only accepts account/group', () => {
  assert.equal(validateRoutingMode('account'), true);
  assert.equal(validateRoutingMode('group'), true);
  assert.equal(validateRoutingMode('all'), false);
});

test('validateConfig accepts a minimal valid feishu config', () => {
  const config = {
    channels: {
      feishu: {
        accounts: {
          'bot-sales': {
            appId: 'cli_abc123',
            appSecret: 'secret',
            dmPolicy: 'open'
          }
        }
      }
    },
    bindings: [
      {
        type: 'route',
        agentId: 'recruiter',
        match: {
          channel: 'feishu',
          accountId: 'bot-sales'
        }
      }
    ]
  };

  assert.deepEqual(validateConfig(config), []);
});

test('validateConfig rejects invalid feishu binding', () => {
  const config = {
    channels: {
      feishu: {
        accounts: {
          'bot-sales': {
            appId: 'cli_abc123',
            appSecret: 'secret'
          }
        }
      }
    },
    bindings: [
      {
        type: 'route',
        agentId: 'recruiter',
        match: {
          channel: 'feishu',
          peer: {
            kind: 'group',
            id: 'invalid_chat_id'
          }
        }
      }
    ]
  };

  const errors = validateConfig(config);
  assert.ok(errors.some((x) => x.includes('Invalid binding.peer.id')));
});
