const test = require('node:test');
const assert = require('node:assert/strict');

const { printSummary, showHelp } = require('../lib/output');

test('printSummary renders summary lines and bolds heading', () => {
  const seen = [];
  const originalLog = console.log;
  console.log = (msg = '') => seen.push(String(msg));

  try {
    printSummary({
      formatSummaryLines: () => ['Summary', '- item 1'],
      log: { bold: (msg) => seen.push(`BOLD:${msg}`) },
      configPath: '/tmp/openclaw.json',
      accountId: 'bot-test',
      mode: 'account',
      agentId: 'agent',
      chatId: '',
      dryRun: true,
      setDmScope: false,
      restart: false
    });
  } finally {
    console.log = originalLog;
  }

  assert.deepEqual(seen, ['BOLD:Summary', '- item 1']);
});

test('showHelp prints usage text and feishu creation url', () => {
  const seen = [];
  const originalLog = console.log;
  console.log = (msg = '') => seen.push(String(msg));

  try {
    showHelp({
      colors: { bold: '<b>', reset: '</b>' },
      dmscopeValue: 'per-account-channel-peer',
      feishuCreateUrl: 'https://example.com/create'
    });
  } finally {
    console.log = originalLog;
  }

  const output = seen.join('\n');
  assert.match(output, /Usage:/);
  assert.match(output, /https:\/\/example.com\/create/);
  assert.match(output, /Routing Modes/);
});
