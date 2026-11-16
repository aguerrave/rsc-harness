import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(readFileSync(join(ROOT, 'upstream', 'idempiere-sources.json'), 'utf8'));

test('every upstream source is pinned to a full commit and names its paths', () => {
  const ids = new Set();
  for (const s of lock.sources) {
    assert.ok(!ids.has(s.id), `duplicate source id ${s.id}`);
    ids.add(s.id);
    assert.match(s.repo, /^https:\/\/github\.com\/[^/]+\/[^/]+\.git$/, `${s.id}: repo must be a public https URL`);
    assert.match(s.pinned, /^[0-9a-f]{40}$/, `${s.id}: pinned must be a full sha`);
    assert.ok(Array.isArray(s.paths) && s.paths.length > 0, `${s.id}: paths required`);
    assert.ok(Array.isArray(s.tracks), `${s.id}: tracks must be a list`);
  }
});

test('every tracked skill exists in the catalog', () => {
  for (const s of lock.sources) {
    for (const id of s.tracks) {
      assert.ok(existsSync(join(ROOT, 'skills', id, 'SKILL.md')), `${s.id} tracks missing skill ${id}`);
    }
  }
});

test('skills adapted from an unlicensed source are not tracked as imported', () => {
  for (const s of lock.sources.filter((x) => x.license === null)) {
    for (const id of s.tracks) {
      const skill = readFileSync(join(ROOT, 'skills', id, 'SKILL.md'), 'utf8');
      const origin = skill.match(/^origin: (.+)$/m)?.[1] || '';
      assert.ok(!origin.includes(s.repo.split('/').slice(-2).join('/').replace(/\.git$/, '')),
        `${id} claims origin in unlicensed ${s.id}`);
    }
  }
});
