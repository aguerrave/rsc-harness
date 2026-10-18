# Validación de la distribución aguerrave — 2026-10-18

Base: upstream v3.1.1, ce60880aabf782cfafa1d0ce2a7f3bd5d89b6c55.
Release propia: 3.1.1-aguerrave.1.

- Suite completa `node --test --test-concurrency=4`: 1540 pruebas, 1538 PASS, 0 FAIL, 2 SKIP.
- SKIP: copia materializada de danger-guard ausente en checkout limpio; variación de mayúsculas de ruta inexistente en sistema sensible a mayúsculas.
- `node scripts/build-manifest.js --validate` y `--check`: OK; 274 skills, 34 agentes y 53 comandos.
- `bash scripts/eval-lint.sh`: 274 skills, cero fallos estructurales. Las nuevas tienen cinco casos positivos, cuatro negativos y un escenario de comportamiento cada una. No es una certificación de sus respuestas por un modelo.
- Instalación y resincronización aisladas en Claude, Codex y Cursor: pasan, preservando un archivo de código del cliente.
- Codex recibe además las skills propias en .agents/skills con frontmatter nativo y detección de colisiones.
- El paquete tar contiene las tres skills y el CLI identifica la versión propia. upgrade --dry-run señala la referencia fija del fork.
- El arranque no consulta ni instala versiones npm upstream; el manifiesto conserva la procedencia y decisiones del proyecto.
- El fallo de task-brief con awk fue reproducido también en upstream sin modificaciones. La expresión de encabezados se corrigió para evitar intervalos no portables; las pruebas existentes ahora pasan.

Los resultados completos de la migración se guardan en el proyecto de conciliación, en 02-DOCS/wiki/evidence/rsc-fork/ y rsc-fork-migration.json. Las claves, credenciales y datos de clientes no forman parte de esta distribución.
