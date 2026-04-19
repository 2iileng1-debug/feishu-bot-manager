const fs = require('fs');
const path = require('path');

function loadConfig(configPath) {
  const content = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(content);
}

function saveConfig(configPath, config) {
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}

function createBackup(configPath, backupDir) {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `openclaw.json.${timestamp}.bak`);
  fs.copyFileSync(configPath, backupPath);
  return backupPath;
}

function validateWithOpenClawSchema({
  config,
  configPath,
  runOpenClaw,
  extractJsonObject,
  openclawBin,
  envBase
}) {
  const tempPath = path.join(path.dirname(configPath), `.openclaw.validate.${Date.now()}.${process.pid}.json`);
  fs.writeFileSync(tempPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  try {
    const env = { ...(envBase || process.env), OPENCLAW_CONFIG_PATH: tempPath };
    const result = runOpenClaw(['config', 'validate', '--json'], { env });

    if (result.error) {
      return {
        valid: false,
        issues: [{ path: 'config', message: `Failed to run ${openclawBin}: ${result.error.message}` }]
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

module.exports = {
  loadConfig,
  saveConfig,
  createBackup,
  validateWithOpenClawSchema
};
