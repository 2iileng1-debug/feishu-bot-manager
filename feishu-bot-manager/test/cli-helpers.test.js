const test = require('node:test');
const assert = require('node:assert/strict');

const { deepClone, parseBoolean, parseArgs } = require('../lib/cli-helpers');

test('parseBoolean accepts common truthy and falsy spellings', () => {
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('YES'), true);
  assert.equal(parseBoolean('0', true), false);
  assert.equal(parseBoolean('off', true), false);
  assert.equal(parseBoolean('maybe', true), true);
});

test('parseArgs parses dashed flags and standalone booleans', () => {
  const args = parseArgs([
    '--app-id', 'cli_abc123',
    '--routing-mode', 'group',
    '--dry-run',
    '--chat-id', 'oc_123'
  ]);

  assert.deepEqual(args, {
    appid: 'cli_abc123',
    routingmode: 'group',
    dryrun: 'true',
    chatid: 'oc_123'
  });
});

test('deepClone creates an isolated copy', () => {
  const original = { nested: { value: 1 } };
  const copy = deepClone(original);
  copy.nested.value = 2;

  assert.equal(original.nested.value, 1);
  assert.equal(copy.nested.value, 2);
});
