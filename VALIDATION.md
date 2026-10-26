# Validación de la distribución aguerrave — 2026-10-26

Base: upstream v3.3.1, 20235e4. Release propia: 3.3.1-aguerrave.1 (anterior: 3.1.1-aguerrave.1 sobre v3.1.1).

- Suite completa `node --test --test-concurrency=4`: 1495 pruebas, 1492 PASS, 0 FAIL, 3 SKIP.
- `node scripts/build-manifest.js --validate` y `--check`: OK; 272 skills, 34 agentes y 53 comandos (upstream retiró 2 skills de diseño, el fork mantiene sus 3 propias).
- `bash scripts/eval-lint.sh`: 272 skills, cero fallos estructurales.
- Conflictos de la fusión: recuentos de skills, versión/nombre del paquete y comandos de instalación; se conserva la identidad del fork y se adoptan los contenidos de upstream. `skills/design-dna` y `skills/design/references/starting-point.md` se eliminan como en upstream (el fork solo cambiaba su comando de instalación).
- Pruebas que fijaban la referencia del fork actualizadas a v3.3.1-aguerrave.1.

Las claves, credenciales y datos de clientes no forman parte de esta distribución.
