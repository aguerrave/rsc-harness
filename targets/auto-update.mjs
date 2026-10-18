#!/usr/bin/env node
// Fork releases are explicit and pinned. Never query or install upstream npm releases.
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function updateNotice() { return ''; }
export function hookOutput(target,notice) {
 if (!notice) return target === 'agent' ? '' : '{}';
 if (target === 'agent') return notice;
 if (target === 'cursor') return JSON.stringify({additional_context:notice});
 return JSON.stringify({hookSpecificOutput:{hookEventName:'SessionStart',additionalContext:notice}});
}
if(process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
 const hook=process.argv[2] === 'hook';
 process.stdout.write(hook ? '{}\n' : 'rsc uses the aguerrave fork; automatic upstream updates are disabled.\n');
}
