#!/usr/bin/env node
// idempiere-upstream.js — report what changed in the upstream sources of the
// iDempiere skills since their pinned commits (upstream/idempiere-sources.json).
//
//   node scripts/idempiere-upstream.js              report every source
//   node scripts/idempiere-upstream.js <id>         report one source
//   node scripts/idempiere-upstream.js --bump <id>  pin <id> to its current HEAD
//
// Nothing is copied into this repository: each source is cloned into a
// temporary directory (blobless) and removed afterwards. Exit code 1 means at
// least one source changed or its license status differs from the pin, so a
// CI job can open a review when it matters.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCK = join(ROOT, 'upstream', 'idempiere-sources.json');

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function inspect(source) {
  const dir = mkdtempSync(join(tmpdir(), `idempiere-upstream-${source.id}-`));
  try {
    git(dir, 'clone', '--quiet', '--filter=blob:none', '--no-checkout', '--branch', source.branch, source.repo, '.');
    const head = git(dir, 'rev-parse', 'HEAD');
    const files = git(dir, 'ls-tree', '--name-only', 'HEAD');
    const hasLicense = files.split('\n').some((name) => /^(LICEN[CS]E|COPYING)(\..*)?$/i.test(name));
    let commits = [];
    let changed = [];
    let pinMissing = false;
    if (head !== source.pinned) {
      try {
        git(dir, 'cat-file', '-e', `${source.pinned}^{commit}`);
        const range = `${source.pinned}..${head}`;
        const log = git(dir, 'log', '--format=%h %ad %s', '--date=short', range, '--', ...source.paths);
        commits = log ? log.split('\n') : [];
        const diff = git(dir, 'diff', '--name-status', source.pinned, head, '--', ...source.paths);
        changed = diff ? diff.split('\n') : [];
      } catch {
        pinMissing = true;
      }
    }
    return { head, hasLicense, commits, changed, pinMissing };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function main(argv) {
  const lock = JSON.parse(readFileSync(LOCK, 'utf8'));
  const bump = argv[0] === '--bump';
  const wanted = bump ? argv[1] : argv[0];
  if (bump && !wanted) throw new Error('usage: --bump <source-id>');
  const sources = lock.sources.filter((s) => !wanted || s.id === wanted);
  if (wanted && sources.length === 0) throw new Error(`unknown source: ${wanted}`);

  let attention = false;
  for (const source of sources) {
    const r = inspect(source);
    if (bump) {
      source.pinned = r.head;
      writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`);
      console.log(`${source.id}: pinned to ${r.head}`);
      continue;
    }
    const licenseNow = r.hasLicense ? 'present' : 'absent';
    const licensePinned = source.license ? 'present' : 'absent';
    const licenseChanged = licenseNow !== licensePinned && !(source.license || '').includes('per-file');
    const moved = r.head !== source.pinned;
    if (moved || licenseChanged) attention = true;

    console.log(`\n## ${source.id}  (${source.repo})`);
    console.log(`pinned ${source.pinned.slice(0, 7)}  head ${r.head.slice(0, 7)}  ${moved ? 'CHANGED' : 'up to date'}`);
    console.log(`license file: ${licenseNow}${licenseChanged ? '  <- differs from the pin, review reuse terms' : ''}`);
    if (source.tracks.length) console.log(`tracked by: ${source.tracks.join(', ')}`);
    if (r.pinMissing) console.log('pinned commit not found upstream (history rewritten?) — review the whole tree');
    if (r.commits.length) console.log(`commits touching ${source.paths.join(', ')}:\n  ${r.commits.join('\n  ')}`);
    if (r.changed.length) console.log(`files:\n  ${r.changed.join('\n  ')}`);
    if (moved && !r.commits.length && !r.pinMissing) console.log('new commits do not touch the tracked paths');
  }
  if (!bump) {
    console.log(attention
      ? '\nSomething changed. Review it, adapt the tracked skills, record the decision, then --bump the source.'
      : '\nAll sources match their pins.');
  }
  return attention ? 1 : 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  console.error(`idempiere-upstream: ${error.message}`);
  process.exitCode = 2;
}
