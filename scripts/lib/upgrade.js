import {spawnSync} from 'node:child_process';
import {SOURCE,INSTALL_SPEC,RUN_COMMAND} from './distribution.js';
export function upgradePlan({targets=[]}={}) {
 return {source:SOURCE.repository,installCommand:`npm install -g ${INSTALL_SPEC}`,syncCommand:`${RUN_COMMAND} sync${targets.length ? ` --target ${targets.join(',')}` : ''}`};
}
export function runUpgrade({targets=[],dryRun=false,global=false}={}) {
 const plan=upgradePlan({targets});
 if(dryRun || !global) return {ran:false,plan};
 const result=spawnSync('npm',['install','-g',INSTALL_SPEC],{stdio:'inherit'});
 if(result.status !== 0) throw new Error('Fork upgrade failed');
 return {ran:true,plan};
}
