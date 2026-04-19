const { spawnSync } = require('child_process');

function quoteWindowsArg(arg) {
  const text = String(arg);
  if (/^[a-zA-Z0-9._:/=-]+$/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
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

function createOpenClawRunner({ openclawBin, platform, getProfile, envBase }) {
  function withOpenClawProfile(args) {
    const profile = getProfile ? getProfile() : '';
    if (!profile) return args;
    return ['--profile', profile, ...args];
  }

  function runOpenClaw(args, opts = {}) {
    const finalArgs = withOpenClawProfile(args);
    let child;

    if (platform === 'win32') {
      const command = [openclawBin, ...finalArgs.map(quoteWindowsArg)].join(' ');
      child = spawnSync('cmd.exe', ['/d', '/s', '/c', command], {
        encoding: 'utf8',
        shell: false,
        stdio: opts.stdio || 'pipe',
        env: opts.env || envBase || process.env
      });
    } else {
      child = spawnSync(openclawBin, finalArgs, {
        encoding: 'utf8',
        shell: false,
        stdio: opts.stdio || 'pipe',
        env: opts.env || envBase || process.env
      });
    }

    return {
      code: child ? child.status : 1,
      error: child ? child.error || null : new Error('failed to spawn openclaw'),
      stdout: child ? child.stdout || '' : '',
      stderr: child ? child.stderr || '' : ''
    };
  }

  return {
    withOpenClawProfile,
    runOpenClaw
  };
}

module.exports = {
  quoteWindowsArg,
  extractJsonObject,
  createOpenClawRunner
};
