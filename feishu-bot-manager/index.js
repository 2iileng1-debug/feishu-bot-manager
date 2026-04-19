#!/usr/bin/env node
/**
 * feishu-bot-manager (cross-platform + preflight workflow)
 */

const os = require('os');
const path = require('path');

const {
  validateAppId,
  validateAccountId,
  validateChatId,
  validateDmPolicy,
  validateRoutingMode,
  validateAgentId,
  validateConfig
} = require('./lib/validator');
const {
  sanitizeAgentId,
  ensureDir,
  bootstrapGovernanceAndMemory,
  defaultWorkspaceForAgent,
  parseAgentAddResult
} = require('./lib/workspace-bootstrap');
const {
  ensureFeishuConfig,
  upsertBinding,
  buildAccountConfig,
  getRestoreCommand,
  formatSummaryLines
} = require('./lib/config-workflow');
const { runPreflightWizard } = require('./lib/wizard');
const { quoteWindowsArg, extractJsonObject, createOpenClawRunner } = require('./lib/openclaw-runtime');
const { loadConfig, saveConfig, createBackup, validateWithOpenClawSchema } = require('./lib/config-store');
const { colors, log, deepClone, parseBoolean, parseArgs } = require('./lib/cli-helpers');
const { printSummary, showHelp } = require('./lib/output');
const { getQuickModeSettings, validateQuickModeOptions } = require('./lib/quick-mode');
const { resolveAgentPlanContext, createAgentViaOpenClaw, setAgentIdentity } = require('./lib/agent-plan');

const HOME_DIR = process.env.HOME || process.env.USERPROFILE || os.homedir();
const CONFIG_PATH = process.env.OPENCLAW_CONFIG_PATH || path.join(HOME_DIR, '.openclaw', 'openclaw.json');
const BACKUP_DIR = path.join(path.dirname(CONFIG_PATH), 'backups');
const OPENCLAW_BIN = process.platform === 'win32' ? 'openclaw.cmd' : 'openclaw';
const DMSCOPE_VALUE = 'per-account-channel-peer';
const FEISHU_CREATE_URL = 'https://open.feishu.cn/page/openclaw?form=multiAgent';

let OPENCLAW_PROFILE = '';

const { runOpenClaw } = createOpenClawRunner({
  openclawBin: OPENCLAW_BIN,
  platform: process.platform,
  getProfile: () => OPENCLAW_PROFILE,
  envBase: process.env
});

function safeLoadConfig() {
  try {
    return loadConfig(CONFIG_PATH);
  } catch (err) {
    log.error(`Failed to read config: ${err.message}`);
    log.info(`Config path: ${CONFIG_PATH}`);
    process.exit(1);
  }
}

function safeSaveConfig(config) {
  try {
    saveConfig(CONFIG_PATH, config);
  } catch (err) {
    log.error(`Failed to write config: ${err.message}`);
    process.exit(1);
  }
}

function safeCreateBackup() {
  try {
    return createBackup(CONFIG_PATH, BACKUP_DIR);
  } catch (err) {
    log.error(`Failed to create backup: ${err.message}`);
    process.exit(1);
  }
}

function safeValidateWithOpenClawSchema(config) {
  return validateWithOpenClawSchema({
    config,
    configPath: CONFIG_PATH,
    runOpenClaw,
    extractJsonObject,
    openclawBin: OPENCLAW_BIN,
    envBase: process.env
  });
}

function renderSummary(args) {
  printSummary({
    formatSummaryLines,
    log,
    configPath: CONFIG_PATH,
    ...args
  });
}

function quickMode(options) {
  log.info('Applying Feishu account/binding configuration...');

  const { mode, accountId, dryRun, restart, setDmScope } = getQuickModeSettings(options, parseBoolean);

  try {
    validateQuickModeOptions({
      options,
      mode,
      accountId,
      validateAppId,
      validateAccountId,
      validateRoutingMode,
      validateDmPolicy,
      validateChatId
    });
  } catch (err) {
    log.error(err.message);
    process.exit(1);
  }

  const config = safeLoadConfig();
  const candidate = deepClone(config);
  ensureFeishuConfig(candidate);

  const accountConfig = buildAccountConfig(options, candidate.channels.feishu, deepClone);
  candidate.channels.feishu.accounts[accountId] = accountConfig;

  if (options.agentid) {
    if (mode === 'account') {
      upsertBinding(candidate, {
        type: 'route',
        agentId: options.agentid,
        match: { channel: 'feishu', accountId }
      });
      log.success(`Prepared account routing: ${options.agentid} <- ${accountId}`);
    } else {
      upsertBinding(candidate, {
        type: 'route',
        agentId: options.agentid,
        match: {
          channel: 'feishu',
          peer: { kind: 'group', id: options.chatid }
        }
      });
      log.success(`Prepared group routing: ${options.agentid} <- ${options.chatid}`);
    }
  } else {
    log.warning('No --agent-id supplied, only account config will be updated.');
  }

  const localErrors = validateConfig(candidate);
  if (localErrors.length > 0) {
    log.error('Local validation failed:');
    localErrors.forEach((item) => log.preview(`  - ${item}`));
    process.exit(1);
  }

  const schemaResult = safeValidateWithOpenClawSchema(candidate);
  if (!schemaResult.valid) {
    log.error('OpenClaw schema validation failed. Write blocked.');
    for (const issue of schemaResult.issues) {
      log.preview(`  - ${issue.path || 'unknown'}: ${issue.message || 'invalid'}`);
    }
    process.exit(1);
  }

  renderSummary({ accountId, mode, agentId: options.agentid, chatId: options.chatid, dryRun, setDmScope, restart });

  if (dryRun) {
    log.warning('Dry run only. No files were modified.');
    return;
  }

  const backupPath = safeCreateBackup();
  safeSaveConfig(candidate);
  log.success(`Config written: ${CONFIG_PATH}`);
  log.success(`Backup created: ${backupPath}`);

  if (setDmScope) {
    const result = runOpenClaw(['config', 'set', 'session.dmScope', DMSCOPE_VALUE]);
    if (result.error || result.code !== 0) {
      log.warning('Failed to set dmScope automatically. Please run manually:');
      console.log(`  openclaw config set session.dmScope "${DMSCOPE_VALUE}"`);
    } else {
      log.success(`dmScope set to ${DMSCOPE_VALUE}`);
    }
  }

  if (restart) {
    log.warning('Restarting gateway...');
    const result = runOpenClaw(['gateway', 'restart'], { stdio: 'inherit' });
    if (result.error || result.code !== 0) {
      log.warning('Gateway restart failed. Please run manually: openclaw gateway restart');
    } else {
      log.success('Gateway restarted.');
    }
  } else {
    log.info('Gateway restart skipped. Run manually if needed: openclaw gateway restart');
  }

  console.log('Rollback command:');
  console.log(`  ${getRestoreCommand(backupPath, CONFIG_PATH, process.platform)}`);
}


function createAgentFromPlan(plan, options) {
  const { agentId, workspace } = resolveAgentPlanContext({
    plan,
    options,
    sanitizeAgentId,
    validateAgentId,
    defaultWorkspaceForAgent,
    homeDir: HOME_DIR
  });

  ensureDir(workspace);

  createAgentViaOpenClaw({
    agentId,
    workspace,
    model: options.model,
    runOpenClaw,
    extractJsonObject,
    parseAgentAddResult
  });

  const identityName = options.agentdisplayname || options.agentname || agentId;
  const setIdentityResult = setAgentIdentity({
    agentId,
    workspace,
    identityName,
    runOpenClaw
  });
  if (setIdentityResult.error || setIdentityResult.code !== 0) {
    log.warning('Agent created, but set-identity failed. You can run it manually later.');
  }

  bootstrapGovernanceAndMemory(plan, { agentId, workspace });
  return { agentId, workspace };
}

function renderHelp() {
  showHelp({
    colors,
    dmscopeValue: DMSCOPE_VALUE,
    feishuCreateUrl: FEISHU_CREATE_URL
  });
}

async function main() {
  const options = parseArgs();

  if (options.help || options.h) {
    renderHelp();
    process.exit(0);
  }

  OPENCLAW_PROFILE = (options.openclawprofile || '').trim();

  const hasCredentials = Boolean(options.appid && options.appsecret);
  const wizardEnabled = parseBoolean(options.wizard, true);

  let mergedOptions = { ...options };

  if (!hasCredentials) {
    if (!wizardEnabled) {
      log.error('Missing --app-id/--app-secret and wizard is disabled.');
      console.log(`Create Feishu bot first: ${FEISHU_CREATE_URL}`);
      process.exit(1);
    }

    if (!process.stdin.isTTY) {
      log.error('Interactive wizard requires a TTY. Please run in an interactive terminal.');
      console.log(`Create Feishu bot first: ${FEISHU_CREATE_URL}`);
      process.exit(1);
    }

    mergedOptions = await runPreflightWizard({
      baseOptions: mergedOptions,
      log,
      parseBoolean,
      createAgentFromPlan,
      feishuCreateUrl: FEISHU_CREATE_URL
    });
    if (!mergedOptions.appid || !mergedOptions.appsecret) {
      log.warning('No app credentials collected. Exiting without config changes.');
      process.exit(0);
    }
  }

  quickMode(mergedOptions);
}

main().catch((err) => {
  log.error(err && err.message ? err.message : String(err));
  process.exit(1);
});
