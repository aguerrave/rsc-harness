import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {updateNotice} from '../targets/auto-update.mjs';
import {upgradePlan,runUpgrade} from '../scripts/lib/upgrade.js';
import {writeManifest,readManifest} from '../scripts/lib/manifest-file.js';
test('fork startup never queries upstream',async()=>{
 const fetchBefore=globalThis.fetch;globalThis.fetch=()=>{throw new Error('No network allowed');};
 try{assert.equal(await updateNotice('/does-not-exist',{RSC_LATEST:'99.0.0'}),'');}finally{globalThis.fetch=fetchBefore;}
});
test('upgrade points exclusively to the pinned fork without executing in dry-run',()=>{
 const p=upgradePlan({targets:['claude','codex']});
 assert.equal(p.source,'https://github.com/aguerrave/rsc-harness');
 assert.match(p.installCommand,/github:aguerrave\/rsc-harness#v3\.1\.1-aguerrave\.1/);
 assert.ok(!p.syncCommand.includes('@ericrisco/rsc'));
 assert.equal(runUpgrade({global:true,dryRun:true}).ran,false);
});
test('manifest records fork provenance and preserves user decisions',()=>{
 const dir=mkdtempSync(join(tmpdir(),'rsc-fork-manifest-'));
 writeManifest(dir,{targets:['codex'],skills:['ftd'],optOuts:['trunk-guard'],memory:false});
 const d=readManifest(dir);assert.equal(d.source.repository,'https://github.com/aguerrave/rsc-harness');
 assert.equal(d.source.ref,'v3.1.1-aguerrave.1');assert.deepEqual(d.targets,['codex']);assert.equal(d.memory,false);
 assert.equal(JSON.parse(readFileSync(join(dir,'.rsc.json'))).source.upstreamVersion,'3.1.1');
});
