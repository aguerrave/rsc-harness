# Validación de la distribución aguerrave — 2026-11-04

Base: upstream v4.0.4, d9d6bb3. Release propia: 4.0.4-aguerrave.1 (anterior: 3.7.5-aguerrave.1 sobre v3.7.5).

- Suite completa `node --test`: 1635 pruebas, 1632 PASS, 0 FAIL, 3 SKIP.
- `node scripts/build-manifest.js --validate` y `--check`: OK; 277 skills, 34 agentes y 53 comandos (upstream renombra `sdd` a `asdd`; el fork mantiene sus 3 propias).
- `bash scripts/eval-lint.sh`: 277 skills, cero fallos. `drift:check` y `originality:check`: PASS.
- Conflictos de la fusión: versión/nombre del paquete, `scripts/rsc.js`, `targets/branch-guard.mjs`, skills `review`, `suggest` e `implement` (`task-brief`). Se conserva la identidad del fork.
- `task-brief`: mawk no resuelve `#{2,3}` seguido de más patrón; se mantiene la forma `###?` del fork sobre el nuevo parser de upstream.
- Las órdenes `npx @ericrisco/rsc…` nuevas de upstream (`rsc risk`, `spec gate`, `review ledger|escapes`, ASDD) apuntan a la referencia fijada del fork; en `suggest` quedan como `rsc …`.
- Pruebas que fijaban la referencia del fork actualizadas a v4.0.4-aguerrave.1.

Las claves, credenciales y datos de clientes no forman parte de esta distribución.
