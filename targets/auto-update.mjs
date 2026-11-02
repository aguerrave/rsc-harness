#!/usr/bin/env node
// Fork releases are explicit and pinned. Never query or install upstream npm releases.
import {existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
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
 const target=hook ? String(process.argv[3] || 'agent') : 'agent';
 const root=(hook ? process.argv[4] : process.argv[2]) || process.cwd();
 let notice='';
 // Codex has no session-start.mjs, so the MemSlop offer (local, macOS only) rides this hook as upstream does.
 if (target === 'codex' && existsSync(join(root,'02-DOCS','wiki','harness','user-profile.md'))) {
  try { notice=(await import('./memslop-offer.mjs')).memslopNotice().trim(); } catch { /* no offer */ }
 }
 process.stdout.write(hook ? `${hookOutput(target,notice)}\n` : 'rsc uses the aguerrave fork; automatic upstream updates are disabled.\n');
}
