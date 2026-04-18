/**
 * Validation helpers for feishu-bot-manager.
 */

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateAppId(appId) {
  return /^cli_[a-zA-Z0-9]+$/.test(String(appId || ''));
}

function validateAccountId(id) {
  return /^[a-z0-9-]+$/.test(String(id || ''));
}

function validateChatId(id) {
  return /^oc_[a-zA-Z0-9]+$/.test(String(id || ''));
}

function validateUserId(id) {
  return /^ou_[a-zA-Z0-9]+$/.test(String(id || ''));
}

function validateAgentId(id) {
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(String(id || ''));
}

function validateDmPolicy(policy) {
  return ['open', 'pairing', 'allowlist'].includes(String(policy || ''));
}

function validateRoutingMode(mode) {
  return ['account', 'group'].includes(String(mode || ''));
}

function validateConfig(config) {
  const errors = [];

  if (!isPlainObject(config)) {
    errors.push('Config object is invalid.');
    return errors;
  }

  if (!isPlainObject(config.channels) || !isPlainObject(config.channels.feishu)) {
    errors.push('Missing channels.feishu config.');
    return errors;
  }

  const feishu = config.channels.feishu;
  const accounts = isPlainObject(feishu.accounts) ? feishu.accounts : {};

  for (const [accountId, account] of Object.entries(accounts)) {
    if (!validateAccountId(accountId)) {
      errors.push(`Invalid account ID: ${accountId}`);
    }
    if (!isPlainObject(account)) continue;

    if (account.appId !== undefined && !validateAppId(account.appId)) {
      errors.push(`[${accountId}] invalid appId: ${account.appId}`);
    }
    if (account.appId !== undefined && !account.appSecret) {
      errors.push(`[${accountId}] appSecret is required when appId is set.`);
    }
    if (account.dmPolicy !== undefined && !validateDmPolicy(account.dmPolicy)) {
      errors.push(`[${accountId}] dmPolicy must be open/pairing/allowlist.`);
    }
    if (account.allowFrom !== undefined && !Array.isArray(account.allowFrom)) {
      errors.push(`[${accountId}] allowFrom must be an array.`);
    }
    if (account.groupAllowFrom !== undefined && !Array.isArray(account.groupAllowFrom)) {
      errors.push(`[${accountId}] groupAllowFrom must be an array.`);
    }
  }

  const bindings = Array.isArray(config.bindings) ? config.bindings : [];
  for (const binding of bindings) {
    if (!isPlainObject(binding) || !isPlainObject(binding.match)) continue;
    if (binding.match.channel !== 'feishu') continue;

    if (!binding.agentId) {
      errors.push('A feishu binding is missing agentId.');
      continue;
    }

    if (binding.match.accountId) {
      if (!validateAccountId(binding.match.accountId)) {
        errors.push(`Invalid binding.accountId: ${binding.match.accountId}`);
      }
      continue;
    }

    if (binding.match.peer) {
      const peer = binding.match.peer;
      if (peer.kind !== 'group') {
        errors.push('feishu binding.peer.kind must be group.');
      }
      if (!validateChatId(peer.id)) {
        errors.push(`Invalid binding.peer.id: ${peer.id}`);
      }
      continue;
    }

    errors.push('Feishu binding must include either accountId or peer.');
  }

  return errors;
}

module.exports = {
  validateAppId,
  validateAccountId,
  validateChatId,
  validateUserId,
  validateAgentId,
  validateDmPolicy,
  validateRoutingMode,
  validateConfig
};
