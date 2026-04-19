function handleHelpOption({ options, renderHelp }) {
  if (options.help || options.h) {
    renderHelp();
    return true;
  }
  return false;
}

function resolveWizardState({ options, parseBoolean }) {
  return {
    hasCredentials: Boolean(options.appid && options.appsecret),
    wizardEnabled: parseBoolean(options.wizard, true)
  };
}

async function maybeRunWizard({
  mergedOptions,
  hasCredentials,
  wizardEnabled,
  log,
  feishuCreateUrl,
  runPreflightWizard,
  parseBoolean,
  createAgentFromPlan,
  stdinIsTTY
}) {
  if (hasCredentials) {
    return { options: mergedOptions, shouldExit: false };
  }

  if (!wizardEnabled) {
    log.error('Missing --app-id/--app-secret and wizard is disabled.');
    console.log(`Create Feishu bot first: ${feishuCreateUrl}`);
    return { options: mergedOptions, shouldExit: true, exitCode: 1 };
  }

  if (!stdinIsTTY) {
    log.error('Interactive wizard requires a TTY. Please run in an interactive terminal.');
    console.log(`Create Feishu bot first: ${feishuCreateUrl}`);
    return { options: mergedOptions, shouldExit: true, exitCode: 1 };
  }

  const optionsFromWizard = await runPreflightWizard({
    baseOptions: mergedOptions,
    log,
    parseBoolean,
    createAgentFromPlan,
    feishuCreateUrl
  });

  if (!optionsFromWizard.appid || !optionsFromWizard.appsecret) {
    log.warning('No app credentials collected. Exiting without config changes.');
    return { options: optionsFromWizard, shouldExit: true, exitCode: 0 };
  }

  return { options: optionsFromWizard, shouldExit: false };
}

module.exports = {
  handleHelpOption,
  resolveWizardState,
  maybeRunWizard
};
