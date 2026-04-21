function getQuickModeSettings(options, parseBoolean) {
  return {
    mode: options.routingmode || 'account',
    accountId: options.accountid || `bot-${Date.now()}`,
    dryRun: parseBoolean(options.dryrun, false),
    restart: parseBoolean(options.restart, false),
    setDmScope: parseBoolean(options.setdmscope, false)
  };
}

function validateQuickModeOptions({
  options,
  mode,
  accountId,
  validateAppId,
  validateAccountId,
  validateRoutingMode,
  validateDmPolicy,
  validateChatId
}) {
  if (!options.appid || !options.appsecret) {
    throw new Error('Missing required args: --app-id and --app-secret');
  }
  if (!validateAppId(options.appid)) {
    throw new Error('Invalid App ID format, expected cli_xxx');
  }
  if (!validateAccountId(accountId)) {
    throw new Error('Invalid account-id format, expected lowercase letters/numbers/hyphen');
  }
  if (!validateRoutingMode(mode)) {
    throw new Error('routing-mode must be account or group');
  }
  if (options.dmpolicy && !validateDmPolicy(options.dmpolicy)) {
    throw new Error('dm-policy must be open');
  }
  if (options.dmpolicy && options.dmpolicy !== 'open') {
    throw new Error('dm-policy is fixed to open for account creation');
  }
  if (mode === 'group') {
    if (!options.chatid) {
      throw new Error('group routing requires --chat-id');
    }
    if (!validateChatId(options.chatid)) {
      throw new Error('Invalid chat-id format, expected oc_xxx');
    }
  }
}

module.exports = {
  getQuickModeSettings,
  validateQuickModeOptions
};
