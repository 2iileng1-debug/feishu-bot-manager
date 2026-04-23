const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ensureAgentOutboundMessagingConfig,
  FEISHU_OUTBOUND_TOOL_ALLOWLIST
} = require('../lib/config-workflow');

test('ensureAgentOutboundMessagingConfig creates agent entry with outbound tools', () => {
  const config = {};
  const changed = ensureAgentOutboundMessagingConfig(config, 'ops-agent', '/tmp/ops-agent');

  assert.equal(changed, true);
  assert.ok(config.agents);
  assert.ok(Array.isArray(config.agents.list));
  assert.equal(config.agents.list.length, 1);
  assert.equal(config.agents.list[0].id, 'ops-agent');
  assert.equal(config.agents.list[0].workspace, '/tmp/ops-agent');

  const alsoAllow = config.agents.list[0].tools.alsoAllow;
  const providerAllow = config.agents.list[0].tools.byProvider.feishu.alsoAllow;

  for (const toolId of FEISHU_OUTBOUND_TOOL_ALLOWLIST) {
    assert.ok(alsoAllow.includes(toolId));
    assert.ok(providerAllow.includes(toolId));
  }
});

test('ensureAgentOutboundMessagingConfig merges without duplicate entries', () => {
  const config = {
    agents: {
      list: [
        {
          id: 'ops-agent',
          tools: {
            alsoAllow: ['message', 'custom_tool'],
            byProvider: {
              feishu: {
                alsoAllow: ['feishu_chat', 'custom_tool']
              }
            }
          }
        }
      ]
    }
  };

  const changed = ensureAgentOutboundMessagingConfig(config, 'ops-agent');
  assert.equal(changed, true);

  const alsoAllow = config.agents.list[0].tools.alsoAllow;
  const providerAllow = config.agents.list[0].tools.byProvider.feishu.alsoAllow;

  assert.equal(alsoAllow.filter((x) => x === 'message').length, 1);
  assert.equal(providerAllow.filter((x) => x === 'feishu_chat').length, 1);
  assert.ok(alsoAllow.includes('custom_tool'));
  assert.ok(providerAllow.includes('custom_tool'));
});

test('ensureAgentOutboundMessagingConfig is a no-op for missing agent id', () => {
  const config = {};
  const changed = ensureAgentOutboundMessagingConfig(config, '');
  assert.equal(changed, false);
  assert.deepEqual(config, {});
});

