import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {applyInstall,syncInstalled} from '../scripts/install-apply.js';
import {targetPaths} from '../targets/index.js';
import {readManifest} from '../scripts/lib/manifest-file.js';
const ids=['idempiere-implementation','idempiere-plugins','idempiere-deployment'];
for(const target of ['claude','codex','cursor']) test(`fork installs and syncs its three skills on ${target} without altering project code`,async()=>{
 const cwd=mkdtempSync(join(tmpdir(),'rsc-fork-install-'));execFileSync('git',['init','-q'],{cwd});
 writeFileSync(join(cwd,'client-code.java'),'// customer-owned code\n');
 await applyInstall({cwd,target,skillIds:ids});
 await syncInstalled({cwd,target});
 const m=readManifest(cwd);assert.equal(m.source.repository,'https://github.com/aguerrave/rsc-harness');
 for(const id of ids)assert.ok(m.skills.includes(id));
 const paths=targetPaths(target,undefined,cwd);
 for(const id of ids) {
   assert.ok(existsSync(paths.skillDir(id)));
   if(target === 'codex') {
    const native=readFileSync(join(cwd,'.agents/skills',id,'SKILL.md'),'utf8');
    assert.match(native,/rsc:idempiere-native/);assert.ok(!native.includes('origin:'));
   }
  }
 assert.equal(readFileSync(join(cwd,'client-code.java'),'utf8'),'// customer-owned code\n');
 const update=readFileSync(join(cwd,'.rsc/auto-update.mjs'),'utf8');assert.ok(!update.includes('registry.npmjs.org'));
 if(target==='claude')assert.match(readFileSync(join(cwd,'.claude/rsc-bootstrap.mjs'),'utf8'),/github:aguerrave\/rsc-harness/);
});
