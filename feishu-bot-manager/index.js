#!/usr/bin/env node
/**
 * feishu-bot-manager (cross-platform + preflight workflow)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

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

const HOME_DIR = process.env.HOME || process.env.USERPROFILE || os.homedir();
const CONFIG_PATH = process.env.OPENCLAW_CONFIG_PATH || path.join(HOME_DIR, '.openclaw', 'openclaw.json');
const BACKUP_DIR = path.join(path.dirname(CONFIG_PATH), 'backups');
const OPENCLAW_BIN = process.platform === 'win32' ? 'openclaw.cmd' : 'openclaw';
const DMSCOPE_VALUE = 'per-account-channel-peer';
const FEISHU_CREATE_URL = 'https://open.feishu.cn/page/openclaw?form=multiAgent';

let OPENCLAW_PROFILE = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[OK]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERR]${colors.reset} ${msg}`),
  preview: (msg) => console.log(`${colors.gray}${msg}${colors.reset}`),
  bold: (msg) => console.log(`${colors.bold}${msg}${colors.reset}`)
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2).replace(/-/g, '');
    const hasNext = args[i + 1] && !args[i + 1].startsWith('--');
    const value = hasNext ? args[i + 1] : 'true';
    options[key] = value;
    if (hasNext) i++;
  }

  return options;
}

function withOpenClawProfile(args) {
  if (!OPENCLAW_PROFILE) return args;
  return ['--profile', OPENCLAW_PROFILE, ...args];
}

function quoteWindowsArg(arg) {
  const text = String(arg);
  if (/^[a-zA-Z0-9._:/=-]+$/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function runOpenClaw(args, opts = {}) {
  const finalArgs = withOpenClawProfile(args);
  let child;

  if (process.platform === 'win32') {
    const command = [OPENCLAW_BIN, ...finalArgs.map(quoteWindowsArg)].join(' ');
    child = spawnSync('cmd.exe', ['/d', '/s', '/c', command], {
      encoding: 'utf8',
      shell: false,
      stdio: opts.stdio || 'pipe',
      env: opts.env || process.env
    });
  } else {
    child = spawnSync(OPENCLAW_BIN, finalArgs, {
      encoding: 'utf8',
      shell: false,
      stdio: opts.stdio || 'pipe',
      env: opts.env || process.env
    });
  }

  return {
    code: child ? child.status : 1,
    error: child ? child.error || null : new Error('failed to spawn openclaw'),
    stdout: child ? child.stdout || '' : '',
    stderr: child ? child.stderr || '' : ''
  };
}

function extractJsonObject(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (_) {
    // Continue with mixed-output extraction.
  }

  const start = text.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') depth--;

    if (depth === 0) {
      const snippet = text.slice(start, i + 1);
      try {
        return JSON.parse(snippet);
      } catch (_) {
        return null;
      }
    }
  }

  return null;
}

function loadConfig() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    log.error(`Failed to read config: ${err.message}`);
    log.info(`Config path: ${CONFIG_PATH}`);
    process.exit(1);
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  } catch (err) {
    log.error(`Failed to write config: ${err.message}`);
    process.exit(1);
  }
}

function createBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `openclaw.json.${timestamp}.bak`);
    fs.copyFileSync(CONFIG_PATH, backupPath);
    return backupPath;
  } catch (err) {
    log.error(`Failed to create backup: ${err.message}`);
    process.exit(1);
  }
}

function validateWithOpenClawSchema(config) {
  const tempPath = path.join(path.dirname(CONFIG_PATH), `.openclaw.validate.${Date.now()}.${process.pid}.json`);
  fs.writeFileSync(tempPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  try {
    const env = { ...process.env, OPENCLAW_CONFIG_PATH: tempPath };
    const result = runOpenClaw(['config', 'validate', '--json'], { env });

    if (result.error) {
      return {
        valid: false,
        issues: [{ path: 'config', message: `Failed to run ${OPENCLAW_BIN}: ${result.error.message}` }]
      };
    }

    const parsed = extractJsonObject(`${result.stdout}\n${result.stderr}`);
    if (parsed && typeof parsed.valid === 'boolean') {
      return {
        valid: parsed.valid,
        issues: Array.isArray(parsed.issues) ? parsed.issues : []
      };
    }

    if (result.code === 0) return { valid: true, issues: [] };
    return {
      valid: false,
      issues: [{ path: 'config', message: `Unable to parse openclaw validate output: ${(result.stderr || result.stdout || '').trim()}` }]
    };
  } finally {
    try {
      fs.unlinkSync(tempPath);
    } catch (_) {
      // ignore temp cleanup errors
    }
  }
}

function printSummary({ accountId, mode, agentId, chatId, dryRun, setDmScope, restart }) {
  const lines = formatSummaryLines({
    configPath: CONFIG_PATH,
    accountId,
    mode,
    agentId,
    chatId,
    dryRun,
    setDmScope,
    restart
  });

  for (const line of lines) {
    if (line === 'Summary') log.bold(line);
    else console.log(line);
  }
}

function quickMode(options) {
  log.info('Applying Feishu account/binding configuration...');

  const mode = options.routingmode || 'account';
  const accountId = options.accountid || `bot-${Date.now()}`;
  const dryRun = parseBoolean(options.dryrun, false);
  const restart = parseBoolean(options.restart, false);
  const setDmScope = parseBoolean(options.setdmscope, false);

  if (!options.appid || !options.appsecret) {
    log.error('Missing required args: --app-id and --app-secret');
    process.exit(1);
  }
  if (!validateAppId(options.appid)) {
    log.error('Invalid App ID format, expected cli_xxx');
    process.exit(1);
  }
  if (!validateAccountId(accountId)) {
    log.error('Invalid account-id format, expected lowercase letters/numbers/hyphen');
    process.exit(1);
  }
  if (!validateRoutingMode(mode)) {
    log.error('routing-mode must be account or group');
    process.exit(1);
  }
  if (options.dmpolicy && !validateDmPolicy(options.dmpolicy)) {
    log.error('dm-policy must be open/pairing/allowlist');
    process.exit(1);
  }
  if (mode === 'group') {
    if (!options.chatid) {
      log.error('group routing requires --chat-id');
      process.exit(1);
    }
    if (!validateChatId(options.chatid)) {
      log.error('Invalid chat-id format, expected oc_xxx');
      process.exit(1);
    }
  }

  const config = loadConfig();
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

  const schemaResult = validateWithOpenClawSchema(candidate);
  if (!schemaResult.valid) {
    log.error('OpenClaw schema validation failed. Write blocked.');
    for (const issue of schemaResult.issues) {
      log.preview(`  - ${issue.path || 'unknown'}: ${issue.message || 'invalid'}`);
    }
    process.exit(1);
  }

  printSummary({ accountId, mode, agentId: options.agentid, chatId: options.chatid, dryRun, setDmScope, restart });

  if (dryRun) {
    log.warning('Dry run only. No files were modified.');
    return;
  }

  const backupPath = createBackup();
  saveConfig(candidate);
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


function createReadline() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, (answer) => resolve(String(answer || '').trim())));
}

function isDonePhrase(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['可以了', 'ok', 'done', 'enough', '结束', '完成'].includes(normalized);
}

async function askYesNo(rl, prompt, fallback = true) {
  const answer = await ask(rl, prompt);
  if (!answer) return fallback;
  return parseBoolean(answer, fallback);
}

async function askRequired(rl, prompt, opts = {}) {
  const allowSkip = parseBoolean(opts.allowSkip, false);
  const skipWords = opts.skipWords || ['skip', 'later', '稍后', '跳过', '退出'];

  while (true) {
    const answer = await ask(rl, prompt);
    if (answer) return answer;
    if (allowSkip) return '';

    const choice = await ask(rl, '当前为空。继续等待输入请回车，输入 skip 可跳过: ');
    if (skipWords.includes(choice.toLowerCase())) return '';
  }
}

function summarizeRequirementNotes(fields, extras) {
  const notes = [
    `目标: ${fields.goal || '(none)'}`,
    `输入: ${fields.inputs || '(none)'}`,
    `输出: ${fields.outputs || '(none)'}`,
    `边界: ${fields.boundaries || '(none)'}`,
    `工具/技能: ${fields.tools || '(none)'}`,
    `节奏/频率: ${fields.schedule || '(none)'}`
  ];

  for (const item of extras) notes.push(`补充: ${item}`);
  return notes;
}

async function collectRequirementPlan(rl, mode) {
  if (mode === 'direct') {
    const directRequirement = await askRequired(rl, '请直接描述这个 Agent 要做什么（可一句话）: ');
    const successDefinition = await askRequired(rl, '这个 Agent 的成功标准是什么？: ', { allowSkip: true });
    return { mode: 'direct', coreRequirement: directRequirement, notes: [], successDefinition, boundaries: '' };
  }

  log.info('进入“先梳理工作内容”模式，我会多轮提问直到你说“可以了”。');

  const fields = {};
  fields.goal = await askRequired(rl, '1) 这个 Agent 的主要目标是什么？: ');
  fields.inputs = await askRequired(rl, '2) 它主要处理哪些输入来源？: ', { allowSkip: true });
  fields.outputs = await askRequired(rl, '3) 你希望它输出什么结果（格式/标准）？: ', { allowSkip: true });
  fields.boundaries = await askRequired(rl, '4) 明确不能做什么（边界/风险）？: ', { allowSkip: true });
  fields.tools = await askRequired(rl, '5) 需要使用哪些工具或技能？: ', { allowSkip: true });
  fields.schedule = await askRequired(rl, '6) 工作频率或触发节奏是什么？: ', { allowSkip: true });

  const extras = [];
  let round = 1;

  while (round <= 8) {
    const more = await ask(rl, `补充轮次 ${round}：继续补充请直接输入，若已足够请输入“可以了”: `);
    if (!more || isDonePhrase(more)) break;
    extras.push(more);

    const shouldDeepen = await askYesNo(rl, '我再追问一个关键细节来帮助落地吗？(Y/n): ', true);
    if (shouldDeepen) {
      const detail = await askRequired(rl, '请补充一个“必须做到/必须避免”的关键约束: ', { allowSkip: true });
      if (detail) extras.push(`关键约束: ${detail}`);
    }

    round++;
  }

  const successDefinition = await askRequired(rl, '最后确认：你最看重的成功指标（1-2 条）是什么？: ', { allowSkip: true });
  return {
    mode: 'requirement-first',
    coreRequirement: fields.goal,
    notes: summarizeRequirementNotes(fields, extras),
    successDefinition,
    boundaries: fields.boundaries || ''
  };
}


function createAgentFromPlan(plan, options) {
  const rawAgentId = options.agentid || options.newagentid || options.agentname || '';
  const agentId = sanitizeAgentId(rawAgentId || plan.coreRequirement);

  if (!validateAgentId(agentId)) {
    throw new Error(`Invalid generated agent id: ${agentId}`);
  }

  const workspace = options.agentworkspace || defaultWorkspaceForAgent(HOME_DIR, agentId);
  ensureDir(workspace);

  const addArgs = ['agents', 'add', agentId, '--workspace', workspace, '--non-interactive', '--json'];
  if (options.model) addArgs.push('--model', options.model);

  const addResult = runOpenClaw(addArgs);
  const addOutput = `${addResult.stdout}\n${addResult.stderr}`;
  const addParsed = parseAgentAddResult(extractJsonObject, addOutput);

  if (addResult.error || addResult.code !== 0 || !addParsed) {
    throw new Error(`Failed to create agent. Output:\n${addOutput}`);
  }

  const identityName = options.agentdisplayname || options.agentname || agentId;
  const setIdentityArgs = ['agents', 'set-identity', '--agent', agentId, '--workspace', workspace, '--name', identityName, '--json'];
  const setIdentityResult = runOpenClaw(setIdentityArgs);
  if (setIdentityResult.error || setIdentityResult.code !== 0) {
    log.warning('Agent created, but set-identity failed. You can run it manually later.');
  }

  bootstrapGovernanceAndMemory(plan, { agentId, workspace });
  return { agentId, workspace };
}

async function runPreflightWizard(baseOptions) {
  const rl = createReadline();
  const merged = { ...baseOptions };

  try {
    log.bold('Preflight Workflow');
    console.log('在读取 --app-id/--app-secret 前，先执行创建 Agent 的前置流程。');

    const needCreateAgent = await askYesNo(rl, '你现在要创建 Agent 吗？(Y/n): ', true);

    if (needCreateAgent) {
      const modeAnswer = await ask(rl, '请选择创建方式：1) 直接创建  2) 先梳理工作内容再创建  [默认 2]: ');
      const mode = modeAnswer === '1' ? 'direct' : 'requirement-first';
      const plan = await collectRequirementPlan(rl, mode);

      const agentName = await askRequired(rl, '请输入 Agent 名称或 ID（英文建议，留空则自动生成）: ', { allowSkip: true });
      if (agentName) {
        merged.agentname = agentName;
        merged.newagentid = agentName;
      }

      const agentWorkspace = await askRequired(rl, '可选：请输入 Agent workspace 路径（留空使用默认路径）: ', { allowSkip: true });
      if (agentWorkspace) merged.agentworkspace = agentWorkspace;

      const model = await askRequired(rl, '可选：模型 ID（留空使用默认）: ', { allowSkip: true });
      if (model) merged.model = model;

      log.info('开始创建 Agent 并注入治理/记忆基线...');
      const created = createAgentFromPlan(plan, merged);
      merged.agentid = created.agentId;
      log.success(`Agent created: ${created.agentId}`);
      log.success(`Workspace: ${created.workspace}`);
      log.info('已完成：灵魂/身份确认闸门、禁止只口头不执行、治理确认规则、每日+长期记忆基线。');
    } else {
      log.info('跳过 Agent 创建流程。');
    }

    log.bold('Feishu Bot Creation Link');
    console.log(FEISHU_CREATE_URL);
    console.log('请先在上面页面创建机器人，然后继续输入凭据。');

    const appId = await askRequired(rl, '请输入 --app-id (cli_xxx): ');
    const appSecret = await askRequired(rl, '请输入 --app-secret: ');
    merged.appid = appId;
    merged.appsecret = appSecret;

    const accountId = await askRequired(rl, '可选：请输入 --account-id（留空自动生成）: ', { allowSkip: true });
    if (accountId) merged.accountid = accountId;

    const botName = await askRequired(rl, '可选：请输入 --bot-name（留空默认 Feishu Bot）: ', { allowSkip: true });
    if (botName) merged.botname = botName;

    const routingMode = await ask(rl, '路由模式：account/group（默认 account）: ');
    merged.routingmode = routingMode === 'group' ? 'group' : 'account';

    if (merged.routingmode === 'group') {
      const chatId = await askRequired(rl, '请输入 --chat-id (oc_xxx): ');
      merged.chatid = chatId;
    }

    if (!merged.agentid) {
      const existingAgentId = await askRequired(rl, '可选：请输入 --agent-id（留空则只新增账户，不绑路由）: ', { allowSkip: true });
      if (existingAgentId) merged.agentid = existingAgentId;
    } else {
      const useCreatedAgent = await askYesNo(rl, `默认将路由绑定到新建 Agent "${merged.agentid}"，是否确认？(Y/n): `, true);
      if (!useCreatedAgent) {
        const overrideId = await askRequired(rl, '请输入替代 --agent-id: ');
        merged.agentid = overrideId;
      }
    }

    const dryRun = await askYesNo(rl, '先执行 dry-run 校验？(Y/n): ', true);
    merged.dryrun = dryRun ? 'true' : 'false';

    if (!dryRun) {
      const restart = await askYesNo(rl, '写入后自动重启 Gateway 吗？(y/N): ', false);
      merged.restart = restart ? 'true' : 'false';
    } else {
      merged.restart = 'false';
    }

    return merged;
  } finally {
    rl.close();
  }
}

function showRoutingOptions() {
  console.log(`
${colors.bold}Routing Modes${colors.reset}

${colors.bold}1) account${colors.reset}
  Route all messages from one Feishu account to one Agent.

${colors.bold}2) group${colors.reset}
  Route one Feishu group (peer.id = oc_xxx) to one Agent.

Group routing usually has higher matching priority than account routing.
`);
}

function showHelp() {
  showRoutingOptions();
  console.log(`
${colors.bold}Usage:${colors.reset}
  node index.js [options]

${colors.bold}Main Flow:${colors.reset}
  - If --app-id/--app-secret are missing, script starts preflight wizard:
    1) Agent creation workflow (direct / requirement-first)
    2) Governance + memory bootstrap for created agent
    3) Show Feishu creation link and wait for credentials
  - Then applies Feishu account/binding config safely.

${colors.bold}Required for config write:${colors.reset}
  --app-id <id>           Feishu App ID (cli_xxx)
  --app-secret <secret>   Feishu App Secret

${colors.bold}Optional:${colors.reset}
  --account-id <id>       Account identifier (default: bot-<timestamp>)
  --bot-name <name>       Bot display name (writes field: name)
  --dm-policy <policy>    open/pairing/allowlist
  --agent-id <id>         Agent ID for route binding
  --routing-mode <mode>   account/group (default: account)
  --chat-id <id>          Group chat ID (required when routing-mode=group)
  --dry-run               Validate only, no write
  --set-dm-scope          Run: openclaw config set session.dmScope "${DMSCOPE_VALUE}"
  --restart               Restart gateway after write
  --wizard <bool>         Enable/disable interactive preflight when credentials are missing (default: true)
  --openclaw-profile <p>  Optional openclaw profile (useful for testing)
  --agent-workflow <m>    Reserved: direct/requirement-first (wizard hints)
  --new-agent-id <id>     Reserved: pre-specified new agent id for wizard
  --agent-workspace <dir> Reserved: pre-specified workspace for wizard
  --help, -h              Show help

${colors.bold}Examples:${colors.reset}
  1) Fully guided preflight (recommended):
     node index.js

  2) Direct dry-run write path:
     node index.js --app-id cli_xxx --app-secret yyy --agent-id recruiter --routing-mode account --dry-run

  3) Isolated profile test:
     node index.js --openclaw-profile test --wizard true
`);
}

async function main() {
  const options = parseArgs();

  if (options.help || options.h) {
    showHelp();
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

    mergedOptions = await runPreflightWizard(mergedOptions);
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
