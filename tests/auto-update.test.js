import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// The update notice asked, and asking depended on an agent relaying it: people kept running bugs
// that were already fixed. Now a release in the same major installs itself in the background, and a
// new major still asks. `.rsc/.no-auto-update` brings the question back for every release.
//
// `npx` is replaced by a fake that records how it was called and does what a successful sync does to
// the one file the hook reads: it writes the new version into `.rsc/.version`.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SESSION_START = join(ROOT, 'targets', 'session-start.mjs');

function project(installed, { optOut = false, targets = ['claude', 'codex'] } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'rsc-auto-'));
  mkdirSync(join(root, '.rsc'), { recursive: true });
  writeFileSync(join(root, '.rsc', '.version'), `${installed}\n`);
  writeFileSync(join(root, '.rsc.json'), JSON.stringify({ version: 1, targets, skills: [] }));
  if (optOut) writeFileSync(join(root, '.rsc', '.no-auto-update'), '');
  const fake = join(root, 'fake-npx.mjs');
  writeFileSync(fake, `
import { writeFileSync } from 'node:fs';
writeFileSync(${JSON.stringify(join(root, 'called.json'))}, JSON.stringify({ args: process.argv.slice(2), to: process.env.RSC_AUTO_UPDATE_TO }));
if (!process.env.FAKE_FAIL) writeFileSync(${JSON.stringify(join(root, '.rsc', '.version'))}, process.env.RSC_AUTO_UPDATE_TO + '\\n');
`);
  return { root, fake };
}

function sessionStart({ root, fake }, latest, extra = {}) {
  const suggest = join(root, 'suggest-SKILL.md');
  writeFileSync(suggest, '# suggest\n');
  return spawnSync('node', [SESSION_START, suggest, root], {
    encoding: 'utf8',
    env: {
      ...process.env,
      RSC_NO_UPDATE_CHECK: '',
      RSC_LATEST_JSON: '',
      RSC_LATEST: latest,
      RSC_AUTO_UPDATE_CMD: JSON.stringify([process.execPath, fake]),
      ...extra,
    },
  }).stdout;
}

// The background process is detached: wait for its footprint, never for the hook.
function waitFor(path, ms = 5000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (existsSync(path)) return true;
    spawnSync(process.execPath, ['-e', 'setTimeout(()=>{},50)']);
  }
  return false;
}
const state = (root) => JSON.parse(readFileSync(join(root, '.rsc', 'auto-update.json'), 'utf8'));
const writeState = (root, s) => writeFileSync(join(root, '.rsc', 'auto-update.json'), JSON.stringify(s));
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

test('fork startup ignores newer npm versions without touching local version', async () => {
  const { updateNotice } = await import('../targets/auto-update.mjs');
  for (const latest of ['3.1.2', '4.0.0', '99.0.0']) {
    const { root } = project('3.1.1');
    assert.equal(await updateNotice(root, {RSC_LATEST: latest}), '');
    assert.equal(readFileSync(join(root, '.rsc/.version'), 'utf8').trim(), '3.1.1');
    assert.ok(!existsSync(join(root, '.rsc/auto-update.json')));
  }
});

test('standalone module explicitly identifies fork update policy; hook output remains silent', () => {
  const module = join(ROOT, 'targets/auto-update.mjs');
  const plain = spawnSync('node', [module], {encoding:'utf8'});
  assert.equal(plain.status, 0); assert.match(plain.stdout, /aguerrave fork/);
  for(const target of ['claude','codex','cursor']) {
    const hook = spawnSync('node', [module,'hook',target], {encoding:'utf8'});
    assert.equal(hook.status,0); assert.deepEqual(JSON.parse(hook.stdout),{});
  }
});

test('wiring: Codex, Gemini and Cursor get a session-start hook beside whatever is there', async () => {
  const { wireUpdate, unwireUpdate } = await import('../targets/update-wiring.js');
  for (const [target, file, event] of [['codex', '.codex/hooks.json', 'SessionStart'], ['gemini', '.gemini/settings.json', 'SessionStart'], ['cursor', '.cursor/hooks.json', 'sessionStart']]) {
    const cwd = mkdtempSync(join(tmpdir(), `rsc-wire-${target}-`));
    mkdirSync(dirname(join(cwd, file)), { recursive: true });
    writeFileSync(join(cwd, file), JSON.stringify({ hooks: { [event]: [{ hooks: [{ type: 'command', command: 'node mine.mjs' }] }] } }));
    wireUpdate(target, cwd);
    wireUpdate(target, cwd); // idempotent
    const wired = JSON.parse(readFileSync(join(cwd, file), 'utf8')).hooks[event];
    assert.equal(wired.length, 2, `${target}: the user's hook plus one of ours`);
    assert.match(JSON.stringify(wired), new RegExp(`auto-update\\.mjs.*hook ${target}`));
    assert.ok(existsSync(join(cwd, '.rsc', 'auto-update.mjs')), `${target}: module copied`);
    unwireUpdate(target, cwd);
    const left = JSON.parse(readFileSync(join(cwd, file), 'utf8')).hooks[event];
    assert.deepEqual(left, [{ hooks: [{ type: 'command', command: 'node mine.mjs' }] }], `${target}: unwire leaves the user's hook`);
  }
});

test('wiring: an assistant with no hook still gets the module the agent is told to run', async () => {
  const { wireUpdate } = await import('../targets/update-wiring.js');
  const cwd = mkdtempSync(join(tmpdir(), 'rsc-wire-aider-'));
  assert.equal(wireUpdate('aider', cwd).mode, 'agent');
  assert.ok(existsSync(join(cwd, '.rsc', 'auto-update.mjs')));
  assert.equal(wireUpdate('claude', cwd).mode, 'hook');
});

// OpenCode's first call is its title generator: a notice handed over only once never reached the
// agent (seen with OpenCode 1.18.34). So every call carries it, and says to mention it once.
test('the rules file of an assistant without hooks identifies the pinned fork policy', async () => {
  const { applyInstall } = await import('../scripts/install-apply.js');
  for (const [target, file] of [['aider', 'CONVENTIONS.md'], ['windsurf', '.windsurf/rules/rsc-suggest.md']]) {
    const cwd = mkdtempSync(join(tmpdir(), `rsc-rules-${target}-`));
    await applyInstall({ skillIds: ['suggest'], target, cwd });
    assert.ok(existsSync(join(cwd, '.rsc', 'auto-update.mjs')), `${target}: the module is there to run`);
    const rules = readFileSync(join(cwd, ...file.split('/')), 'utf8');
    assert.match(rules, /aguerrave fork at a pinned release/, `${target}: the fork source is explicit`);
  }
  // Claude Code checks from its hook: its always-on body does not carry the instruction.
  assert.doesNotMatch(readFileSync(join(ROOT, 'skills', 'suggest', 'SKILL.md'), 'utf8'), /auto-update\.mjs/);
});
