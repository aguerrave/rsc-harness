# Validación de la distribución aguerrave — 2026-11-12

Base: upstream v4.1.5, 051c213. Release propia: 4.1.5-aguerrave.1 (anterior: 4.0.4-aguerrave.1 sobre v4.0.4).

- Suite completa `node --test`: 1798 pruebas, 1795 PASS, 0 FAIL, 3 SKIP.
- `node scripts/build-manifest.js --validate` y `--check`: OK; 276 skills, 34 agentes y 53 comandos (upstream 273: `security-audit` reemplaza a `secure-coding` y `security-scan`; el fork mantiene sus 3 propias).
- `bash scripts/eval-lint.sh`, `drift:check` y `originality:check`: PASS.
- Conflictos de la fusión: identidad y versión del paquete, recuentos de skills en README y site, `manifest-file.js` (se conserva `source` junto al nuevo `worktreeManager`), `targets/index.js` (se conserva la publicación nativa de las skills iDempiere para Codex), `risk.js`, `asdd-gate.mjs`, `recommend-skills.md` y `task-brief` (upstream adopta la forma `###?` que el fork ya usaba).
- Las órdenes `npx @ericrisco/rsc…` y `npm install -g @ericrisco/rsc` nuevas apuntan a la referencia fijada del fork.
- `cli-invocation.js`: con un `rsc` instalado, también la orden fijada del fork se sustituye por `rsc`, como upstream hace con la orden sin versión.
- `worktree-reaper.mjs`: en Linux, `orca` suele ser el lector de pantalla de GNOME; upstream lo ejecutaba (`orca worktree current --json`), arrancaba el lector y marcaba todos los worktrees como `manager-unknown` (45 pruebas fallaban en esta máquina con upstream sin tocar). El fork no lo consulta cuando su cabecera es la de GNOME Orca; prueba añadida en `tests/orca-worktrees.test.js`.
- La sección iDempiere del README va antes de la licencia, para respetar el pie *Made in Andorra* de upstream.

Las claves, credenciales y datos de clientes no forman parte de esta distribución.
