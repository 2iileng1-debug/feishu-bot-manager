function applyAccountRouting({ candidate, options, mode, accountId, upsertBinding, log }) {
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
}

function validateCandidateConfig({ candidate, validateConfig, validateWithSchema, log }) {
  const localErrors = validateConfig(candidate);
  if (localErrors.length > 0) {
    log.error('Local validation failed:');
    localErrors.forEach((item) => log.preview(`  - ${item}`));
    return { ok: false };
  }

  const schemaResult = validateWithSchema(candidate);
  if (!schemaResult.valid) {
    log.error('OpenClaw schema validation failed. Write blocked.');
    for (const issue of schemaResult.issues) {
      log.preview(`  - ${issue.path || 'unknown'}: ${issue.message || 'invalid'}`);
    }
    return { ok: false };
  }

  return { ok: true };
}

function finalizeConfigApply({
  candidate,
  dryRun,
  createBackup,
  saveConfig,
  log,
  configPath,
  getRestoreCommand,
  platform,
  setDmScope,
  dmScopeValue,
  runOpenClaw,
  restart
}) {
  if (dryRun) {
    log.warning('Dry run only. No files were modified.');
    return;
  }

  const backupPath = createBackup();
  saveConfig(candidate);
  log.success(`Config written: ${configPath}`);
  log.success(`Backup created: ${backupPath}`);

  if (setDmScope) {
    const result = runOpenClaw(['config', 'set', 'session.dmScope', dmScopeValue]);
    if (result.error || result.code !== 0) {
      log.warning('Failed to set dmScope automatically. Please run manually:');
      console.log(`  openclaw config set session.dmScope "${dmScopeValue}"`);
    } else {
      log.success(`dmScope set to ${dmScopeValue}`);
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
  console.log(`  ${getRestoreCommand(backupPath, configPath, platform)}`);
}

module.exports = {
  applyAccountRouting,
  validateCandidateConfig,
  finalizeConfigApply
};
