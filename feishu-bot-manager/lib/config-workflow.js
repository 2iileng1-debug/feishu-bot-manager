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

  if (options.dmpolicy) account.dmPolicy = options.dmpolicy;

  const inheritKeys = [
    'connectionMode', 'requireMention', 'dmPolicy', 'allowFrom',
    'groupAllowFrom', 'groupPolicy', 'groups', 'streaming'
  ];

  for (const key of inheritKeys) {
    if (account[key] === undefined && feishu[key] !== undefined) {
      account[key] = deepClone(feishu[key]);
    }
  }

  return account;
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
  lines.push(`  Restart gateway: ${restart ? 'yes' : 'no'}`);
  if (agentId) lines.push(`  Agent: ${agentId}`);
  if (chatId) lines.push(`  Group chat: ${chatId}`);
  lines.push('-'.repeat(60));
  lines.push('');
  return lines;
}

module.exports = {
  ensureFeishuConfig,
  upsertBinding,
  buildAccountConfig,
  getRestoreCommand,
  formatSummaryLines
};
