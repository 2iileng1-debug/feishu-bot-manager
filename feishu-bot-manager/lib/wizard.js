const readline = require('readline');

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

async function askYesNo(rl, prompt, parseBoolean, fallback = true) {
  const answer = await ask(rl, prompt);
  if (!answer) return fallback;
  return parseBoolean(answer, fallback);
}

async function askRequired(rl, prompt, parseBoolean, opts = {}) {
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

async function collectRequirementPlan({ rl, mode, log, parseBoolean }) {
  if (mode === 'direct') {
    const directRequirement = await askRequired(rl, '请直接描述这个 Agent 要做什么（可一句话）: ', parseBoolean);
    const successDefinition = await askRequired(rl, '这个 Agent 的成功标准是什么？: ', parseBoolean, { allowSkip: true });
    return { mode: 'direct', coreRequirement: directRequirement, notes: [], successDefinition, boundaries: '' };
  }

  log.info('进入“先梳理工作内容”模式，我会多轮提问直到你说“可以了”。');

  const fields = {};
  fields.goal = await askRequired(rl, '1) 这个 Agent 的主要目标是什么？: ', parseBoolean);
  fields.inputs = await askRequired(rl, '2) 它主要处理哪些输入来源？: ', parseBoolean, { allowSkip: true });
  fields.outputs = await askRequired(rl, '3) 你希望它输出什么结果（格式/标准）？: ', parseBoolean, { allowSkip: true });
  fields.boundaries = await askRequired(rl, '4) 明确不能做什么（边界/风险）？: ', parseBoolean, { allowSkip: true });
  fields.tools = await askRequired(rl, '5) 需要使用哪些工具或技能？: ', parseBoolean, { allowSkip: true });
  fields.schedule = await askRequired(rl, '6) 工作频率或触发节奏是什么？: ', parseBoolean, { allowSkip: true });

  const extras = [];
  let round = 1;

  while (round <= 8) {
    const more = await ask(rl, `补充轮次 ${round}：继续补充请直接输入，若已足够请输入“可以了”: `);
    if (!more || isDonePhrase(more)) break;
    extras.push(more);

    const shouldDeepen = await askYesNo(rl, '我再追问一个关键细节来帮助落地吗？(Y/n): ', parseBoolean, true);
    if (shouldDeepen) {
      const detail = await askRequired(rl, '请补充一个“必须做到/必须避免”的关键约束: ', parseBoolean, { allowSkip: true });
      if (detail) extras.push(`关键约束: ${detail}`);
    }

    round++;
  }

  const successDefinition = await askRequired(rl, '最后确认：你最看重的成功指标（1-2 条）是什么？: ', parseBoolean, { allowSkip: true });
  return {
    mode: 'requirement-first',
    coreRequirement: fields.goal,
    notes: summarizeRequirementNotes(fields, extras),
    successDefinition,
    boundaries: fields.boundaries || ''
  };
}

async function runPreflightWizard({
  baseOptions,
  log,
  parseBoolean,
  createAgentFromPlan,
  feishuCreateUrl
}) {
  const rl = createReadline();
  const merged = { ...baseOptions };

  try {
    log.bold('Preflight Workflow');
    console.log('在读取 --app-id/--app-secret 前，先执行创建 Agent 的前置流程。');

    const needCreateAgent = await askYesNo(rl, '你现在要创建 Agent 吗？(Y/n): ', parseBoolean, true);

    if (needCreateAgent) {
      const modeAnswer = await ask(rl, '请选择创建方式：1) 直接创建  2) 先梳理工作内容再创建  [默认 2]: ');
      const mode = modeAnswer === '1' ? 'direct' : 'requirement-first';
      const plan = await collectRequirementPlan({ rl, mode, log, parseBoolean });

      const agentName = await askRequired(rl, '请输入 Agent 名称或 ID（英文建议，留空则自动生成）: ', parseBoolean, { allowSkip: true });
      if (agentName) {
        merged.agentname = agentName;
        merged.newagentid = agentName;
      }

      const agentWorkspace = await askRequired(rl, '可选：请输入 Agent workspace 路径（留空使用默认路径）: ', parseBoolean, { allowSkip: true });
      if (agentWorkspace) merged.agentworkspace = agentWorkspace;

      const model = await askRequired(rl, '可选：模型 ID（留空使用默认）: ', parseBoolean, { allowSkip: true });
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
    console.log(feishuCreateUrl);
    console.log('请先在上面页面创建机器人，然后继续输入凭据。');

    const appId = await askRequired(rl, '请输入 --app-id (cli_xxx): ', parseBoolean);
    const appSecret = await askRequired(rl, '请输入 --app-secret: ', parseBoolean);
    merged.appid = appId;
    merged.appsecret = appSecret;

    const accountId = await askRequired(rl, '可选：请输入 --account-id（留空自动生成）: ', parseBoolean, { allowSkip: true });
    if (accountId) merged.accountid = accountId;

    const botName = await askRequired(rl, '可选：请输入 --bot-name（留空默认 Feishu Bot）: ', parseBoolean, { allowSkip: true });
    if (botName) merged.botname = botName;

    const routingMode = await ask(rl, '路由模式：account/group（默认 account）: ');
    merged.routingmode = routingMode === 'group' ? 'group' : 'account';

    if (merged.routingmode === 'group') {
      const chatId = await askRequired(rl, '请输入 --chat-id (oc_xxx): ', parseBoolean);
      merged.chatid = chatId;
    }

    if (!merged.agentid) {
      const existingAgentId = await askRequired(rl, '可选：请输入 --agent-id（留空则只新增账户，不绑路由）: ', parseBoolean, { allowSkip: true });
      if (existingAgentId) merged.agentid = existingAgentId;
    } else {
      const useCreatedAgent = await askYesNo(rl, `默认将路由绑定到新建 Agent "${merged.agentid}"，是否确认？(Y/n): `, parseBoolean, true);
      if (!useCreatedAgent) {
        const overrideId = await askRequired(rl, '请输入替代 --agent-id: ', parseBoolean);
        merged.agentid = overrideId;
      }
    }

    const dryRun = await askYesNo(rl, '先执行 dry-run 校验？(Y/n): ', parseBoolean, true);
    merged.dryrun = dryRun ? 'true' : 'false';

    if (!dryRun) {
      const restart = await askYesNo(rl, '写入后自动重启 Gateway 吗？(y/N): ', parseBoolean, false);
      merged.restart = restart ? 'true' : 'false';
    } else {
      merged.restart = 'false';
    }

    return merged;
  } finally {
    rl.close();
  }
}

module.exports = {
  runPreflightWizard
};
