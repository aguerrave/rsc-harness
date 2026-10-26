import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Two people in two days hit a bug that was already fixed. The fix existed and did not reach them:
// hooks are COPIES inside each project, nobody could say which version they had, and the update
// notice said "2.0.11 is out" in a stack of four notices — which the maintainer's own workspace had
// been ignoring for days, still on 2.0.4.
//
// The harness already states the rule in `suggest` §3: say what is wrong as a SYMPTOM. Someone who
// sees a red error after every turn updates when told that is what the update fixes.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CLI = join(ROOT, 'scripts', 'rsc.js');
const SESSION_START = join(ROOT, 'targets', 'session-start.mjs');
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

function project(installed) {
  const root = mkdtempSync(join(tmpdir(), 'rsc-upd-'));
  if (installed) {
    mkdirSync(join(root, '.rsc'), { recursive: true });
    writeFileSync(join(root, '.rsc', '.version'), `${installed}\n`);
    // These tests read the asking notice, which is what a project with auto-update off gets.
    writeFileSync(join(root, '.rsc', '.no-auto-update'), '');
  }
  return root;
}
function sessionStart(root, latestDoc) {
  const suggest = join(root, 'suggest-SKILL.md');
  writeFileSync(suggest, '# suggest\n');
  return spawnSync('node', [SESSION_START, suggest, root], {
    encoding: 'utf8',
    env: { ...process.env, RSC_NO_UPDATE_CHECK: '', RSC_LATEST: '', RSC_LATEST_JSON: JSON.stringify(latestDoc) },
  }).stdout;
}
const FIXES = [
  { fixedIn: '2.0.8', symptom: 'rsc doctor reports commandOrphans for skills that are installed' },
  { fixedIn: '2.0.11', symptom: 'Stop hook error: Hook JSON output validation failed' },
  { fixedIn: '2.0.12', symptom: 'session continuation can come from another git worktree' },
];

// --- rsc --version ------------------------------------------------------------

test('rsc --version prints the CLI version, offline', () => {
  for (const flag of ['--version', '-v', 'version']) {
    const out = spawnSync('node', [CLI, flag], { cwd: project(), encoding: 'utf8' }).stdout;
    assert.match(out, new RegExp(`rsc ${PKG.version.replace(/\./g, '\\.')}`), `${flag} → ${out}`);
  }
});

test('rsc --version names the version installed in this project, and says when it is behind', () => {
  const out = spawnSync('node', [CLI, '--version'], { cwd: project('2.0.4'), encoding: 'utf8' }).stdout;
  assert.match(out, /2\.0\.4/);
  assert.match(out, /github:aguerrave\/rsc-harness#v3\.3\.1-aguerrave\.1 rsc/, 'behind → the exact command to catch up');
});

test('rsc --version stays quiet about catching up when the project is current', () => {
  const out = spawnSync('node', [CLI, '--version'], { cwd: project(PKG.version), encoding: 'utf8' }).stdout;
  assert.doesNotMatch(out, /github:aguerrave\/rsc-harness#v3\.3\.1-aguerrave\.1 rsc/);
});

// --- doctor --------------------------------------------------------------------

test('doctor reports the CLI and installed versions, and whether the project is behind', async () => {
  const { doctor } = await import('../scripts/doctor.js');
  const root = project('2.0.4');
  const report = doctor({ target: 'claude', cwd: root, home: root });
  assert.deepEqual(report.versions, { cli: PKG.version, installed: '2.0.4', behind: true });
});

// --- the notice ------------------------------------------------------------------

test('fork ignores registry payloads, including hostile symptoms, and leaves files alone', () => {
  for (const rscFixes of [[], null, [{fixedIn:'99.0.0',symptom:'INJECTED'}]]) {
    const root = project('0.1.0');
    const out = sessionStart(root, {version:'99.0.0', rscFixes});
    assert.ok(!out.includes('INJECTED'));
    assert.ok(!out.includes('rsc update available'));
    assert.equal(readFileSync(join(root,'.rsc/.version'),'utf8').trim(),'0.1.0');
  }
});

test('the package’s own rscFixes are well formed and never point at the future', () => {
  const fixes = PKG.rscFixes;
  assert.ok(Array.isArray(fixes) && fixes.length > 0, 'rscFixes must be a non-empty array');
  const newer = (a, b) => {
    const pa = a.split('.').map(Number); const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) { if (pa[i] > pb[i]) return true; if (pa[i] < pb[i]) return false; }
    return false;
  };
  for (const f of fixes) {
    assert.match(f.fixedIn, /^\d+\.\d+\.\d+$/, `fixedIn must be a plain version: ${f.fixedIn}`);
    // CI bumps the patch AFTER the merge, so the author of a fix writes the NEXT patch. That one is
    // allowed; anything further is a typo that would name a symptom as fixed in a release that
    // never comes.
    // A prerelease (`2.1.0-0`) is how a minor or major is staged: CI's patch bump drops the suffix and
    // publishes `2.1.0` itself, so that is the next release, not `2.1.1`.
    const [base, pre] = PKG.version.split('-');
    const [ma, mi, pa] = base.split('.').map(Number);
    const nextRelease = pre ? base : `${ma}.${mi}.${pa + 1}`;
    assert.equal(newer(f.fixedIn, nextRelease), false, `${f.fixedIn} is beyond the next release (${nextRelease})`);
    assert.equal(typeof f.symptom, 'string');
    assert.ok(f.symptom.length > 0 && f.symptom.length <= 200, `symptom must be 1–200 chars: ${f.symptom}`);
    assert.doesNotMatch(f.symptom, /[\u0000-\u001f]/, 'one line, no control characters');
  }
});
