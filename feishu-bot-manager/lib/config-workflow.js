function ensureFeishuConfig(config) {
  if (!config.channels || typeof config.channels !== 'object') config.channels = {};
  if (!config.channels.feishu || typeof config.channels.feishu !== 'object') {
    config.channels.feishu = { enabled: true };
  }
  if (!config.channels.feishu.accounts || typeof config.channels.feishu.accounts !== 'object') {
    config.channels.feishu.accounts = {};
  }
}

function upsertBinding(config, binding) {
  if (!Array.isArray(config.bindings)) config.bindings = [];

  const match = binding.match || {};
  const index = config.bindings.findIndex((item) => {
    if (!item || typeof item !== 'object' || !item.match) return false;
    if (item.match.channel !== 'feishu') return false;

    if (match.accountId) return item.match.accountId === match.accountId;

    if (match.peer && match.peer.kind === 'group') {
      return item.match.peer && item.match.peer.kind === 'group' && item.match.peer.id === match.peer.id;
    }

    return false;
  });

  if (index >= 0) config.bindings[index] = binding;
  else config.bindings.push(binding);
}

function buildAccountConfig(options, feishu, deepClone) {
  const defaultAccount = feishu.accounts && typeof feishu.accounts.default === 'object'
    ? deepClone(feishu.accounts.default)
    : {};

  const account = {
    ...defaultAccount,
    enabled: true,
    name: options.botname || defaultAccount.name || 'Feishu Bot',
    appId: options.appid,
    appSecret: options.appsecret
  };

  delete account.botName;

  const inheritKeys = [
    'connectionMode', 'requireMention', 'dmPolicy', 'allowFrom',
    'groupAllowFrom', 'groupPolicy', 'groups', 'streaming'
  ];

  for (const key of inheritKeys) {
    if (account[key] === undefined && feishu[key] !== undefined) {
      account[key] = deepClone(feishu[key]);
    }
  }

  // Keep private chat policy deterministic for every created account.
  account.dmPolicy = 'open';

  return account;
}

const FEISHU_OUTBOUND_TOOL_ALLOWLIST = [
  'message',
  'feishu_chat',
  'feishu_im_user_message',
  'feishu_im_user_get_messages',
  'feishu_im_user_get_thread_messages',
  'feishu_search_user',
  'feishu_get_user'
];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeToolList(existing, additions) {
  const seen = new Set();
  const merged = [];
  const source = Array.isArray(existing) ? existing : [];
  for (const item of source.concat(additions)) {
    const normalized = String(item || '').trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    merged.push(normalized);
  }
  return merged;
}

function ensureAgentOutboundMessagingConfig(config, agentId, agentWorkspace = '') {
  if (!agentId) return false;

  if (!isPlainObject(config.agents)) config.agents = {};
  if (!Array.isArray(config.agents.list)) config.agents.list = [];

  let changed = false;
  const list = config.agents.list;
  const found = list.find((item) => isPlainObject(item) && item.id === agentId);
  const agent = found || { id: agentId };

  if (!found) {
    list.push(agent);
    changed = true;
  }

  if (agentWorkspace && typeof agent.workspace !== 'string') {
    agent.workspace = agentWorkspace;
    changed = true;
  }

  if (!isPlainObject(agent.tools)) {
    agent.tools = {};
    changed = true;
  }

  const nextAlsoAllow = mergeToolList(agent.tools.alsoAllow, FEISHU_OUTBOUND_TOOL_ALLOWLIST);
  if (!Array.isArray(agent.tools.alsoAllow) || nextAlsoAllow.length !== agent.tools.alsoAllow.length) {
    agent.tools.alsoAllow = nextAlsoAllow;
    changed = true;
  }

  if (!isPlainObject(agent.tools.byProvider)) {
    agent.tools.byProvider = {};
    changed = true;
  }
  if (!isPlainObject(agent.tools.byProvider.feishu)) {
    agent.tools.byProvider.feishu = {};
    changed = true;
  }

  const providerPolicy = agent.tools.byProvider.feishu;
  const nextProviderAllow = mergeToolList(providerPolicy.alsoAllow, FEISHU_OUTBOUND_TOOL_ALLOWLIST);
  if (!Array.isArray(providerPolicy.alsoAllow) || nextProviderAllow.length !== providerPolicy.alsoAllow.length) {
    providerPolicy.alsoAllow = nextProviderAllow;
    changed = true;
  }

  return changed;
}

function getRestoreCommand(backupPath, configPath, platform) {
  if (platform === 'win32') {
    return `Copy-Item -LiteralPath "${backupPath}" -Destination "${configPath}" -Force`;
  }
  return `cp "${backupPath}" "${configPath}"`;
}

function formatSummaryLines({ configPath, accountId, mode, agentId, chatId, dryRun, setDmScope, restart }) {
  const lines = [];
  lines.push('');
  lines.push('-'.repeat(60));
  lines.push('Summary');
  lines.push(`  Config: ${configPath}`);
  lines.push(`  Account ID: ${accountId}`);
  lines.push(`  Routing mode: ${mode}`);
  lines.push(`  Dry run: ${dryRun ? 'yes' : 'no'}`);
  lines.push(`  Set dmScope: ${setDmScope ? 'yes' : 'no'}`);
  lines.push(`  Feishu outbound enable: ${agentId ? 'yes (agent tools allowlisted)' : 'no (no agent-id)'}`);
  lines.push(`  Restart gateway: ${restart ? 'yes' : 'no'}`);
  if (agentId) lines.push(`  Agent: ${agentId}`);
  if (chatId) lines.push(`  Group chat: ${chatId}`);
  lines.push('-'.repeat(60));
  lines.push('');
  return lines;
}

module.exports = {
  ensureFeishuConfig,
  ensureAgentOutboundMessagingConfig,
  upsertBinding,
  buildAccountConfig,
  getRestoreCommand,
  formatSummaryLines,
  FEISHU_OUTBOUND_TOOL_ALLOWLIST
};
