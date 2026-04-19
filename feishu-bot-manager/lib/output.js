function printSummary({ formatSummaryLines, log, configPath, accountId, mode, agentId, chatId, dryRun, setDmScope, restart }) {
  const lines = formatSummaryLines({
    configPath,
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

function showRoutingOptions(colors) {
  console.log(`
${colors.bold}Routing Modes${colors.reset}

${colors.bold}1) account${colors.reset}
  Route all messages from one Feishu account to one Agent.

${colors.bold}2) group${colors.reset}
  Route one Feishu group (peer.id = oc_xxx) to one Agent.

Group routing usually has higher matching priority than account routing.
`);
}

function showHelp({ colors, dmscopeValue, feishuCreateUrl }) {
  showRoutingOptions(colors);
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
  --set-dm-scope          Run: openclaw config set session.dmScope "${dmscopeValue}"
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

Create Feishu bot first: ${feishuCreateUrl}
`);
}

module.exports = {
  printSummary,
  showRoutingOptions,
  showHelp
};
