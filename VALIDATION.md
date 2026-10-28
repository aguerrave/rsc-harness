# Validación de la distribución aguerrave — 2026-10-28

Base: upstream v3.4.0, 25d3892. Release propia: 3.4.0-aguerrave.1 (anterior: 3.3.1-aguerrave.1 sobre v3.3.1).

- Suite completa `node --test --test-concurrency=4`: 1500 pruebas, 1497 PASS, 0 FAIL, 3 SKIP.
- `node scripts/build-manifest.js --validate` y `--check`: OK; 272 skills, 34 agentes y 53 comandos (upstream añade `ux` preinstalada y retira `ui-engineering`; el fork mantiene sus 3 propias).
- `bash scripts/eval-lint.sh`: 272 skills, cero fallos estructurales.
- Conflictos de la fusión: versión/nombre del paquete (manifest.json, package.json, package-lock.json) y recuentos en site/llms.txt; se conserva la identidad del fork y se adopta el perfil minimal de 9 skills de upstream.
- Pruebas que fijaban la referencia del fork actualizadas a v3.4.0-aguerrave.1.

Las claves, credenciales y datos de clientes no forman parte de esta distribución.
