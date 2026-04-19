function resolveAgentPlanContext({ plan, options, sanitizeAgentId, validateAgentId, defaultWorkspaceForAgent, homeDir }) {
  const rawAgentId = options.agentid || options.newagentid || options.agentname || '';
  const agentId = sanitizeAgentId(rawAgentId || plan.coreRequirement);

  if (!validateAgentId(agentId)) {
    throw new Error(`Invalid generated agent id: ${agentId}`);
  }

  return {
    agentId,
    workspace: options.agentworkspace || defaultWorkspaceForAgent(homeDir, agentId)
  };
}

function createAgentViaOpenClaw({ agentId, workspace, model, runOpenClaw, extractJsonObject, parseAgentAddResult }) {
  const addArgs = ['agents', 'add', agentId, '--workspace', workspace, '--non-interactive', '--json'];
  if (model) addArgs.push('--model', model);

  const addResult = runOpenClaw(addArgs);
  const addOutput = `${addResult.stdout}\n${addResult.stderr}`;
  const addParsed = parseAgentAddResult(extractJsonObject, addOutput);

  if (addResult.error || addResult.code !== 0 || !addParsed) {
    throw new Error(`Failed to create agent. Output:\n${addOutput}`);
  }

  return addParsed;
}

function setAgentIdentity({ agentId, workspace, identityName, runOpenClaw }) {
  const setIdentityArgs = ['agents', 'set-identity', '--agent', agentId, '--workspace', workspace, '--name', identityName, '--json'];
  return runOpenClaw(setIdentityArgs);
}

module.exports = {
  resolveAgentPlanContext,
  createAgentViaOpenClaw,
  setAgentIdentity
};
