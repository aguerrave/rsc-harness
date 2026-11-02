# Validación de la distribución aguerrave — 2026-11-02

Base: upstream v3.7.5, cb9e051. Release propia: 3.7.5-aguerrave.1 (anterior: 3.4.0-aguerrave.1 sobre v3.4.0).

- Suite completa `node --test`: 1536 pruebas, 1533 PASS, 0 FAIL, 3 SKIP.
- `node scripts/build-manifest.js --validate` y `--check`: OK; 277 skills, 34 agentes y 53 comandos (upstream añade `tidy` preinstalada y otras; el fork mantiene sus 3 propias).
- `bash scripts/eval-lint.sh`: 277 skills, cero fallos. `drift:check` y `originality:check`: PASS.
- Conflictos de la fusión: versión/nombre del paquete, recuentos de skills en README y site, `targets/branch-guard.mjs` y `targets/auto-update.mjs`. Se conserva la identidad del fork y el arranque sin consultas a upstream; el aviso local de MemSlop (solo macOS) se porta al hook de Codex del fork.
- Las órdenes `npx @ericrisco/rsc…` nuevas de upstream (README, site, branch-guard, skill `tidy`) apuntan a la referencia fijada del fork.
- Pruebas que fijaban la referencia del fork actualizadas a v3.7.5-aguerrave.1.

Las claves, credenciales y datos de clientes no forman parte de esta distribución.
